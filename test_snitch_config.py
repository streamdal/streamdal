import pytest
from snitchpy import SnitchClient, SnitchConfig


class TestSnitchConfig:
    def test_valid_config(self):
        # A valid config should not raise any exception
        config = SnitchConfig(
            service_name="MyService",
            snitch_url="localhost:9090",
            snitch_token="fake token",
        )
        assert SnitchClient._validate_config(config) is None

    def test_missing_config(self):
        # Test when a required field (service_name) is missing
        with pytest.raises(ValueError, match="service_name is required"):
            SnitchClient._validate_config(
                SnitchConfig(
                    service_name="",
                    snitch_url="localhost:9090",
                    snitch_token="fake token",
                )
            )

        # Test when snitch_url is missing
        with pytest.raises(ValueError, match="snitch_url is required"):
            SnitchClient._validate_config(
                SnitchConfig(
                    service_name="writer",
                    snitch_url="",
                    snitch_token="fake token",
                )
            )

        # Test when snitch_token is missing
        with pytest.raises(ValueError, match="snitch_token is required"):
            SnitchClient._validate_config(
                SnitchConfig(
                    service_name="writer",
                    snitch_url="localhost:9090",
                    snitch_token="",
                )
            )

    def test_missing_cfg(self):
        # Test when cfg is None
        with pytest.raises(ValueError, match="cfg is required"):
            SnitchClient._validate_config(None)
