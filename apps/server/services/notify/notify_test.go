package notify

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Notify Service", func() {
	payload := []byte(`{
"object": {
	"some": "first level field",
	"type": "a",
	"nested": {
		"some": "other field"
	}
}`)

	Context("extractPayloadPaths", func() {
		It("should return requested paths nested", func() {
			result, err := extractPayloadPaths(payload, []string{"object.type"})
			Expect(err).To(BeNil())
			Expect(result).To(MatchJSON(`{"object":{"type": "a"}}`))
		})
		It("should return requested paths flattened", func() {
			result, err := extractPayloadPaths(payload, []string{"object.type", "object.some"}, true)
			Expect(err).To(BeNil())
			Expect(result).To(MatchJSON(`{"type": "a","some": "first level field"}`))
		})
		It("should support object key", func() {
			result, err := extractPayloadPaths(payload, []string{"object.nested"})
			Expect(err).To(BeNil())
			Expect(result).To(MatchJSON(`{"object": {"nested": {"some": "other field"}}}`))
		})
	})
})
