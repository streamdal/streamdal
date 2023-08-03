package util

import (
	"testing"

	"github.com/onsi/gomega"
	"github.com/streamdal/snitch-protos/build/go/protos"
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
