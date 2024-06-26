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

//! Generated file from `steps/sp_steps_httprequest.proto`

/// Generated files are compatible only with the same version
/// of protobuf runtime.
const _PROTOBUF_VERSION_CHECK: () = ::protobuf::VERSION_3_4_0;

// @@protoc_insertion_point(message:protos.steps.HttpRequest)
#[derive(PartialEq,Clone,Default,Debug)]
pub struct HttpRequest {
    // message fields
    // @@protoc_insertion_point(field:protos.steps.HttpRequest.method)
    pub method: ::protobuf::EnumOrUnknown<HttpRequestMethod>,
    // @@protoc_insertion_point(field:protos.steps.HttpRequest.url)
    pub url: ::std::string::String,
    // @@protoc_insertion_point(field:protos.steps.HttpRequest.body)
    pub body: ::std::vec::Vec<u8>,
    // @@protoc_insertion_point(field:protos.steps.HttpRequest.headers)
    pub headers: ::std::collections::HashMap<::std::string::String, ::std::string::String>,
    // @@protoc_insertion_point(field:protos.steps.HttpRequest.body_mode)
    pub body_mode: ::protobuf::EnumOrUnknown<HttpRequestBodyMode>,
    // special fields
    // @@protoc_insertion_point(special_field:protos.steps.HttpRequest.special_fields)
    pub special_fields: ::protobuf::SpecialFields,
}

impl<'a> ::std::default::Default for &'a HttpRequest {
    fn default() -> &'a HttpRequest {
        <HttpRequest as ::protobuf::Message>::default_instance()
    }
}

impl HttpRequest {
    pub fn new() -> HttpRequest {
        ::std::default::Default::default()
    }

    fn generated_message_descriptor_data() -> ::protobuf::reflect::GeneratedMessageDescriptorData {
        let mut fields = ::std::vec::Vec::with_capacity(5);
        let mut oneofs = ::std::vec::Vec::with_capacity(0);
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "method",
            |m: &HttpRequest| { &m.method },
            |m: &mut HttpRequest| { &mut m.method },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "url",
            |m: &HttpRequest| { &m.url },
            |m: &mut HttpRequest| { &mut m.url },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "body",
            |m: &HttpRequest| { &m.body },
            |m: &mut HttpRequest| { &mut m.body },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_map_simpler_accessor::<_, _, _>(
            "headers",
            |m: &HttpRequest| { &m.headers },
            |m: &mut HttpRequest| { &mut m.headers },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "body_mode",
            |m: &HttpRequest| { &m.body_mode },
            |m: &mut HttpRequest| { &mut m.body_mode },
        ));
        ::protobuf::reflect::GeneratedMessageDescriptorData::new_2::<HttpRequest>(
            "HttpRequest",
            fields,
            oneofs,
        )
    }
}

impl ::protobuf::Message for HttpRequest {
    const NAME: &'static str = "HttpRequest";

