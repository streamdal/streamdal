package validate

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/streamdal/streamdal/apps/server/util"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/steps"
)

var _ = Describe("Validate", func() {
	Context("PipelineStep", func() {
		It("should require a step", func() {
			Expect(PipelineStep(nil)).To(Equal(ErrNilInput))
		})

		It("should require path for certain matcher types", func() {

			types := []steps.DetectiveType{
				steps.DetectiveType_DETECTIVE_TYPE_HAS_FIELD,
				steps.DetectiveType_DETECTIVE_TYPE_IS_TYPE,
				steps.DetectiveType_DETECTIVE_TYPE_IS_EMPTY,
			}

			for _, t := range types {
				step := &protos.PipelineStep{
					Step: &protos.PipelineStep_Detective{
						Detective: &steps.DetectiveStep{
							Path:   util.Pointer(""),
							Args:   []string{},
							Negate: nil,
							Type:   t,
						},
					},
				}

				Expect(PipelineStep(step).Error()).To(Equal(ErrEmptyField("Detective.Path").Error()))
			}
		})

		It("should NOT require path for most matcher types", func() {
			step := &protos.PipelineStep{
				Step: &protos.PipelineStep_Detective{
					Detective: &steps.DetectiveStep{
						Path:   util.Pointer(""),
						Args:   []string{},
						Negate: nil,
						Type:   steps.DetectiveType_DETECTIVE_TYPE_HOSTNAME,
					},
				},
			}

			Expect(PipelineStep(step)).To(BeNil())
		})
	})
})
