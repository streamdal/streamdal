package streamdal

import (
	"context"
	"net"
	"sync"
	"time"

	"github.com/streamdal/go-sdk/server"

	"google.golang.org/grpc"

	"github.com/google/uuid"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/streamdal/go-sdk/logger/loggerfakes"
	"github.com/streamdal/go-sdk/metrics/metricsfakes"
	"github.com/streamdal/go-sdk/server/serverfakes"
	"github.com/streamdal/protos/build/go/protos"
)

var _ = Describe("Tail", func() {
	Context("CRUD methods", func() {
		var s *Streamdal
		var aud *protos.Audience
		var tail *Tail
		var tailID string

		BeforeEach(func() {
			s = &Streamdal{
				tailsMtx: &sync.RWMutex{},
				tails:    make(map[string]map[string]*Tail),
				config: &Config{
					Logger: &loggerfakes.FakeLogger{},
				},
			}

			tailID = uuid.New().String()

			aud = &protos.Audience{
				OperationName: "test-operation",
				ServiceName:   "test-service",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				ComponentName: "test-component",
			}

			tail = &Tail{
				Request: &protos.Command{
					Command: &protos.Command_Tail{
						Tail: &protos.TailCommand{
							Request: &protos.TailRequest{
								XId:      &tailID,
								Audience: aud,
							},
						},
					},
				},
			}
		})

		It("should set tailing", func() {
			s.setTailing(tail)
			Expect(len(s.tails)).To(Equal(1))
		})

		It("should get tail", func() {
			s.setTailing(tail)
			got := s.getTail(aud)
			Expect(len(got)).To(Equal(1))
			Expect(got).To(HaveKey(tailID))
		})

		It("should remove tail", func() {
			s.setTailing(tail)
			s.removeTail(aud, tailID)
			Expect(len(s.tails)).To(Equal(0))
		})
	})

	Context("ShipResponse", func() {
		It("should drop message if we're below the threshold", func() {
			ctx, cancel := context.WithCancel(context.Background())

			fakeMetrics := &metricsfakes.FakeIMetrics{}
			fakeServer := &serverfakes.FakeIServerClient{}

			outboundCh := make(chan *protos.TailResponse, 1)

			tail := &Tail{
				Request:         &protos.Command{},
				CancelFunc:      cancel,
				outboundCh:      outboundCh,
				streamdalServer: fakeServer,
				metrics:         fakeMetrics,
				cancelCtx:       ctx,
				lastMsg:         time.Now(),
				log:             &loggerfakes.FakeLogger{},
			}

			tail.ShipResponse(&protos.TailResponse{})

			Expect(outboundCh).ShouldNot(Receive())
			Expect(fakeMetrics.IncrCallCount()).To(Equal(1))
		})

		It("should send tail response", func() {
			ctx, cancel := context.WithCancel(context.Background())

			fakeMetrics := &metricsfakes.FakeIMetrics{}
			fakeServer := &serverfakes.FakeIServerClient{}

			outboundCh := make(chan *protos.TailResponse, 1)

			tail := &Tail{
				Request:         &protos.Command{},
				CancelFunc:      cancel,
				outboundCh:      outboundCh,
				streamdalServer: fakeServer,
				metrics:         fakeMetrics,
				cancelCtx:       ctx,
				lastMsg:         time.Time{},
				log:             &loggerfakes.FakeLogger{},
			}

			time.Sleep(MinTailResponseIntervalMS * 2 * time.Millisecond)

			tail.ShipResponse(&protos.TailResponse{})

			Expect(outboundCh).Should(Receive())
			Expect(fakeMetrics.IncrCallCount()).To(Equal(0))
		})
	})

	Context("sendTail", func() {
		It("should send tails", func() {
			ctx, cancel := context.WithCancel(context.Background())

			fakeMetrics := &metricsfakes.FakeIMetrics{}
			fakeServer := &serverfakes.FakeIServerClient{}

			outboundCh := make(chan *protos.TailResponse, 1)

			aud := &protos.Audience{
				OperationName: "test-operation",
				ServiceName:   "test-service",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				ComponentName: "test-component",
			}

			pipelineID := uuid.New().String()

			tail := &Tail{
				Request: &protos.Command{
					Command: &protos.Command_Tail{
						Tail: &protos.TailCommand{
							Request: &protos.TailRequest{
								XId:        stringPtr(uuid.New().String()),
								PipelineId: &pipelineID,
								Audience:   aud,
							},
						},
					},
				},
				CancelFunc:      cancel,
				outboundCh:      outboundCh,
				streamdalServer: fakeServer,
				metrics:         fakeMetrics,
				cancelCtx:       ctx,
				lastMsg:         time.Now(),
				log:             &loggerfakes.FakeLogger{},
			}

			time.Sleep(time.Second)

			s := &Streamdal{
				tailsMtx: &sync.RWMutex{},
				tails:    make(map[string]map[string]*Tail),
			}

			s.setTailing(tail)

			Expect(len(s.tails)).To(Equal(1))

			s.sendTail(aud, pipelineID, []byte(``), []byte(``))
			Expect(outboundCh).Should(Receive())
		})
	})

	Context("startTailAudience", func() {
		It("Starts and stops tail", func() {

			lis, err := net.Listen("tcp", ":9990")
			Expect(err).To(BeNil())

			srv := grpc.NewServer()
			protos.RegisterInternalServer(srv, &InternalServer{})

			go func() {
				if err := srv.Serve(lis); err != nil {
					panic("failed to serve: " + err.Error())
				}
			}()

			// Give gRPC a moment to startup
			time.Sleep(time.Second)

			serverClient, err := server.New("localhost:9990", "1234")
			Expect(err).To(BeNil())

			s := &Streamdal{
				tailsMtx:     &sync.RWMutex{},
				tails:        make(map[string]map[string]*Tail),
				audiences:    map[string]struct{}{},
				audiencesMtx: &sync.RWMutex{},
				config: &Config{
					Logger:      &loggerfakes.FakeLogger{},
					ShutdownCtx: context.Background(),
				},
				metrics:      &metricsfakes.FakeIMetrics{},
				serverClient: serverClient,
			}

			aud := &protos.Audience{
				OperationName: "test-operation",
				ServiceName:   "test-service",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				ComponentName: "test-component",
			}

			// Must know about audience before we can tail it
			s.addAudience(context.Background(), aud)

			pipelineID := uuid.New().String()

			cmd := &protos.Command{
				Audience: aud,
				Command: &protos.Command_Tail{
					Tail: &protos.TailCommand{
						Request: &protos.TailRequest{
							Type:       protos.TailRequestType_TAIL_REQUEST_TYPE_START,
							XId:        stringPtr(uuid.New().String()),
							PipelineId: &pipelineID,
							Audience:   aud,
						},
					},
				},
			}

			err = s.startTailAudience(context.Background(), cmd)
			Expect(err).To(BeNil())

			// Wait for goroutine workers to spin up
			time.Sleep(time.Second)

			tail := s.getTail(aud)
			Expect(len(tail)).To(Equal(1))
			tail[cmd.GetTail().Request.GetXId()].outboundCh <- &protos.TailResponse{}

			cmd.GetTail().GetRequest().Type = protos.TailRequestType_TAIL_REQUEST_TYPE_STOP

			err = s.stopTailAudience(context.Background(), cmd)
			Expect(err).To(BeNil())

			// Wait for loopers to quit
			time.Sleep(time.Second)

			Expect(len(s.tails)).To(Equal(0))
		})
	})

	Context("stopTailAudience", func() {
		var s *Streamdal
		var aud *protos.Audience
		var cmd *protos.Command

		BeforeEach(func() {
			s = &Streamdal{
				tails:        map[string]map[string]*Tail{},
				tailsMtx:     &sync.RWMutex{},
				audiences:    map[string]struct{}{},
				audiencesMtx: &sync.RWMutex{},
				config: &Config{
					Logger: &loggerfakes.FakeLogger{},
				},
			}

			aud = &protos.Audience{
				OperationName: "test-operation",
				ServiceName:   "test-service",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				ComponentName: "test-component",
			}

			cmd = &protos.Command{
				Audience: aud,
				Command: &protos.Command_Tail{
					Tail: &protos.TailCommand{
						Request: &protos.TailRequest{
							Type:       protos.TailRequestType_TAIL_REQUEST_TYPE_START,
							XId:        stringPtr(uuid.New().String()),
							PipelineId: stringPtr(uuid.New().String()),
							Audience:   aud,
						},
					},
				},
			}
		})

		It("ignores unknown audience", func() {
			got := s.stopTailAudience(context.Background(), cmd)
			Expect(got).To(BeNil())
		})

		It("ignores unknown tail", func() {
			s.audiences[audToStr(aud)] = struct{}{}

			got := s.stopTailAudience(context.Background(), cmd)
			Expect(got).To(BeNil())
		})
	})
})
