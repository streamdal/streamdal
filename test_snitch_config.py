import pytest
import snitchpy
from snitchpy import SnitchClient, SnitchConfig

class TestSnitchConfig:
    def test_valid_config(self):
        # A valid config should not raise any exception
        config = SnitchConfig(
            service_name="MyService",
            grpc_url="localhost",
            grpc_port=9090,
            grpc_token="fake token"
        )
        assert SnitchClient._validate_config(config) is None

    def test_missing_config(self):
        # Test when a required field (service_name) is missing
        with pytest.raises(ValueError, match="service_name is required"):
            SnitchClient._validate_config(SnitchConfig(
                service_name="",
                grpc_url="localhost",
                grpc_port=9090,
                grpc_token="fake token"
            ))

        # Test when grpc_url is missing
        with pytest.raises(ValueError, match="grpc_url is required"):
            SnitchClient._validate_config(SnitchConfig(
                service_name="writer",
                grpc_url="",
                grpc_port=9090,
                grpc_token="fake token"
            ))

        # Test when grpc_port is missing
        with pytest.raises(ValueError, match="grpc_port is required"):
            SnitchClient._validate_config(SnitchConfig(
                service_name="writer",
                grpc_url="localhost",
                grpc_port=0,
                grpc_token="fake token"
            ))

        # Test when grpc_token is missing
        with pytest.raises(ValueError, match="grpc_token is required"):
            SnitchClient._validate_config(SnitchConfig(
                service_name="writer",
                grpc_url="localhost",
                grpc_port=9090,
                grpc_token=""
            ))

    def test_missing_cfg(self):
        # Test when cfg is None
        with pytest.raises(ValueError, match="cfg is required"):
            SnitchClient._validate_config(None)