    fn is_initialized(&self) -> bool {
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream<'_>) -> ::protobuf::Result<()> {
        while let Some(tag) = is.read_raw_tag_or_eof()? {
            match tag {
                8 => {
                    self.method = is.read_enum_or_unknown()?;
                },
                18 => {
                    self.url = is.read_string()?;
                },
                26 => {
                    self.body = is.read_bytes()?;
                },
                34 => {
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
                    self.headers.insert(key, value);
                },
                40 => {
                    self.body_mode = is.read_enum_or_unknown()?;
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
        if self.method != ::protobuf::EnumOrUnknown::new(HttpRequestMethod::HTTP_REQUEST_METHOD_UNSET) {
            my_size += ::protobuf::rt::int32_size(1, self.method.value());
        }
        if !self.url.is_empty() {
            my_size += ::protobuf::rt::string_size(2, &self.url);
        }
        if !self.body.is_empty() {
            my_size += ::protobuf::rt::bytes_size(3, &self.body);
        }
        for (k, v) in &self.headers {
            let mut entry_size = 0;
            entry_size += ::protobuf::rt::string_size(1, &k);
            entry_size += ::protobuf::rt::string_size(2, &v);
            my_size += 1 + ::protobuf::rt::compute_raw_varint64_size(entry_size) + entry_size
        };
        if self.body_mode != ::protobuf::EnumOrUnknown::new(HttpRequestBodyMode::HTTP_REQUEST_BODY_MODE_UNSET) {
            my_size += ::protobuf::rt::int32_size(5, self.body_mode.value());
        }
        my_size += ::protobuf::rt::unknown_fields_size(self.special_fields.unknown_fields());
        self.special_fields.cached_size().set(my_size as u32);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream<'_>) -> ::protobuf::Result<()> {
        if self.method != ::protobuf::EnumOrUnknown::new(HttpRequestMethod::HTTP_REQUEST_METHOD_UNSET) {
            os.write_enum(1, ::protobuf::EnumOrUnknown::value(&self.method))?;
        }
        if !self.url.is_empty() {
            os.write_string(2, &self.url)?;
        }
        if !self.body.is_empty() {
            os.write_bytes(3, &self.body)?;
        }
        for (k, v) in &self.headers {
            let mut entry_size = 0;
            entry_size += ::protobuf::rt::string_size(1, &k);
            entry_size += ::protobuf::rt::string_size(2, &v);
            os.write_raw_varint32(34)?; // Tag.
            os.write_raw_varint32(entry_size as u32)?;
            os.write_string(1, &k)?;
            os.write_string(2, &v)?;
        };
        if self.body_mode != ::protobuf::EnumOrUnknown::new(HttpRequestBodyMode::HTTP_REQUEST_BODY_MODE_UNSET) {
            os.write_enum(5, ::protobuf::EnumOrUnknown::value(&self.body_mode))?;
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

    fn new() -> HttpRequest {
        HttpRequest::new()
    }

    fn clear(&mut self) {
        self.method = ::protobuf::EnumOrUnknown::new(HttpRequestMethod::HTTP_REQUEST_METHOD_UNSET);
        self.url.clear();
        self.body.clear();
        self.headers.clear();
        self.body_mode = ::protobuf::EnumOrUnknown::new(HttpRequestBodyMode::HTTP_REQUEST_BODY_MODE_UNSET);
        self.special_fields.clear();
    }

    fn default_instance() -> &'static HttpRequest {
        static instance: ::protobuf::rt::Lazy<HttpRequest> = ::protobuf::rt::Lazy::new();
        instance.get(HttpRequest::new)
    }
}

impl ::protobuf::MessageFull for HttpRequest {
    fn descriptor() -> ::protobuf::reflect::MessageDescriptor {
        static descriptor: ::protobuf::rt::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::rt::Lazy::new();
        descriptor.get(|| file_descriptor().message_by_package_relative_name("HttpRequest").unwrap()).clone()
    }
}

impl ::std::fmt::Display for HttpRequest {
    fn fmt(&self, f: &mut ::std::fmt::Formatter<'_>) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for HttpRequest {
    type RuntimeType = ::protobuf::reflect::rt::RuntimeTypeMessage<Self>;
}

// @@protoc_insertion_point(message:protos.steps.HttpResponse)
#[derive(PartialEq,Clone,Default,Debug)]
pub struct HttpResponse {
    // message fields
    // @@protoc_insertion_point(field:protos.steps.HttpResponse.code)
    pub code: i32,
    // @@protoc_insertion_point(field:protos.steps.HttpResponse.body)
    pub body: ::std::vec::Vec<u8>,
    // @@protoc_insertion_point(field:protos.steps.HttpResponse.headers)
    pub headers: ::std::collections::HashMap<::std::string::String, ::std::string::String>,
    // special fields
    // @@protoc_insertion_point(special_field:protos.steps.HttpResponse.special_fields)
    pub special_fields: ::protobuf::SpecialFields,
}

impl<'a> ::std::default::Default for &'a HttpResponse {
    fn default() -> &'a HttpResponse {
        <HttpResponse as ::protobuf::Message>::default_instance()
    }
}

impl HttpResponse {
    pub fn new() -> HttpResponse {
        ::std::default::Default::default()
    }

    fn generated_message_descriptor_data() -> ::protobuf::reflect::GeneratedMessageDescriptorData {
        let mut fields = ::std::vec::Vec::with_capacity(3);
        let mut oneofs = ::std::vec::Vec::with_capacity(0);
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "code",
            |m: &HttpResponse| { &m.code },
            |m: &mut HttpResponse| { &mut m.code },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_simpler_field_accessor::<_, _>(
            "body",
            |m: &HttpResponse| { &m.body },
            |m: &mut HttpResponse| { &mut m.body },
        ));
        fields.push(::protobuf::reflect::rt::v2::make_map_simpler_accessor::<_, _, _>(
            "headers",
            |m: &HttpResponse| { &m.headers },
            |m: &mut HttpResponse| { &mut m.headers },
        ));
        ::protobuf::reflect::GeneratedMessageDescriptorData::new_2::<HttpResponse>(
            "HttpResponse",
            fields,
            oneofs,
        )
    }
}

impl ::protobuf::Message for HttpResponse {
    const NAME: &'static str = "HttpResponse";

    fn is_initialized(&self) -> bool {
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream<'_>) -> ::protobuf::Result<()> {
        while let Some(tag) = is.read_raw_tag_or_eof()? {
            match tag {
                8 => {
                    self.code = is.read_int32()?;
                },
                18 => {
                    self.body = is.read_bytes()?;
                },
                26 => {
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
                    self.headers.insert(key, value);
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
        if self.code != 0 {
            my_size += ::protobuf::rt::int32_size(1, self.code);
        }
        if !self.body.is_empty() {
            my_size += ::protobuf::rt::bytes_size(2, &self.body);
        }
        for (k, v) in &self.headers {
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
        if self.code != 0 {
            os.write_int32(1, self.code)?;
        }
        if !self.body.is_empty() {
            os.write_bytes(2, &self.body)?;
        }
        for (k, v) in &self.headers {
            let mut entry_size = 0;
            entry_size += ::protobuf::rt::string_size(1, &k);
            entry_size += ::protobuf::rt::string_size(2, &v);
            os.write_raw_varint32(26)?; // Tag.
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

    fn new() -> HttpResponse {
        HttpResponse::new()
    }

    fn clear(&mut self) {
        self.code = 0;
        self.body.clear();
        self.headers.clear();
        self.special_fields.clear();
    }

    fn default_instance() -> &'static HttpResponse {
        static instance: ::protobuf::rt::Lazy<HttpResponse> = ::protobuf::rt::Lazy::new();
        instance.get(HttpResponse::new)
    }
}

impl ::protobuf::MessageFull for HttpResponse {
    fn descriptor() -> ::protobuf::reflect::MessageDescriptor {
        static descriptor: ::protobuf::rt::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::rt::Lazy::new();
        descriptor.get(|| file_descriptor().message_by_package_relative_name("HttpResponse").unwrap()).clone()
    }
}

impl ::std::fmt::Display for HttpResponse {
    fn fmt(&self, f: &mut ::std::fmt::Formatter<'_>) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for HttpResponse {
    type RuntimeType = ::protobuf::reflect::rt::RuntimeTypeMessage<Self>;
}

// @@protoc_insertion_point(message:protos.steps.HttpRequestStep)
#[derive(PartialEq,Clone,Default,Debug)]
pub struct HttpRequestStep {
    // message fields
    // @@protoc_insertion_point(field:protos.steps.HttpRequestStep.request)
    pub request: ::protobuf::MessageField<HttpRequest>,
    // special fields
    // @@protoc_insertion_point(special_field:protos.steps.HttpRequestStep.special_fields)
    pub special_fields: ::protobuf::SpecialFields,
}

impl<'a> ::std::default::Default for &'a HttpRequestStep {
    fn default() -> &'a HttpRequestStep {
        <HttpRequestStep as ::protobuf::Message>::default_instance()
    }
}

impl HttpRequestStep {
    pub fn new() -> HttpRequestStep {
        ::std::default::Default::default()
    }

    fn generated_message_descriptor_data() -> ::protobuf::reflect::GeneratedMessageDescriptorData {
        let mut fields = ::std::vec::Vec::with_capacity(1);
        let mut oneofs = ::std::vec::Vec::with_capacity(0);
        fields.push(::protobuf::reflect::rt::v2::make_message_field_accessor::<_, HttpRequest>(
            "request",
            |m: &HttpRequestStep| { &m.request },
            |m: &mut HttpRequestStep| { &mut m.request },
        ));
        ::protobuf::reflect::GeneratedMessageDescriptorData::new_2::<HttpRequestStep>(
            "HttpRequestStep",
            fields,
            oneofs,
        )
    }
}

impl ::protobuf::Message for HttpRequestStep {
    const NAME: &'static str = "HttpRequestStep";

    fn is_initialized(&self) -> bool {
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream<'_>) -> ::protobuf::Result<()> {
        while let Some(tag) = is.read_raw_tag_or_eof()? {
            match tag {
                10 => {
                    ::protobuf::rt::read_singular_message_into_field(is, &mut self.request)?;
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
        if let Some(v) = self.request.as_ref() {
            let len = v.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint64_size(len) + len;
        }
        my_size += ::protobuf::rt::unknown_fields_size(self.special_fields.unknown_fields());
        self.special_fields.cached_size().set(my_size as u32);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream<'_>) -> ::protobuf::Result<()> {
        if let Some(v) = self.request.as_ref() {
            ::protobuf::rt::write_message_field_with_cached_size(1, v, os)?;
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

    fn new() -> HttpRequestStep {
        HttpRequestStep::new()
    }

    fn clear(&mut self) {
        self.request.clear();
        self.special_fields.clear();
    }

    fn default_instance() -> &'static HttpRequestStep {
        static instance: HttpRequestStep = HttpRequestStep {
            request: ::protobuf::MessageField::none(),
            special_fields: ::protobuf::SpecialFields::new(),
        };
        &instance
    }
}

impl ::protobuf::MessageFull for HttpRequestStep {
    fn descriptor() -> ::protobuf::reflect::MessageDescriptor {
        static descriptor: ::protobuf::rt::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::rt::Lazy::new();
        descriptor.get(|| file_descriptor().message_by_package_relative_name("HttpRequestStep").unwrap()).clone()
    }
}

impl ::std::fmt::Display for HttpRequestStep {
    fn fmt(&self, f: &mut ::std::fmt::Formatter<'_>) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for HttpRequestStep {
    type RuntimeType = ::protobuf::reflect::rt::RuntimeTypeMessage<Self>;
}

#[derive(Clone,Copy,PartialEq,Eq,Debug,Hash)]
// @@protoc_insertion_point(enum:protos.steps.HttpRequestMethod)
pub enum HttpRequestMethod {
    // @@protoc_insertion_point(enum_value:protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_UNSET)
    HTTP_REQUEST_METHOD_UNSET = 0,
    // @@protoc_insertion_point(enum_value:protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_GET)
    HTTP_REQUEST_METHOD_GET = 1,
    // @@protoc_insertion_point(enum_value:protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_POST)
    HTTP_REQUEST_METHOD_POST = 2,
    // @@protoc_insertion_point(enum_value:protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_PUT)
    HTTP_REQUEST_METHOD_PUT = 3,
    // @@protoc_insertion_point(enum_value:protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_DELETE)
    HTTP_REQUEST_METHOD_DELETE = 4,
    // @@protoc_insertion_point(enum_value:protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_PATCH)
    HTTP_REQUEST_METHOD_PATCH = 5,
    // @@protoc_insertion_point(enum_value:protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_HEAD)
    HTTP_REQUEST_METHOD_HEAD = 6,
    // @@protoc_insertion_point(enum_value:protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_OPTIONS)
    HTTP_REQUEST_METHOD_OPTIONS = 7,
}

impl ::protobuf::Enum for HttpRequestMethod {
    const NAME: &'static str = "HttpRequestMethod";

    fn value(&self) -> i32 {
        *self as i32
    }

    fn from_i32(value: i32) -> ::std::option::Option<HttpRequestMethod> {
        match value {
            0 => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_UNSET),
            1 => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_GET),
            2 => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_POST),
            3 => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_PUT),
            4 => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_DELETE),
            5 => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_PATCH),
            6 => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_HEAD),
            7 => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_OPTIONS),
            _ => ::std::option::Option::None
        }
    }

    fn from_str(str: &str) -> ::std::option::Option<HttpRequestMethod> {
        match str {
            "HTTP_REQUEST_METHOD_UNSET" => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_UNSET),
            "HTTP_REQUEST_METHOD_GET" => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_GET),
            "HTTP_REQUEST_METHOD_POST" => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_POST),
            "HTTP_REQUEST_METHOD_PUT" => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_PUT),
            "HTTP_REQUEST_METHOD_DELETE" => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_DELETE),
            "HTTP_REQUEST_METHOD_PATCH" => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_PATCH),
            "HTTP_REQUEST_METHOD_HEAD" => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_HEAD),
            "HTTP_REQUEST_METHOD_OPTIONS" => ::std::option::Option::Some(HttpRequestMethod::HTTP_REQUEST_METHOD_OPTIONS),
            _ => ::std::option::Option::None
        }
    }

    const VALUES: &'static [HttpRequestMethod] = &[
        HttpRequestMethod::HTTP_REQUEST_METHOD_UNSET,
        HttpRequestMethod::HTTP_REQUEST_METHOD_GET,
        HttpRequestMethod::HTTP_REQUEST_METHOD_POST,
        HttpRequestMethod::HTTP_REQUEST_METHOD_PUT,
        HttpRequestMethod::HTTP_REQUEST_METHOD_DELETE,
        HttpRequestMethod::HTTP_REQUEST_METHOD_PATCH,
        HttpRequestMethod::HTTP_REQUEST_METHOD_HEAD,
        HttpRequestMethod::HTTP_REQUEST_METHOD_OPTIONS,
    ];
}

