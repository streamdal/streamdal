import pytest
from streamdal import StreamdalClient, StreamdalConfig


class TestStreamdalConfig:
    def test_valid_config(self):
        # A valid config should not raise any exception
        config = StreamdalConfig(
            service_name="MyService",
            streamdal_url="localhost:9090",
            streamdal_token="fake token",
        )
        assert StreamdalClient._validate_config(config) is None

    def test_missing_config(self):
        # Test when a required field (service_name) is missing
        with pytest.raises(ValueError, match="service_name is required"):
            StreamdalClient._validate_config(
                StreamdalConfig(
                    service_name="",
                    streamdal_url="localhost:9090",
                    streamdal_token="fake token",
                )
            )

        # Test when streamdal_url is missing
        with pytest.raises(ValueError, match="streamdal_url is required"):
            StreamdalClient._validate_config(
                StreamdalConfig(
                    service_name="writer",
                    streamdal_url="",
                    streamdal_token="fake token",
                )
            )

        # Test when streamdal_token is missing
        with pytest.raises(ValueError, match="streamdal_token is required"):
            StreamdalClient._validate_config(
                StreamdalConfig(
                    service_name="writer",
                    streamdal_url="localhost:9090",
                    streamdal_token="",
                )
            )

    def test_missing_cfg(self):
        # Test when cfg is None
        with pytest.raises(ValueError, match="cfg is required"):
            StreamdalClient._validate_config(None)
