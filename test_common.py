import streamdal_protos.protos as protos
import streamdal.common as common


class TestCommon:
    def test_aud_to_str(self):
        aud = protos.Audience(
            component_name="kafka",
            service_name="testing",
            operation_name="test-topic",
            operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER,
        )

        assert common.aud_to_str(aud) == "testing.kafka.2.test-topic"

    def test_str_to_aud(self):
        aud = protos.Audience(
            component_name="kafka",
            service_name="testing",
            operation_name="test-topic",
            operation_type=protos.OperationType.OPERATION_TYPE_PRODUCER,
        )

        parsed = common.str_to_aud("testing.kafka.2.test-topic")
        assert parsed.component_name == aud.component_name
        assert parsed.service_name == aud.service_name
        assert parsed.operation_name == aud.operation_name
        assert parsed.operation_type == aud.operation_type