impl ::protobuf::EnumFull for HttpRequestMethod {
    fn enum_descriptor() -> ::protobuf::reflect::EnumDescriptor {
        static descriptor: ::protobuf::rt::Lazy<::protobuf::reflect::EnumDescriptor> = ::protobuf::rt::Lazy::new();
        descriptor.get(|| file_descriptor().enum_by_package_relative_name("HttpRequestMethod").unwrap()).clone()
    }

    fn descriptor(&self) -> ::protobuf::reflect::EnumValueDescriptor {
        let index = *self as usize;
        Self::enum_descriptor().value_by_index(index)
    }
}

impl ::std::default::Default for HttpRequestMethod {
    fn default() -> Self {
        HttpRequestMethod::HTTP_REQUEST_METHOD_UNSET
    }
}

impl HttpRequestMethod {
    fn generated_enum_descriptor_data() -> ::protobuf::reflect::GeneratedEnumDescriptorData {
        ::protobuf::reflect::GeneratedEnumDescriptorData::new::<HttpRequestMethod>("HttpRequestMethod")
    }
}

#[derive(Clone,Copy,PartialEq,Eq,Debug,Hash)]
// @@protoc_insertion_point(enum:protos.steps.HttpRequestBodyMode)
pub enum HttpRequestBodyMode {
    // @@protoc_insertion_point(enum_value:protos.steps.HttpRequestBodyMode.HTTP_REQUEST_BODY_MODE_UNSET)
    HTTP_REQUEST_BODY_MODE_UNSET = 0,
    // @@protoc_insertion_point(enum_value:protos.steps.HttpRequestBodyMode.HTTP_REQUEST_BODY_MODE_STATIC)
    HTTP_REQUEST_BODY_MODE_STATIC = 1,
    // @@protoc_insertion_point(enum_value:protos.steps.HttpRequestBodyMode.HTTP_REQUEST_BODY_MODE_INTER_STEP_RESULT)
    HTTP_REQUEST_BODY_MODE_INTER_STEP_RESULT = 2,
}

