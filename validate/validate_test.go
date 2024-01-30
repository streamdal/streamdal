package validate

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/shared"
)

var _ = Describe("Validate", func() {
	Context("Error Functions", func() {
		It("ErrEmptyField", func() {
			err := ErrEmptyField("test")
			Expect(err.Error()).To(Equal("field 'test' cannot be empty"))
		})
		It("ErrNilField", func() {
			err := ErrNilField("test")
			Expect(err.Error()).To(Equal("field 'test' cannot be nil"))
		})
		It("ErrEmptyField", func() {
			err := ErrUnsetEnum("test")
			Expect(err.Error()).To(Equal("enum 'test' cannot be unset"))
		})
	})

	Context("Audience", func() {
		var aud *protos.Audience
		BeforeEach(func() {
			aud = &protos.Audience{
				ServiceName:   "test-service",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "test-operation",
				ComponentName: "kafka",
			}
		})

		It("returns ErrNilInput", func() {
			err := Audience(nil)
			Expect(err).To(Equal(ErrNilInput))
		})

		It("returns ErrEmptyField for ServiceName", func() {
			aud.ServiceName = ""
			err := Audience(aud)
			Expect(err.Error()).To(Equal(ErrEmptyField("service_name").Error()))
		})

		It("returns ErrEmptyField for ComponentName", func() {
			aud.ComponentName = ""
			err := Audience(aud)
			Expect(err.Error()).To(Equal(ErrEmptyField("component_name").Error()))
		})

		It("returns ErrEmptyField for OperationName", func() {
			aud.OperationName = ""
			err := Audience(aud)
			Expect(err.Error()).To(Equal(ErrEmptyField("operation_name").Error()))
		})

		It("returns ErrUnsetEnum for OperationType", func() {
			aud.OperationType = protos.OperationType_OPERATION_TYPE_UNSET
			err := Audience(aud)
			Expect(err.Error()).To(Equal(ErrUnsetEnum("operation_type").Error()))
		})

		It("returns nil", func() {
			err := Audience(aud)
			Expect(err).To(BeNil())
		})
	})

	Context("KVInstruction", func() {
		It("cannot be nil", func() {
			err := KVInstruction(nil)
			Expect(err.Error()).To(Equal("KVInstruction cannot be nil"))
		})

		It("cannot have unset action", func() {
			err := KVInstruction(&protos.KVInstruction{})
			Expect(err.Error()).To(Equal("KVAction cannot be UNSET"))
		})

		It("cannot have nil object", func() {
			err := KVInstruction(&protos.KVInstruction{
				Action: shared.KVAction_KV_ACTION_CREATE,
			})
			Expect(err.Error()).To(Equal("KVInstruction.Object cannot be nil"))
		})

		It("returns nil", func() {
			err := KVInstruction(&protos.KVInstruction{
				Action: shared.KVAction_KV_ACTION_DELETE_ALL,
			})
			Expect(err).To(BeNil())
		})
	})

	Context("TailRequestStartCommand", func() {
		It("cannot be nil", func() {
			err := TailRequestStartCommand(nil)
			Expect(err.Error()).To(Equal(ErrNilInput.Error()))
		})

		It("cannot have unset tail request", func() {
			err := TailRequestStartCommand(&protos.Command{
				Command: &protos.Command_SetPipelines{},
			})
			Expect(err.Error()).To(Equal(ErrNilField("Tail").Error()))
		})

		It("cannot have  nil request", func() {
			err := TailRequestStartCommand(&protos.Command{
				Command: &protos.Command_Tail{
					Tail: &protos.TailCommand{
						Request: nil,
					},
				},
			})
			Expect(err.Error()).To(Equal(ErrNilField("Request").Error()))
		})

		It("cannot have empty Id", func() {
			err := TailRequestStartCommand(&protos.Command{
				Command: &protos.Command_Tail{
					Tail: &protos.TailCommand{
						Request: &protos.TailRequest{},
					},
				},
			})
			Expect(err.Error()).To(Equal(ErrEmptyField("Id").Error()))
		})

		It("returns nil", func() {
			err := TailRequestStartCommand(&protos.Command{
				Command: &protos.Command_Tail{
					Tail: &protos.TailCommand{
						Request: &protos.TailRequest{
							Id: "test",
							Audience: &protos.Audience{
								ServiceName:   "test-service",
								ComponentName: "test-component",
								OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
								OperationName: "test-operation",
							},
						},
					},
				},
			})
			Expect(err).To(BeNil())
		})
	})

	Context("TailRequestStopCommand", func() {
		It("cannot be nil", func() {
			err := TailRequestStopCommand(nil)
			Expect(err.Error()).To(Equal(ErrNilInput.Error()))
		})

		It("cannot have unset tail request", func() {
			err := TailRequestStopCommand(&protos.Command{
				Command: &protos.Command_SetPipelines{},
			})
			Expect(err.Error()).To(Equal(ErrNilField("Tail").Error()))
		})

		It("cannot have nil request", func() {
			err := TailRequestStopCommand(&protos.Command{
				Command: &protos.Command_Tail{
					Tail: &protos.TailCommand{
						Request: nil,
					},
				},
			})
			Expect(err.Error()).To(Equal(ErrNilField("Request").Error()))
		})

		It("cannot have empty Id", func() {
			err := TailRequestStopCommand(&protos.Command{
				Command: &protos.Command_Tail{
					Tail: &protos.TailCommand{
						Request: &protos.TailRequest{
							Audience: &protos.Audience{
								ServiceName:   "test-service",
								ComponentName: "test-component",
								OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
								OperationName: "test-operation",
							},
						},
					},
				},
			})
			Expect(err.Error()).To(Equal(ErrEmptyField("Id").Error()))
		})

		It("returns nil", func() {
			aud := &protos.Audience{
				ServiceName:   "test-service",
				ComponentName: "test-component",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "test-operation",
			}

			err := TailRequestStopCommand(&protos.Command{
				Command: &protos.Command_Tail{
					Tail: &protos.TailCommand{
						Request: &protos.TailRequest{
							Id:       "test",
							Audience: aud,
						},
					},
				},
			})
			Expect(err).To(BeNil())
		})
	})

	Context("KVCommand", func() {
		It("cannot be nil", func() {
			err := KVCommand(nil)
			Expect(err.Error()).To(Equal(ErrNilInput.Error()))
		})

		It("returns nil", func() {
			err := KVCommand(&protos.KVCommand{})
			Expect(err).To(BeNil())
		})
	})
})
