package util

import (
	"testing"

	"github.com/onsi/gomega"

	"github.com/streamdal/protos/build/go/protos"
)

type AudienceTestCase struct {
	StrAudience string
	Audience    *protos.Audience
}

var (
	testCasesFromStr = []AudienceTestCase{
		{
			StrAudience: "service-name/operation_type_producer/producer-name/some-component",
			Audience: &protos.Audience{
				ServiceName:   "service-name",
				ComponentName: "some-component",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "producer-name",
			},
		},
		{
			StrAudience: "sErvIcE-NamE/oPerAtIon_tYpe_proDucer/ProDuCer-nAme/SomE-CoMPonEnt",
			Audience: &protos.Audience{
				ServiceName:   "service-name",
				ComponentName: "some-component",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "producer-name",
			},
		},
		{
			// FromStr should normalize __SPACE__ to real spaces in Audience
			StrAudience: "sErvIcE__SPACE__NamE/oPerAtIon_tYpe_proDucer/ProDuCer__SPACE__nAme/SomE__SPACE__CoMPonEnt",
			Audience: &protos.Audience{
				ServiceName:   "service name",
				ComponentName: "some component",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "producer name",
			},
		},
		{
			// FromStr should return nil
			StrAudience: "invalid/number/elements/operation_type_producer/producer-name",
			Audience:    nil,
		},
	}

	testCasesToStr = []AudienceTestCase{
		{
			// Happy path
			StrAudience: "service-name/operation_type_producer/producer-name/some-component",
			Audience: &protos.Audience{
				ServiceName:   "service-name",
				ComponentName: "some-component",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "producer-name",
			},
		},
		{
			// ToStr should lowercase the audience
			StrAudience: "service-name/operation_type_producer/producer-name/some-component",
			Audience: &protos.Audience{
				ServiceName:   "sErViCe-nAmE",
				ComponentName: "sOMe-componeNt",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "pRoDucEr-naMe",
			},
		},
		{
			// ToStr should return string with normalized spaces
			StrAudience: "service__SPACE__name/operation_type_producer/producer__SPACE__name/some__SPACE____SPACE__component",
			Audience: &protos.Audience{
				ServiceName:   "sErViCe nAmE",
				ComponentName: "sOMe  componeNt",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "pRoDucEr naMe",
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

func TestAudienceToStr(t *testing.T) {
	g := gomega.NewWithT(t)

	for _, entry := range testCasesToStr {
		testAud := AudienceToStr(entry.Audience)
		g.Expect(testAud).To(gomega.Equal(entry.StrAudience), "test audience '%+v' does not equal expected audience '%+v'", testAud, entry.StrAudience)
	}
}

func TestParseConfigKey(t *testing.T) {
	g := gomega.NewWithT(t)

	aud := &protos.Audience{
		ServiceName:   "secret service",
		OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
		OperationName: "multi pipeline",
		ComponentName: "sqlite and something else",
	}

	configKey := "secret__SPACE__service/operation_type_consumer/multi__SPACE__pipeline/sqlite__SPACE__and__SPACE__something__SPACE__else/0fd3dcc1-c2f1-42d9-af78-9060588fc652"
	audience, pipelineID := ParseConfigKey(configKey)
	g.Expect(pipelineID).To(gomega.Equal("0fd3dcc1-c2f1-42d9-af78-9060588fc652"))
	g.Expect(AudienceEquals(audience, aud)).To(gomega.BeTrue())
}