impl ::protobuf::Enum for HttpRequestBodyMode {
    const NAME: &'static str = "HttpRequestBodyMode";

    fn value(&self) -> i32 {
        *self as i32
    }

    fn from_i32(value: i32) -> ::std::option::Option<HttpRequestBodyMode> {
        match value {
            0 => ::std::option::Option::Some(HttpRequestBodyMode::HTTP_REQUEST_BODY_MODE_UNSET),
            1 => ::std::option::Option::Some(HttpRequestBodyMode::HTTP_REQUEST_BODY_MODE_STATIC),
            2 => ::std::option::Option::Some(HttpRequestBodyMode::HTTP_REQUEST_BODY_MODE_INTER_STEP_RESULT),
            _ => ::std::option::Option::None
        }
    }

    fn from_str(str: &str) -> ::std::option::Option<HttpRequestBodyMode> {
        match str {
            "HTTP_REQUEST_BODY_MODE_UNSET" => ::std::option::Option::Some(HttpRequestBodyMode::HTTP_REQUEST_BODY_MODE_UNSET),
            "HTTP_REQUEST_BODY_MODE_STATIC" => ::std::option::Option::Some(HttpRequestBodyMode::HTTP_REQUEST_BODY_MODE_STATIC),
            "HTTP_REQUEST_BODY_MODE_INTER_STEP_RESULT" => ::std::option::Option::Some(HttpRequestBodyMode::HTTP_REQUEST_BODY_MODE_INTER_STEP_RESULT),
            _ => ::std::option::Option::None
        }
    }

