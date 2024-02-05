package pubsub

import (
	"strconv"
	"sync"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/streamdal/streamdal/apps/server/util"
)

var _ = Describe("PubSub", func() {
	Describe("Listen", func() {
		It("should receive published message", func() {
			ps := New()
			wg := &sync.WaitGroup{}
			readyWg := &sync.WaitGroup{}
			readyWg.Add(1)
			wg.Add(1)

			go func() {
				defer GinkgoRecover()
				defer wg.Done()

				// goroutine has started and is about to go into select
				readyWg.Done()

				select {
				case msg := <-ps.Listen("test"):
					Expect(msg).To(Equal("foobar"))
				case <-time.After(time.Second):
					Fail("timed out waiting for published message")
				}
			}()

			// Give goroutine some ms to get to select
			time.Sleep(time.Millisecond * 100)

			ps.Publish("test", "foobar")
			wg.Wait()
		})

		It("should not message listeners for other topics", func() {
			ps := New()
			wg := &sync.WaitGroup{}
			readyWg := &sync.WaitGroup{}
			readyWg.Add(1)
			wg.Add(1)

			go func() {
				defer GinkgoRecover()
				defer wg.Done()

				readyWg.Done()

				for {
					select {
					case <-ps.Listen("test1"):
						// fmt.Println("received message on test1 (as expected): " + msg)
						continue
					case msg := <-ps.Listen("test2"):
						Fail("received message on wrong topic: " + msg.(string))
					case <-time.After(1 * time.Second):
						Succeed()
						return
					}
				}
			}()

			// Give goroutine a some ms to get to select
			time.Sleep(time.Millisecond * 100)

			ps.Publish("test1", "foobar")
			wg.Wait()
		})
	})

	Describe("Close", func() {
		It("should not panic when closing non-existing topic", func() {
			ps := New()
			ps.Close("test", "foobar")
		})

		It("map of channels should not contain entry after Close", func() {
			ps := New()
			channelID := util.GenerateUUID()
			wg := &sync.WaitGroup{}
			wg.Add(1)

			go func() {
				defer wg.Done()

				<-ps.Listen("test", channelID)
			}()

			// Give goroutine a moment to start
			time.Sleep(time.Second)

			// Publish something; goroutine should finish and exit
			ps.Publish("test", "foobar")
			wg.Wait()

			// Listen() is no longer active but channel is still there
			Expect(ps.topics["test"][channelID]).ToNot(BeNil())

			ps.Close("test", channelID)

			// Channel and map entry should be gone
			Expect(ps.topics["test"][channelID]).To(BeNil())
		})
	})

	Describe("Publish", func() {
		It("should send message to all listeners", func() {
			ps := New()

			// We are using this wg to keep the test from exiting until all goroutines have exited
			wg := &sync.WaitGroup{}

			// We are using this wg to pause until goroutines have started; less sloppy than using time.Sleep()
			readyWg := &sync.WaitGroup{}

			for i := 0; i < 10; i++ {
				wg.Add(1)
				readyWg.Add(1)

				go func(id int) {
					defer GinkgoRecover()
					defer wg.Done()

					topic := "test" + strconv.Itoa(id)
					data := "foobar" + strconv.Itoa(id)

					// Goroutine has started
					readyWg.Done()

					//fmt.Printf("Listening for %s for topic %s\n", data, topic)

					select {
					case msg := <-ps.Listen(topic):
						Expect(msg).To(Equal(data))
					case <-time.After(5 * time.Second):
						Fail("timed out waiting for published message on topic " + topic)
					}
				}(i)
			}

			// Wait for goroutines to start
			readyWg.Wait()

			// We still need to give a few ms for goroutine to reach select block
			time.Sleep(100 * time.Millisecond)

			// Ready to send a bunch of publishes
			for i := 0; i < 10; i++ {
				topic := "test" + strconv.Itoa(i)
				data := "foobar" + strconv.Itoa(i)

				//fmt.Printf("Publishing %s to topic %s\n", data, topic)
				ps.Publish(topic, data)
			}

			wg.Wait()
		})
	})

	Describe("Reset", func() {
		It("should clear all topics", func() {
			ps := New()
			wg := &sync.WaitGroup{}

			// Create a bunch of listeners
			for i := 0; i < 10; i++ {
				wg.Add(1)

				go func(id int) {
					defer wg.Done()

					select {
					case <-ps.Listen("test" + strconv.Itoa(id)):
						Fail("should not receive anything in this test")
					default:
						// Default so it's a non-blocking channel read
						return
					}
				}(i)
			}

			// Wait for all goroutines to exit
			wg.Wait()

			Expect(len(ps.topics)).To(Equal(10))

			ps.Reset()

			Expect(len(ps.topics)).To(Equal(0))
		})
	})
})
