package util

import (
	"testing"

	"github.com/onsi/gomega"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/steps"
)

type AudienceTestCase struct {
	StrAudience string
	Audience    *protos.Audience
}

var (
	testCasesFromStr = []AudienceTestCase{
		{
			StrAudience: "service-name:operation_type_producer:producer-name:some-component",
			Audience: &protos.Audience{
				ServiceName:   "service-name",
				ComponentName: "some-component",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "producer-name",
			},
		},
		{
			StrAudience: "sErvIcE-NamE:oPerAtIon_tYpe_proDucer:ProDuCer-nAme:SomE-CoMPonEnt",
			Audience: &protos.Audience{
				ServiceName:   "service-name",
				ComponentName: "some-component",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "producer-name",
			},
		},
		{
			// FromStr should return nil
			StrAudience: "invalid:number:elements:operation_type_producer:producer-name",
			Audience:    nil,
		},
	}

	testCasesToStr = []AudienceTestCase{
		{
			// Happy path
			StrAudience: "service-name:operation_type_producer:producer-name:some-component",
			Audience: &protos.Audience{
				ServiceName:   "service-name",
				ComponentName: "some-component",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "producer-name",
			},
		},
		{
			// ToStr should lowercase the audience
			StrAudience: "service-name:operation_type_producer:producer-name:some-component",
			Audience: &protos.Audience{
				ServiceName:   "sErViCe-nAmE",
				ComponentName: "sOMe-componeNt",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "pRoDucEr-naMe",
			},
		},
		{
			// ToStr on a nil audience should return ""
			StrAudience: "",
			Audience:    nil,
		},
	}
)

func TestAudienceFromStr(t *testing.T) {
	g := gomega.NewWithT(t)

	for _, entry := range testCasesFromStr {
		testAud := AudienceFromStr(entry.StrAudience)
		g.Expect(testAud).To(gomega.Equal(entry.Audience), "test audience '%+v' does not equal expected audience '%+v'", testAud, entry.Audience)
	}
}

func TestInjectSchemaInferenceForSetPipelinesCommands(t *testing.T) {
	g := gomega.NewWithT(t)

	// Empty commands should return empty commands
	numInjected, err := InjectSchemaInferenceForSetPipelinesCommands(make([]*protos.Command, 0), "wasmDir")
	g.Expect(err).ToNot(gomega.HaveOccurred())
	g.Expect(numInjected).To(gomega.Equal(0))
}

func TestAudienceToStr(t *testing.T) {
	g := gomega.NewWithT(t)

	for _, entry := range testCasesToStr {
		testAud := AudienceToStr(entry.Audience)
		g.Expect(testAud).To(gomega.Equal(entry.StrAudience), "test audience '%+v' does not equal expected audience '%+v'", testAud, entry.StrAudience)
	}
}

func TestGrpcMethodCounterName(t *testing.T) {
	cases := map[string]string{
		"/protos.External/GetAllConfig":          "grpc_method_external_get_all_config_total",
		"/protos.External/AppVerifyRegistration": "grpc_method_external_app_verify_registration_total",
		"/protos.Internal/Register":              "grpc_method_internal_register_total",
	}

	for method, expected := range cases {
		got := GrpcMethodCounterName(method)
		if got != expected {
			t.Errorf("expected %s, got %s", expected, got)
		}
	}
}

func TestGenerateNodeID(t *testing.T) {
	g := gomega.NewWithT(t)

	installID := "fcd18685-0875-4bc6-863d-e141ab211310"
	nodeID := GenerateNodeID(installID, "node1")
	nodeID2 := GenerateNodeID(installID, "node2")

	g.Expect(nodeID).To(gomega.Equal("da630cc9-5104-2fdc-3979-fcdfa7145c20"))
	g.Expect(nodeID2).ToNot(gomega.Equal(nodeID))
}

func TestGetStepSubType(t *testing.T) {
	g := gomega.NewWithT(t)

	step := &protos.PipelineStep{
		Step: &protos.PipelineStep_HttpRequest{
			HttpRequest: &steps.HttpRequestStep{
				Request: &steps.HttpRequest{
					Url: "https://www.google.com",
				},
			},
		},
	}

	g.Expect(GetStepSubType(step)).To(gomega.Equal(""))

	step = &protos.PipelineStep{
		Step: &protos.PipelineStep_Detective{
			Detective: &steps.DetectiveStep{
				Type: steps.DetectiveType_DETECTIVE_TYPE_STRING_CONTAINS_ANY,
			},
		},
	}

	g.Expect(GetStepSubType(step)).To(gomega.Equal("string_contains_any"))
}

func TestGetStepType(t *testing.T) {
	g := gomega.NewWithT(t)

	step := &protos.PipelineStep{
		Step: &protos.PipelineStep_HttpRequest{
			HttpRequest: &steps.HttpRequestStep{
				Request: &steps.HttpRequest{
					Url: "https://www.google.com",
				},
			},
		},
	}

	g.Expect(GetStepType(step)).To(gomega.Equal("http"))

	step = &protos.PipelineStep{
		Step: &protos.PipelineStep_Detective{
			Detective: &steps.DetectiveStep{
				Type: steps.DetectiveType_DETECTIVE_TYPE_STRING_CONTAINS_ANY,
			},
		},
	}

	g.Expect(GetStepType(step)).To(gomega.Equal("detective"))
}