    const VALUES: &'static [HttpRequestBodyMode] = &[
        HttpRequestBodyMode::HTTP_REQUEST_BODY_MODE_UNSET,
        HttpRequestBodyMode::HTTP_REQUEST_BODY_MODE_STATIC,
        HttpRequestBodyMode::HTTP_REQUEST_BODY_MODE_INTER_STEP_RESULT,
    ];
}

impl ::protobuf::EnumFull for HttpRequestBodyMode {
    fn enum_descriptor() -> ::protobuf::reflect::EnumDescriptor {
        static descriptor: ::protobuf::rt::Lazy<::protobuf::reflect::EnumDescriptor> = ::protobuf::rt::Lazy::new();
        descriptor.get(|| file_descriptor().enum_by_package_relative_name("HttpRequestBodyMode").unwrap()).clone()
    }

    fn descriptor(&self) -> ::protobuf::reflect::EnumValueDescriptor {
        let index = *self as usize;
        Self::enum_descriptor().value_by_index(index)
    }
}

impl ::std::default::Default for HttpRequestBodyMode {
    fn default() -> Self {
        HttpRequestBodyMode::HTTP_REQUEST_BODY_MODE_UNSET
    }
}

impl HttpRequestBodyMode {
    fn generated_enum_descriptor_data() -> ::protobuf::reflect::GeneratedEnumDescriptorData {
        ::protobuf::reflect::GeneratedEnumDescriptorData::new::<HttpRequestBodyMode>("HttpRequestBodyMode")
    }
}

