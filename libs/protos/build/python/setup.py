import os
from setuptools import setup
from pathlib import Path

this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

setup(
    name='streamdal-protos',
    version='0.1.52',
    description='Protobuf python package for Streamdal.com server and SDKs',
    long_description=long_description,
    long_description_content_type="text/markdown",
    url='https://github.com/streamdal/streamdal/tree/main/libs/protos',
    author='Streamdal.com',
    author_email='engineering@streamdal.com',
    license='MIT',
    packages=['streamdal_protos', 'streamdal_protos.protos', 'streamdal_protos.protos.steps', 'streamdal_protos.protos.shared'],
    install_requires=[''],
    python_requires=">=3.7",

    classifiers=[
        'Development Status :: 1 - Planning',
        'License :: OSI Approved :: MIT License',    
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
    ],
)

