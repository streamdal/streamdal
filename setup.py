import os
from setuptools import setup
from pathlib import Path

this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()
setup(
    name="streamdal",
    version='0.0.41',
    description="Python client SDK for Streamdal's open source observability server",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/streamdal/python-sdk",
    author="Streamdal.com",
    author_email="engineering@streamdal.com",
    license="MIT",
    packages=[
        "streamdal",
        "streamdal.common",
        "streamdal.metrics",
        "streamdal.validation",
        "streamdal.tail",
        "streamdal.hostfunc",
    ],
    install_requires=[""],
    python_requires=">=3.8",
    classifiers=[
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)
