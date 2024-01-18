// This file is generated by rust-protobuf 3.3.0. Do not edit
// .proto file is parsed by protoc --rust-out=...
// @generated

// https://github.com/rust-lang/rust-clippy/issues/702
#![allow(unknown_lints)]
#![allow(clippy::all)]

#![allow(unused_attributes)]
#![cfg_attr(rustfmt, rustfmt::skip)]

#![allow(box_pointers)]
#![allow(dead_code)]
#![allow(missing_docs)]
#![allow(non_camel_case_types)]
#![allow(non_snake_case)]
#![allow(non_upper_case_globals)]
#![allow(trivial_casts)]
#![allow(unused_results)]
#![allow(unused_mut)]

//! Generated file from `sp_sdk.proto`

/// Generated files are compatible only with the same version
/// of protobuf runtime.
const _PROTOBUF_VERSION_CHECK: () = ::protobuf::VERSION_3_3_0;

///  Common return response used by all SDKs
// @@protoc_insertion_point(message:protos.SDKResponse)
#[derive(PartialEq,Clone,Default,Debug)]
pub struct SDKResponse {
    // message fields
    ///  Contains (potentially) modified input data
    // @@protoc_insertion_point(field:protos.SDKResponse.data)
    pub data: ::std::vec::Vec<u8>,
    ///  Indicates if .Process() was successful; check error_message for more details
    // @@protoc_insertion_point(field:protos.SDKResponse.error)
    pub error: bool,
    ///  If an error == true, this will contain a human-readable error message
    // @@protoc_insertion_point(field:protos.SDKResponse.error_message)
    pub error_message: ::std::string::String,
    ///  An array of pipelines that the SDK executed and the status of each step
    // @@protoc_insertion_point(field:protos.SDKResponse.pipeline_status)
    pub pipeline_status: ::std::vec::Vec<PipelineStatus>,
    ///  Includes any metadata that the step(s) may want to pass back to the user.
    ///
    ///  NOTE: Metadata is aggregated across all steps in the pipeline, so if two
    ///  steps both set a key "foo" to different values, the value of "foo" in the
    ///  response will be the value set by the last step in the pipeline.
    ///
    ///  To learn more about "metadata", see SDK Spec V2 doc "Pipeline Step & Error
    ///  Behavior" section.
    // @@protoc_insertion_point(field:protos.SDKResponse.metadata)
    pub metadata: ::std::collections::HashMap<::std::string::String, ::std::string::String>,
    // special fields
    // @@protoc_insertion_point(special_field:protos.SDKResponse.special_fields)
    pub special_fields: ::protobuf::SpecialFields,
}

impl<'a> ::std::default::Default for &'a SDKResponse {
    fn default() -> &'a SDKResponse {
        <SDKResponse as ::protobuf::Message>::default_instance()
    }
}

impl SDKResponse {
    pub fn new() -> SDKResponse {
        ::std::default::Default::default()
    }

    fn generated_message_descriptor_data() -> ::protobuf::reflect::GeneratedMessageDescriptorData {
        let mut fields = ::std::vec::Vec::with_capacity(5);
        let mut oneofs = ::std::vec::Vec::with_capacity(0);
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "data",
            |m: &SDKResponse| { &m.data },
            |m: &mut SDKResponse| { &mut m.data },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "error",
            |m: &SDKResponse| { &m.error },
            |m: &mut SDKResponse| { &mut m.error },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "error_message",
            |m: &SDKResponse| { &m.error_message },
            |m: &mut SDKResponse| { &mut m.error_message },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_vec_simpler_accessor::<_, _>(
            "pipeline_status",
            |m: &SDKResponse| { &m.pipeline_status },
            |m: &mut SDKResponse| { &mut m.pipeline_status },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_map_simpler_accessor::<_, _, _>(
            "metadata",
            |m: &SDKResponse| { &m.metadata },
            |m: &mut SDKResponse| { &mut m.metadata },
        ));
        ::protobuf::reflect::GeneratedMessageDescriptorData::new_2::<SDKResponse>(
            "SDKResponse",
            fields,
            oneofs,
        )
    }
}

