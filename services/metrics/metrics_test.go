package metrics

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Metrics", func() {
	Context("parseMetricsString", func() {
		It("should parse a valid prometheus string", func() {
			input := `streamdal_snitch_counter_consume_bytes{component_name="1",operation_name="2",pipeline_id="3",pipeline_name="4",service="5"} 1`

			metrics, err := parseMetricString(input)
			Expect(err).ToNot(HaveOccurred())
			Expect(metrics.Name).To(Equal("streamdal_snitch_counter_consume_bytes"))
			Expect(metrics.Value).To(Equal(float64(1)))
			Expect(metrics.Labels).To(Equal(map[string]string{
				"component_name": "1",
				"operation_name": "2",
				"pipeline_id":    "3",
				"pipeline_name":  "4",
				"service":        "5",
			}))
		})
	})
})
