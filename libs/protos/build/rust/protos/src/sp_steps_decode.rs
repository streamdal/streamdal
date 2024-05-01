// This file is generated by rust-protobuf 3.4.0. Do not edit
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

//! Generated file from `steps/sp_steps_decode.proto`

/// Generated files are compatible only with the same version
/// of protobuf runtime.
const _PROTOBUF_VERSION_CHECK: () = ::protobuf::VERSION_3_4_0;

///  WIP
// @@protoc_insertion_point(message:protos.steps.DecodeStep)
#[derive(PartialEq,Clone,Default,Debug)]
pub struct DecodeStep {
    // message fields
    // @@protoc_insertion_point(field:protos.steps.DecodeStep.id)
    pub id: ::std::string::String,
    // special fields
    // @@protoc_insertion_point(special_field:protos.steps.DecodeStep.special_fields)
    pub special_fields: ::protobuf::SpecialFields,
}

impl<'a> ::std::default::Default for &'a DecodeStep {
    fn default() -> &'a DecodeStep {
        <DecodeStep as ::protobuf::Message>::default_instance()
    }
}

impl DecodeStep {
    pub fn new() -> DecodeStep {
        ::std::default::Default::default()
    }

    fn generated_message_descriptor_data() -> ::protobuf::reflect::GeneratedMessageDescriptorData {
        let mut fields = ::std::vec::Vec::with_capacity(1);
        let mut oneofs = ::std::vec::Vec::with_capacity(0);
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "id",
            |m: &DecodeStep| { &m.id },
            |m: &mut DecodeStep| { &mut m.id },
        ));
        ::protobuf::reflect::GeneratedMessageDescriptorData::new_2::<DecodeStep>(
            "DecodeStep",
            fields,
            oneofs,
        )
    }
}

impl ::protobuf::Message for DecodeStep {
    const NAME: &'static str = "DecodeStep";

    fn is_initialized(&self) -> bool {
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream<'_>) -> ::protobuf::Result<()> {
        while let Some(tag) = is.read_raw_tag_or_eof()? {
            match tag {
                10 => {
                    self.id = is.read_string()?;
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
        my_size += ::protobuf::rt::unknown_fields_size(self.special_fields.unknown_fields());
        self.special_fields.cached_size().set(my_size as u32);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream<'_>) -> ::protobuf::Result<()> {
        if !self.id.is_empty() {
            os.write_string(1, &self.id)?;
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

    fn new() -> DecodeStep {
        DecodeStep::new()
    }

    fn clear(&mut self) {
        self.id.clear();
        self.special_fields.clear();
    }

    fn default_instance() -> &'static DecodeStep {
        static instance: DecodeStep = DecodeStep {
            id: ::std::string::String::new(),
            special_fields: ::protobuf::SpecialFields::new(),
        };
        &instance
    }
}

impl ::protobuf::MessageFull for DecodeStep {
    fn descriptor() -> ::protobuf::reflect::MessageDescriptor {
        static descriptor: ::protobuf::rt::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::rt::Lazy::new();
        descriptor.get(|| file_descriptor().message_by_package_relative_name("DecodeStep").unwrap()).clone()
    }
}

impl ::std::fmt::Display for DecodeStep {
    fn fmt(&self, f: &mut ::std::fmt::Formatter<'_>) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for DecodeStep {
    type RuntimeType = ::protobuf::reflect::rt::RuntimeTypeMessage<Self>;
}

static file_descriptor_proto_data: &'static [u8] = b"\
    \n\x1bsteps/sp_steps_decode.proto\x12\x0cprotos.steps\"\x1c\n\nDecodeSte\
    p\x12\x0e\n\x02id\x18\x01\x20\x01(\tR\x02idBVZ@github.com/streamdal/stre\
    amdal/libs/protos/build/go/protos/steps\xea\x02\x11Streamdal::ProtosJ\
    \x9c\x01\n\x06\x12\x04\0\0\n\x01\n\x08\n\x01\x0c\x12\x03\0\0\x12\n\x08\n\
    \x01\x02\x12\x03\x02\0\x15\n\x08\n\x01\x08\x12\x03\x04\0W\n\t\n\x02\x08\
    \x0b\x12\x03\x04\0W\n\x08\n\x01\x08\x12\x03\x05\0*\n\t\n\x02\x08-\x12\
    \x03\x05\0*\n\x11\n\x02\x04\0\x12\x04\x08\0\n\x01\x1a\x05\x20WIP\n\n\n\n\
    \x03\x04\0\x01\x12\x03\x08\x08\x12\n\x0b\n\x04\x04\0\x02\0\x12\x03\t\x02\
    \x10\n\x0c\n\x05\x04\0\x02\0\x05\x12\x03\t\x02\x08\n\x0c\n\x05\x04\0\x02\
    \0\x01\x12\x03\t\t\x0b\n\x0c\n\x05\x04\0\x02\0\x03\x12\x03\t\x0e\x0fb\
    \x06proto3\
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
            let mut deps = ::std::vec::Vec::with_capacity(0);
            let mut messages = ::std::vec::Vec::with_capacity(1);
            messages.push(DecodeStep::generated_message_descriptor_data());
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