impl ::protobuf::Message for SDKResponse {
    const NAME: &'static str = "SDKResponse";

    fn is_initialized(&self) -> bool {
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream<'_>) -> ::protobuf::Result<()> {
        while let Some(tag) = is.read_raw_tag_or_eof()? {
            match tag {
                10 => {
                    self.data = is.read_bytes()?;
                },
                16 => {
                    self.error = is.read_bool()?;
                },
                26 => {
                    self.error_message = is.read_string()?;
                },
                34 => {
                    self.pipeline_status.push(is.read_message()?);
                },
                42 => {
                    let len = is.read_raw_varint32()?;
                    let old_limit = is.push_limit(len as u64)?;
                    let mut key = ::std::default::Default::default();
                    let mut value = ::std::default::Default::default();
                    while let Some(tag) = is.read_raw_tag_or_eof()? {
                        match tag {
                            10 => key = is.read_string()?,
                            18 => value = is.read_string()?,
                            _ => ::protobuf::rt::skip_field_for_tag(tag, is)?,
                        };
                    }
                    is.pop_limit(old_limit);
                    self.metadata.insert(key, value);
                },
                tag => {
                    ::protobuf::rt::read_unknown_or_skip_group(tag, is, self.special_fields.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u64 {
        let mut my_size = 0;
        if !self.data.is_empty() {
            my_size += ::protobuf::rt::bytes_size(1, &self.data);
        }
        if self.error != false {
            my_size += 1 + 1;
        }
        if !self.error_message.is_empty() {
            my_size += ::protobuf::rt::string_size(3, &self.error_message);
        }
        for value in &self.pipeline_status {
            let len = value.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint64_size(len) + len;
        };
        for (k, v) in &self.metadata {
            let mut entry_size = 0;
            entry_size += ::protobuf::rt::string_size(1, &k);
            entry_size += ::protobuf::rt::string_size(2, &v);
            my_size += 1 + ::protobuf::rt::compute_raw_varint64_size(entry_size) + entry_size
        };
        my_size += ::protobuf::rt::unknown_fields_size(self.special_fields.unknown_fields());
        self.special_fields.cached_size().set(my_size as u32);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream<'_>) -> ::protobuf::Result<()> {
        if !self.data.is_empty() {
            os.write_bytes(1, &self.data)?;
        }
        if self.error != false {
            os.write_bool(2, self.error)?;
        }
        if !self.error_message.is_empty() {
            os.write_string(3, &self.error_message)?;
        }
        for v in &self.pipeline_status {
            ::protobuf::rt::write_message_field_with_cached_size(4, v, os)?;
        };
        for (k, v) in &self.metadata {
            let mut entry_size = 0;
            entry_size += ::protobuf::rt::string_size(1, &k);
            entry_size += ::protobuf::rt::string_size(2, &v);
            os.write_raw_varint32(42)?; // Tag.
            os.write_raw_varint32(entry_size as u32)?;
            os.write_string(1, &k)?;
            os.write_string(2, &v)?;
        };
        os.write_unknown_fields(self.special_fields.unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn special_fields(&self) -> &::protobuf::SpecialFields {
        &self.special_fields
    }

    fn mut_special_fields(&mut self) -> &mut ::protobuf::SpecialFields {
        &mut self.special_fields
    }

    fn new() -> SDKResponse {
        SDKResponse::new()
    }

    fn clear(&mut self) {
        self.data.clear();
        self.error = false;
        self.error_message.clear();
        self.pipeline_status.clear();
        self.metadata.clear();
        self.special_fields.clear();
    }

    fn default_instance() -> &'static SDKResponse {
        static instance: ::protobuf::rt::Lazy<SDKResponse> = ::protobuf::rt::Lazy::new();
        instance.get(SDKResponse::new)
    }
}

impl ::protobuf::MessageFull for SDKResponse {
    fn descriptor() -> ::protobuf::reflect::MessageDescriptor {
        static descriptor: ::protobuf::rt::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::rt::Lazy::new();
        descriptor.get(|| file_descriptor().message_by_package_relative_name("SDKResponse").unwrap()).clone()
    }
}

impl ::std::fmt::Display for SDKResponse {
    fn fmt(&self, f: &mut ::std::fmt::Formatter<'_>) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for SDKResponse {
    type RuntimeType = ::protobuf::reflect::rt::RuntimeTypeMessage<Self>;
}

// @@protoc_insertion_point(message:protos.PipelineStatus)
#[derive(PartialEq,Clone,Default,Debug)]
pub struct PipelineStatus {
    // message fields
    ///  ID of the pipeline
    // @@protoc_insertion_point(field:protos.PipelineStatus.id)
    pub id: ::std::string::String,
    ///  The name of the pipeline
    // @@protoc_insertion_point(field:protos.PipelineStatus.name)
    pub name: ::std::string::String,
    ///  The status of each step in the pipeline
    // @@protoc_insertion_point(field:protos.PipelineStatus.step_status)
    pub step_status: ::std::vec::Vec<StepStatus>,
    // special fields
    // @@protoc_insertion_point(special_field:protos.PipelineStatus.special_fields)
    pub special_fields: ::protobuf::SpecialFields,
}

impl<'a> ::std::default::Default for &'a PipelineStatus {
    fn default() -> &'a PipelineStatus {
        <PipelineStatus as ::protobuf::Message>::default_instance()
    }
}

impl PipelineStatus {
    pub fn new() -> PipelineStatus {
        ::std::default::Default::default()
    }

    fn generated_message_descriptor_data() -> ::protobuf::reflect::GeneratedMessageDescriptorData {
        let mut fields = ::std::vec::Vec::with_capacity(3);
        let mut oneofs = ::std::vec::Vec::with_capacity(0);
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "id",
            |m: &PipelineStatus| { &m.id },
            |m: &mut PipelineStatus| { &mut m.id },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "name",
            |m: &PipelineStatus| { &m.name },
            |m: &mut PipelineStatus| { &mut m.name },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_vec_simpler_accessor::<_, _>(
            "step_status",
            |m: &PipelineStatus| { &m.step_status },
            |m: &mut PipelineStatus| { &mut m.step_status },
        ));
        ::protobuf::reflect::GeneratedMessageDescriptorData::new_2::<PipelineStatus>(
            "PipelineStatus",
            fields,
            oneofs,
        )
    }
}

impl ::protobuf::Message for PipelineStatus {
    const NAME: &'static str = "PipelineStatus";

    fn is_initialized(&self) -> bool {
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream<'_>) -> ::protobuf::Result<()> {
        while let Some(tag) = is.read_raw_tag_or_eof()? {
            match tag {
                10 => {
                    self.id = is.read_string()?;
                },
                18 => {
                    self.name = is.read_string()?;
                },
                26 => {
                    self.step_status.push(is.read_message()?);
                },
                tag => {
                    ::protobuf::rt::read_unknown_or_skip_group(tag, is, self.special_fields.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u64 {
        let mut my_size = 0;
        if !self.id.is_empty() {
            my_size += ::protobuf::rt::string_size(1, &self.id);
        }
        if !self.name.is_empty() {
            my_size += ::protobuf::rt::string_size(2, &self.name);
        }
        for value in &self.step_status {
            let len = value.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint64_size(len) + len;
        };
        my_size += ::protobuf::rt::unknown_fields_size(self.special_fields.unknown_fields());
        self.special_fields.cached_size().set(my_size as u32);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream<'_>) -> ::protobuf::Result<()> {
        if !self.id.is_empty() {
            os.write_string(1, &self.id)?;
        }
        if !self.name.is_empty() {
            os.write_string(2, &self.name)?;
        }
        for v in &self.step_status {
            ::protobuf::rt::write_message_field_with_cached_size(3, v, os)?;
        };
        os.write_unknown_fields(self.special_fields.unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn special_fields(&self) -> &::protobuf::SpecialFields {
        &self.special_fields
    }

    fn mut_special_fields(&mut self) -> &mut ::protobuf::SpecialFields {
        &mut self.special_fields
    }

    fn new() -> PipelineStatus {
        PipelineStatus::new()
    }

    fn clear(&mut self) {
        self.id.clear();
        self.name.clear();
        self.step_status.clear();
        self.special_fields.clear();
    }

    fn default_instance() -> &'static PipelineStatus {
        static instance: PipelineStatus = PipelineStatus {
            id: ::std::string::String::new(),
            name: ::std::string::String::new(),
            step_status: ::std::vec::Vec::new(),
            special_fields: ::protobuf::SpecialFields::new(),
        };
        &instance
    }
}

impl ::protobuf::MessageFull for PipelineStatus {
    fn descriptor() -> ::protobuf::reflect::MessageDescriptor {
        static descriptor: ::protobuf::rt::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::rt::Lazy::new();
        descriptor.get(|| file_descriptor().message_by_package_relative_name("PipelineStatus").unwrap()).clone()
    }
}

impl ::std::fmt::Display for PipelineStatus {
    fn fmt(&self, f: &mut ::std::fmt::Formatter<'_>) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for PipelineStatus {
    type RuntimeType = ::protobuf::reflect::rt::RuntimeTypeMessage<Self>;
}

// @@protoc_insertion_point(message:protos.StepStatus)
#[derive(PartialEq,Clone,Default,Debug)]
pub struct StepStatus {
    // message fields
    ///  The name of the step
    // @@protoc_insertion_point(field:protos.StepStatus.name)
    pub name: ::std::string::String,
    ///  Did an error occur during the step?
    // @@protoc_insertion_point(field:protos.StepStatus.error)
    pub error: bool,
    ///  If error == true, this will contain a human-readable error message
    // @@protoc_insertion_point(field:protos.StepStatus.error_message)
    pub error_message: ::std::string::String,
    ///  Indicates if current or all future pipelines were aborted.
    ///
    ///  IMPORTANT: Err does NOT mean that the pipeline was aborted - the user has
    ///  to explicitly define an abort condition for on_error.
    // @@protoc_insertion_point(field:protos.StepStatus.abort_condition)
    pub abort_condition: ::protobuf::EnumOrUnknown<super::sp_pipeline::AbortCondition>,
    // special fields
    // @@protoc_insertion_point(special_field:protos.StepStatus.special_fields)
    pub special_fields: ::protobuf::SpecialFields,
}

impl<'a> ::std::default::Default for &'a StepStatus {
    fn default() -> &'a StepStatus {
        <StepStatus as ::protobuf::Message>::default_instance()
    }
}

impl StepStatus {
    pub fn new() -> StepStatus {
        ::std::default::Default::default()
    }

    fn generated_message_descriptor_data() -> ::protobuf::reflect::GeneratedMessageDescriptorData {
        let mut fields = ::std::vec::Vec::with_capacity(4);
        let mut oneofs = ::std::vec::Vec::with_capacity(0);
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "name",
            |m: &StepStatus| { &m.name },
            |m: &mut StepStatus| { &mut m.name },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "error",
            |m: &StepStatus| { &m.error },
            |m: &mut StepStatus| { &mut m.error },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "error_message",
            |m: &StepStatus| { &m.error_message },
            |m: &mut StepStatus| { &mut m.error_message },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "abort_condition",
            |m: &StepStatus| { &m.abort_condition },
            |m: &mut StepStatus| { &mut m.abort_condition },
        ));
        ::protobuf::reflect::GeneratedMessageDescriptorData::new_2::<StepStatus>(
            "StepStatus",
            fields,
            oneofs,
        )
    }
}

impl ::protobuf::Message for StepStatus {
    const NAME: &'static str = "StepStatus";

    fn is_initialized(&self) -> bool {
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream<'_>) -> ::protobuf::Result<()> {
        while let Some(tag) = is.read_raw_tag_or_eof()? {
            match tag {
                10 => {
                    self.name = is.read_string()?;
                },
                16 => {
                    self.error = is.read_bool()?;
                },
                26 => {
                    self.error_message = is.read_string()?;
                },
                32 => {
                    self.abort_condition = is.read_enum_or_unknown()?;
                },
                tag => {
                    ::protobuf::rt::read_unknown_or_skip_group(tag, is, self.special_fields.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u64 {
        let mut my_size = 0;
        if !self.name.is_empty() {
            my_size += ::protobuf::rt::string_size(1, &self.name);
        }
        if self.error != false {
            my_size += 1 + 1;
        }
        if !self.error_message.is_empty() {
            my_size += ::protobuf::rt::string_size(3, &self.error_message);
        }
        if self.abort_condition != ::protobuf::EnumOrUnknown::new(super::sp_pipeline::AbortCondition::ABORT_CONDITION_UNSET) {
            my_size += ::protobuf::rt::int32_size(4, self.abort_condition.value());
        }
        my_size += ::protobuf::rt::unknown_fields_size(self.special_fields.unknown_fields());
        self.special_fields.cached_size().set(my_size as u32);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream<'_>) -> ::protobuf::Result<()> {
        if !self.name.is_empty() {
            os.write_string(1, &self.name)?;
        }
        if self.error != false {
            os.write_bool(2, self.error)?;
        }
        if !self.error_message.is_empty() {
            os.write_string(3, &self.error_message)?;
        }
        if self.abort_condition != ::protobuf::EnumOrUnknown::new(super::sp_pipeline::AbortCondition::ABORT_CONDITION_UNSET) {
            os.write_enum(4, ::protobuf::EnumOrUnknown::value(&self.abort_condition))?;
        }
        os.write_unknown_fields(self.special_fields.unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn special_fields(&self) -> &::protobuf::SpecialFields {
        &self.special_fields
    }

    fn mut_special_fields(&mut self) -> &mut ::protobuf::SpecialFields {
        &mut self.special_fields
    }

    fn new() -> StepStatus {
        StepStatus::new()
    }

    fn clear(&mut self) {
        self.name.clear();
        self.error = false;
        self.error_message.clear();
        self.abort_condition = ::protobuf::EnumOrUnknown::new(super::sp_pipeline::AbortCondition::ABORT_CONDITION_UNSET);
        self.special_fields.clear();
    }

    fn default_instance() -> &'static StepStatus {
        static instance: StepStatus = StepStatus {
            name: ::std::string::String::new(),
            error: false,
            error_message: ::std::string::String::new(),
            abort_condition: ::protobuf::EnumOrUnknown::from_i32(0),
            special_fields: ::protobuf::SpecialFields::new(),
        };
        &instance
    }
}

impl ::protobuf::MessageFull for StepStatus {
    fn descriptor() -> ::protobuf::reflect::MessageDescriptor {
        static descriptor: ::protobuf::rt::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::rt::Lazy::new();
        descriptor.get(|| file_descriptor().message_by_package_relative_name("StepStatus").unwrap()).clone()
    }
}

impl ::std::fmt::Display for StepStatus {
    fn fmt(&self, f: &mut ::std::fmt::Formatter<'_>) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for StepStatus {
    type RuntimeType = ::protobuf::reflect::rt::RuntimeTypeMessage<Self>;
}

static file_descriptor_proto_data: &'static [u8] = b"\
    \n\x0csp_sdk.proto\x12\x06protos\x1a\x11sp_pipeline.proto\"\x99\x02\n\
    \x0bSDKResponse\x12\x12\n\x04data\x18\x01\x20\x01(\x0cR\x04data\x12\x14\
    \n\x05error\x18\x02\x20\x01(\x08R\x05error\x12#\n\rerror_message\x18\x03\
    \x20\x01(\tR\x0cerrorMessage\x12?\n\x0fpipeline_status\x18\x04\x20\x03(\
    \x0b2\x16.protos.PipelineStatusR\x0epipelineStatus\x12=\n\x08metadata\
    \x18\x05\x20\x03(\x0b2!.protos.SDKResponse.MetadataEntryR\x08metadata\
    \x1a;\n\rMetadataEntry\x12\x10\n\x03key\x18\x01\x20\x01(\tR\x03key\x12\
    \x14\n\x05value\x18\x02\x20\x01(\tR\x05value:\x028\x01\"i\n\x0ePipelineS\
    tatus\x12\x0e\n\x02id\x18\x01\x20\x01(\tR\x02id\x12\x12\n\x04name\x18\
    \x02\x20\x01(\tR\x04name\x123\n\x0bstep_status\x18\x03\x20\x03(\x0b2\x12\
    .protos.StepStatusR\nstepStatus\"\x9c\x01\n\nStepStatus\x12\x12\n\x04nam\
    e\x18\x01\x20\x01(\tR\x04name\x12\x14\n\x05error\x18\x02\x20\x01(\x08R\
    \x05error\x12#\n\rerror_message\x18\x03\x20\x01(\tR\x0cerrorMessage\x12?\
    \n\x0fabort_condition\x18\x04\x20\x01(\x0e2\x16.protos.AbortConditionR\
    \x0eabortConditionB<Z:github.com/streamdal/streamdal/libs/protos/build/g\
    o/protosJ\x9e\x0f\n\x06\x12\x04\0\0;\x01\n\x08\n\x01\x0c\x12\x03\0\0\x12\
    \n\x08\n\x01\x02\x12\x03\x02\0\x0f\n\t\n\x02\x03\0\x12\x03\x04\0\x1b\n\
    \x08\n\x01\x08\x12\x03\x06\0Q\n\t\n\x02\x08\x0b\x12\x03\x06\0Q\n5\n\x02\
    \x04\0\x12\x04\t\0\x1f\x01\x1a)\x20Common\x20return\x20response\x20used\
    \x20by\x20all\x20SDKs\n\n\n\n\x03\x04\0\x01\x12\x03\t\x08\x13\n9\n\x04\
    \x04\0\x02\0\x12\x03\x0b\x02\x11\x1a,\x20Contains\x20(potentially)\x20mo\
    dified\x20input\x20data\n\n\x0c\n\x05\x04\0\x02\0\x05\x12\x03\x0b\x02\
    \x07\n\x0c\n\x05\x04\0\x02\0\x01\x12\x03\x0b\x08\x0c\n\x0c\n\x05\x04\0\
    \x02\0\x03\x12\x03\x0b\x0f\x10\n[\n\x04\x04\0\x02\x01\x12\x03\x0e\x02\
    \x11\x1aN\x20Indicates\x20if\x20.Process()\x20was\x20successful;\x20chec\
    k\x20error_message\x20for\x20more\x20details\n\n\x0c\n\x05\x04\0\x02\x01\
    \x05\x12\x03\x0e\x02\x06\n\x0c\n\x05\x04\0\x02\x01\x01\x12\x03\x0e\x07\
    \x0c\n\x0c\n\x05\x04\0\x02\x01\x03\x12\x03\x0e\x0f\x10\nT\n\x04\x04\0\
    \x02\x02\x12\x03\x11\x02\x1b\x1aG\x20If\x20an\x20error\x20==\x20true,\
    \x20this\x20will\x20contain\x20a\x20human-readable\x20error\x20message\n\
    \n\x0c\n\x05\x04\0\x02\x02\x05\x12\x03\x11\x02\x08\n\x0c\n\x05\x04\0\x02\
    \x02\x01\x12\x03\x11\t\x16\n\x0c\n\x05\x04\0\x02\x02\x03\x12\x03\x11\x19\
    \x1a\nV\n\x04\x04\0\x02\x03\x12\x03\x14\x02.\x1aI\x20An\x20array\x20of\
    \x20pipelines\x20that\x20the\x20SDK\x20executed\x20and\x20the\x20status\
    \x20of\x20each\x20step\n\n\x0c\n\x05\x04\0\x02\x03\x04\x12\x03\x14\x02\n\
    \n\x0c\n\x05\x04\0\x02\x03\x06\x12\x03\x14\x0b\x19\n\x0c\n\x05\x04\0\x02\
    \x03\x01\x12\x03\x14\x1a)\n\x0c\n\x05\x04\0\x02\x03\x03\x12\x03\x14,-\n\
    \x92\x03\n\x04\x04\0\x02\x04\x12\x03\x1e\x02#\x1a\x84\x03\x20Includes\
    \x20any\x20metadata\x20that\x20the\x20step(s)\x20may\x20want\x20to\x20pa\
    ss\x20back\x20to\x20the\x20user.\n\n\x20NOTE:\x20Metadata\x20is\x20aggre\
    gated\x20across\x20all\x20steps\x20in\x20the\x20pipeline,\x20so\x20if\
    \x20two\n\x20steps\x20both\x20set\x20a\x20key\x20\"foo\"\x20to\x20differ\
    ent\x20values,\x20the\x20value\x20of\x20\"foo\"\x20in\x20the\n\x20respon\
    se\x20will\x20be\x20the\x20value\x20set\x20by\x20the\x20last\x20step\x20\
    in\x20the\x20pipeline.\n\n\x20To\x20learn\x20more\x20about\x20\"metadata\
    \",\x20see\x20SDK\x20Spec\x20V2\x20doc\x20\"Pipeline\x20Step\x20&\x20Err\
    or\n\x20Behavior\"\x20section.\n\n\x0c\n\x05\x04\0\x02\x04\x06\x12\x03\
    \x1e\x02\x15\n\x0c\n\x05\x04\0\x02\x04\x01\x12\x03\x1e\x16\x1e\n\x0c\n\
    \x05\x04\0\x02\x04\x03\x12\x03\x1e!\"\n\n\n\x02\x04\x01\x12\x04!\0*\x01\
    \n\n\n\x03\x04\x01\x01\x12\x03!\x08\x16\n!\n\x04\x04\x01\x02\0\x12\x03#\
    \x02\x10\x1a\x14\x20ID\x20of\x20the\x20pipeline\n\n\x0c\n\x05\x04\x01\
    \x02\0\x05\x12\x03#\x02\x08\n\x0c\n\x05\x04\x01\x02\0\x01\x12\x03#\t\x0b\
    \n\x0c\n\x05\x04\x01\x02\0\x03\x12\x03#\x0e\x0f\n'\n\x04\x04\x01\x02\x01\
    \x12\x03&\x02\x12\x1a\x1a\x20The\x20name\x20of\x20the\x20pipeline\n\n\
    \x0c\n\x05\x04\x01\x02\x01\x05\x12\x03&\x02\x08\n\x0c\n\x05\x04\x01\x02\
    \x01\x01\x12\x03&\t\r\n\x0c\n\x05\x04\x01\x02\x01\x03\x12\x03&\x10\x11\n\
    6\n\x04\x04\x01\x02\x02\x12\x03)\x02&\x1a)\x20The\x20status\x20of\x20eac\
    h\x20step\x20in\x20the\x20pipeline\n\n\x0c\n\x05\x04\x01\x02\x02\x04\x12\
    \x03)\x02\n\n\x0c\n\x05\x04\x01\x02\x02\x06\x12\x03)\x0b\x15\n\x0c\n\x05\
    \x04\x01\x02\x02\x01\x12\x03)\x16!\n\x0c\n\x05\x04\x01\x02\x02\x03\x12\
    \x03)$%\n\n\n\x02\x04\x02\x12\x04,\0;\x01\n\n\n\x03\x04\x02\x01\x12\x03,\
    \x08\x12\n#\n\x04\x04\x02\x02\0\x12\x03.\x02\x12\x1a\x16\x20The\x20name\
    \x20of\x20the\x20step\n\n\x0c\n\x05\x04\x02\x02\0\x05\x12\x03.\x02\x08\n\
    \x0c\n\x05\x04\x02\x02\0\x01\x12\x03.\t\r\n\x0c\n\x05\x04\x02\x02\0\x03\
    \x12\x03.\x10\x11\n2\n\x04\x04\x02\x02\x01\x12\x031\x02\x11\x1a%\x20Did\
    \x20an\x20error\x20occur\x20during\x20the\x20step?\n\n\x0c\n\x05\x04\x02\
    \x02\x01\x05\x12\x031\x02\x06\n\x0c\n\x05\x04\x02\x02\x01\x01\x12\x031\
    \x07\x0c\n\x0c\n\x05\x04\x02\x02\x01\x03\x12\x031\x0f\x10\nQ\n\x04\x04\
    \x02\x02\x02\x12\x034\x02\x1b\x1aD\x20If\x20error\x20==\x20true,\x20this\
    \x20will\x20contain\x20a\x20human-readable\x20error\x20message\n\n\x0c\n\
    \x05\x04\x02\x02\x02\x05\x12\x034\x02\x08\n\x0c\n\x05\x04\x02\x02\x02\
    \x01\x12\x034\t\x16\n\x0c\n\x05\x04\x02\x02\x02\x03\x12\x034\x19\x1a\n\
    \xcd\x01\n\x04\x04\x02\x02\x03\x12\x03:\x02%\x1a\xbf\x01\x20Indicates\
    \x20if\x20current\x20or\x20all\x20future\x20pipelines\x20were\x20aborted\
    .\n\n\x20IMPORTANT:\x20Err\x20does\x20NOT\x20mean\x20that\x20the\x20pipe\
    line\x20was\x20aborted\x20-\x20the\x20user\x20has\n\x20to\x20explicitly\
    \x20define\x20an\x20abort\x20condition\x20for\x20on_error.\n\n\x0c\n\x05\
    \x04\x02\x02\x03\x06\x12\x03:\x02\x10\n\x0c\n\x05\x04\x02\x02\x03\x01\
    \x12\x03:\x11\x20\n\x0c\n\x05\x04\x02\x02\x03\x03\x12\x03:#$b\x06proto3\
";

/// `FileDescriptorProto` object which was a source for this generated file
fn file_descriptor_proto() -> &'static ::protobuf::descriptor::FileDescriptorProto {
    static file_descriptor_proto_lazy: ::protobuf::rt::Lazy<::protobuf::descriptor::FileDescriptorProto> = ::protobuf::rt::Lazy::new();
    file_descriptor_proto_lazy.get(|| {
        ::protobuf::Message::parse_from_bytes(file_descriptor_proto_data).unwrap()
    })
}

/// `FileDescriptor` object which allows dynamic access to files
pub fn file_descriptor() -> &'static ::protobuf::reflect::FileDescriptor {
    static generated_file_descriptor_lazy: ::protobuf::rt::Lazy<::protobuf::reflect::GeneratedFileDescriptor> = ::protobuf::rt::Lazy::new();
    static file_descriptor: ::protobuf::rt::Lazy<::protobuf::reflect::FileDescriptor> = ::protobuf::rt::Lazy::new();
    file_descriptor.get(|| {
        let generated_file_descriptor = generated_file_descriptor_lazy.get(|| {
            let mut deps = ::std::vec::Vec::with_capacity(1);
            deps.push(super::sp_pipeline::file_descriptor().clone());
            let mut messages = ::std::vec::Vec::with_capacity(3);
            messages.push(SDKResponse::generated_message_descriptor_data());
            messages.push(PipelineStatus::generated_message_descriptor_data());
            messages.push(StepStatus::generated_message_descriptor_data());
            let mut enums = ::std::vec::Vec::with_capacity(0);
            ::protobuf::reflect::GeneratedFileDescriptor::new_generated(
                file_descriptor_proto(),
                deps,
                messages,
                enums,
            )
        });
        ::protobuf::reflect::FileDescriptor::new_generated_2(generated_file_descriptor)
    })
}