static file_descriptor_proto_data: &'static [u8] = b"\
    \n\x20steps/sp_steps_httprequest.proto\x12\x0cprotos.steps\"\xaa\x02\n\
    \x0bHttpRequest\x127\n\x06method\x18\x01\x20\x01(\x0e2\x1f.protos.steps.\
    HttpRequestMethodR\x06method\x12\x10\n\x03url\x18\x02\x20\x01(\tR\x03url\
    \x12\x12\n\x04body\x18\x03\x20\x01(\x0cR\x04body\x12@\n\x07headers\x18\
    \x04\x20\x03(\x0b2&.protos.steps.HttpRequest.HeadersEntryR\x07headers\
    \x12>\n\tbody_mode\x18\x05\x20\x01(\x0e2!.protos.steps.HttpRequestBodyMo\
    deR\x08bodyMode\x1a:\n\x0cHeadersEntry\x12\x10\n\x03key\x18\x01\x20\x01(\
    \tR\x03key\x12\x14\n\x05value\x18\x02\x20\x01(\tR\x05value:\x028\x01\"\
    \xb5\x01\n\x0cHttpResponse\x12\x12\n\x04code\x18\x01\x20\x01(\x05R\x04co\
    de\x12\x12\n\x04body\x18\x02\x20\x01(\x0cR\x04body\x12A\n\x07headers\x18\
    \x03\x20\x03(\x0b2'.protos.steps.HttpResponse.HeadersEntryR\x07headers\
    \x1a:\n\x0cHeadersEntry\x12\x10\n\x03key\x18\x01\x20\x01(\tR\x03key\x12\
    \x14\n\x05value\x18\x02\x20\x01(\tR\x05value:\x028\x01\"F\n\x0fHttpReque\
    stStep\x123\n\x07request\x18\x01\x20\x01(\x0b2\x19.protos.steps.HttpRequ\
    estR\x07request*\x88\x02\n\x11HttpRequestMethod\x12\x1d\n\x19HTTP_REQUES\
    T_METHOD_UNSET\x10\0\x12\x1b\n\x17HTTP_REQUEST_METHOD_GET\x10\x01\x12\
    \x1c\n\x18HTTP_REQUEST_METHOD_POST\x10\x02\x12\x1b\n\x17HTTP_REQUEST_MET\
    HOD_PUT\x10\x03\x12\x1e\n\x1aHTTP_REQUEST_METHOD_DELETE\x10\x04\x12\x1d\
    \n\x19HTTP_REQUEST_METHOD_PATCH\x10\x05\x12\x1c\n\x18HTTP_REQUEST_METHOD\
    _HEAD\x10\x06\x12\x1f\n\x1bHTTP_REQUEST_METHOD_OPTIONS\x10\x07*\x88\x01\
    \n\x13HttpRequestBodyMode\x12\x20\n\x1cHTTP_REQUEST_BODY_MODE_UNSET\x10\
    \0\x12!\n\x1dHTTP_REQUEST_BODY_MODE_STATIC\x10\x01\x12,\n(HTTP_REQUEST_B\
    ODY_MODE_INTER_STEP_RESULT\x10\x02BVZ@github.com/streamdal/streamdal/lib\
    s/protos/build/go/protos/steps\xea\x02\x11Streamdal::ProtosJ\xf0\x08\n\
    \x06\x12\x04\0\0(\x01\n\x08\n\x01\x0c\x12\x03\0\0\x12\n\x08\n\x01\x02\
    \x12\x03\x02\0\x15\n\x08\n\x01\x08\x12\x03\x04\0W\n\t\n\x02\x08\x0b\x12\
    \x03\x04\0W\n\x08\n\x01\x08\x12\x03\x05\0*\n\t\n\x02\x08-\x12\x03\x05\0*\
    \n\n\n\x02\x05\0\x12\x04\x07\0\x10\x01\n\n\n\x03\x05\0\x01\x12\x03\x07\
    \x05\x16\n\x0b\n\x04\x05\0\x02\0\x12\x03\x08\x02\x20\n\x0c\n\x05\x05\0\
    \x02\0\x01\x12\x03\x08\x02\x1b\n\x0c\n\x05\x05\0\x02\0\x02\x12\x03\x08\
    \x1e\x1f\n\x0b\n\x04\x05\0\x02\x01\x12\x03\t\x02\x1e\n\x0c\n\x05\x05\0\
    \x02\x01\x01\x12\x03\t\x02\x19\n\x0c\n\x05\x05\0\x02\x01\x02\x12\x03\t\
    \x1c\x1d\n\x0b\n\x04\x05\0\x02\x02\x12\x03\n\x02\x1f\n\x0c\n\x05\x05\0\
    \x02\x02\x01\x12\x03\n\x02\x1a\n\x0c\n\x05\x05\0\x02\x02\x02\x12\x03\n\
    \x1d\x1e\n\x0b\n\x04\x05\0\x02\x03\x12\x03\x0b\x02\x1e\n\x0c\n\x05\x05\0\
    \x02\x03\x01\x12\x03\x0b\x02\x19\n\x0c\n\x05\x05\0\x02\x03\x02\x12\x03\
    \x0b\x1c\x1d\n\x0b\n\x04\x05\0\x02\x04\x12\x03\x0c\x02!\n\x0c\n\x05\x05\
    \0\x02\x04\x01\x12\x03\x0c\x02\x1c\n\x0c\n\x05\x05\0\x02\x04\x02\x12\x03\
    \x0c\x1f\x20\n\x0b\n\x04\x05\0\x02\x05\x12\x03\r\x02\x20\n\x0c\n\x05\x05\
    \0\x02\x05\x01\x12\x03\r\x02\x1b\n\x0c\n\x05\x05\0\x02\x05\x02\x12\x03\r\
    \x1e\x1f\n\x0b\n\x04\x05\0\x02\x06\x12\x03\x0e\x02\x1f\n\x0c\n\x05\x05\0\
    \x02\x06\x01\x12\x03\x0e\x02\x1a\n\x0c\n\x05\x05\0\x02\x06\x02\x12\x03\
    \x0e\x1d\x1e\n\x0b\n\x04\x05\0\x02\x07\x12\x03\x0f\x02\"\n\x0c\n\x05\x05\
    \0\x02\x07\x01\x12\x03\x0f\x02\x1d\n\x0c\n\x05\x05\0\x02\x07\x02\x12\x03\
    \x0f\x20!\n\n\n\x02\x05\x01\x12\x04\x12\0\x16\x01\n\n\n\x03\x05\x01\x01\
    \x12\x03\x12\x05\x18\n\x0b\n\x04\x05\x01\x02\0\x12\x03\x13\x02#\n\x0c\n\
    \x05\x05\x01\x02\0\x01\x12\x03\x13\x02\x1e\n\x0c\n\x05\x05\x01\x02\0\x02\
    \x12\x03\x13!\"\n\x0b\n\x04\x05\x01\x02\x01\x12\x03\x14\x02$\n\x0c\n\x05\
    \x05\x01\x02\x01\x01\x12\x03\x14\x02\x1f\n\x0c\n\x05\x05\x01\x02\x01\x02\
    \x12\x03\x14\"#\n\x0b\n\x04\x05\x01\x02\x02\x12\x03\x15\x02/\n\x0c\n\x05\
    \x05\x01\x02\x02\x01\x12\x03\x15\x02*\n\x0c\n\x05\x05\x01\x02\x02\x02\
    \x12\x03\x15-.\n\n\n\x02\x04\0\x12\x04\x18\0\x1e\x01\n\n\n\x03\x04\0\x01\
    \x12\x03\x18\x08\x13\n\x0b\n\x04\x04\0\x02\0\x12\x03\x19\x02\x1f\n\x0c\n\
    \x05\x04\0\x02\0\x06\x12\x03\x19\x02\x13\n\x0c\n\x05\x04\0\x02\0\x01\x12\
    \x03\x19\x14\x1a\n\x0c\n\x05\x04\0\x02\0\x03\x12\x03\x19\x1d\x1e\n\x0b\n\
    \x04\x04\0\x02\x01\x12\x03\x1a\x02\x11\n\x0c\n\x05\x04\0\x02\x01\x05\x12\
    \x03\x1a\x02\x08\n\x0c\n\x05\x04\0\x02\x01\x01\x12\x03\x1a\t\x0c\n\x0c\n\
    \x05\x04\0\x02\x01\x03\x12\x03\x1a\x0f\x10\n\x0b\n\x04\x04\0\x02\x02\x12\
    \x03\x1b\x02\x11\n\x0c\n\x05\x04\0\x02\x02\x05\x12\x03\x1b\x02\x07\n\x0c\
    \n\x05\x04\0\x02\x02\x01\x12\x03\x1b\x08\x0c\n\x0c\n\x05\x04\0\x02\x02\
    \x03\x12\x03\x1b\x0f\x10\n\x0b\n\x04\x04\0\x02\x03\x12\x03\x1c\x02!\n\
    \x0c\n\x05\x04\0\x02\x03\x06\x12\x03\x1c\x02\x14\n\x0c\n\x05\x04\0\x02\
    \x03\x01\x12\x03\x1c\x15\x1c\n\x0c\n\x05\x04\0\x02\x03\x03\x12\x03\x1c\
    \x1f\x20\n\x0b\n\x04\x04\0\x02\x04\x12\x03\x1d\x02$\n\x0c\n\x05\x04\0\
    \x02\x04\x06\x12\x03\x1d\x02\x15\n\x0c\n\x05\x04\0\x02\x04\x01\x12\x03\
    \x1d\x16\x1f\n\x0c\n\x05\x04\0\x02\x04\x03\x12\x03\x1d\"#\n\n\n\x02\x04\
    \x01\x12\x04\x20\0$\x01\n\n\n\x03\x04\x01\x01\x12\x03\x20\x08\x14\n\x0b\
    \n\x04\x04\x01\x02\0\x12\x03!\x02\x11\n\x0c\n\x05\x04\x01\x02\0\x05\x12\
    \x03!\x02\x07\n\x0c\n\x05\x04\x01\x02\0\x01\x12\x03!\x08\x0c\n\x0c\n\x05\
    \x04\x01\x02\0\x03\x12\x03!\x0f\x10\n\x0b\n\x04\x04\x01\x02\x01\x12\x03\
    \"\x02\x11\n\x0c\n\x05\x04\x01\x02\x01\x05\x12\x03\"\x02\x07\n\x0c\n\x05\
    \x04\x01\x02\x01\x01\x12\x03\"\x08\x0c\n\x0c\n\x05\x04\x01\x02\x01\x03\
    \x12\x03\"\x0f\x10\n\x0b\n\x04\x04\x01\x02\x02\x12\x03#\x02!\n\x0c\n\x05\
    \x04\x01\x02\x02\x06\x12\x03#\x02\x14\n\x0c\n\x05\x04\x01\x02\x02\x01\
    \x12\x03#\x15\x1c\n\x0c\n\x05\x04\x01\x02\x02\x03\x12\x03#\x1f\x20\n\n\n\
    \x02\x04\x02\x12\x04&\0(\x01\n\n\n\x03\x04\x02\x01\x12\x03&\x08\x17\n\
    \x0b\n\x04\x04\x02\x02\0\x12\x03'\x02\x1a\n\x0c\n\x05\x04\x02\x02\0\x06\
    \x12\x03'\x02\r\n\x0c\n\x05\x04\x02\x02\0\x01\x12\x03'\x0e\x15\n\x0c\n\
    \x05\x04\x02\x02\0\x03\x12\x03'\x18\x19b\x06proto3\
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
            let mut messages = ::std::vec::Vec::with_capacity(3);
            messages.push(HttpRequest::generated_message_descriptor_data());
            messages.push(HttpResponse::generated_message_descriptor_data());
            messages.push(HttpRequestStep::generated_message_descriptor_data());
            let mut enums = ::std::vec::Vec::with_capacity(2);
            enums.push(HttpRequestMethod::generated_enum_descriptor_data());
            enums.push(HttpRequestBodyMode::generated_enum_descriptor_data());
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
