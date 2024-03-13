// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: steps/sp_steps_inferschema.proto

package com.streamdal.protos.steps;

public final class SpStepsInferschema {
  private SpStepsInferschema() {}
  public static void registerAllExtensions(
      com.google.protobuf.ExtensionRegistryLite registry) {
  }

  public static void registerAllExtensions(
      com.google.protobuf.ExtensionRegistry registry) {
    registerAllExtensions(
        (com.google.protobuf.ExtensionRegistryLite) registry);
  }
  public interface InferSchemaStepOrBuilder extends
      // @@protoc_insertion_point(interface_extends:protos.steps.InferSchemaStep)
      com.google.protobuf.MessageOrBuilder {

    /**
     * <code>bytes current_schema = 1;</code>
     * @return The currentSchema.
     */
    com.google.protobuf.ByteString getCurrentSchema();
  }
  /**
   * <pre>
   * InferSchemaStep is a step that infers the schema of a payload.
   * It is designed to be used directly by the SDK rather than in a pipeline, so that
   * we can support schema inference without the need for pipelines to be created
   * </pre>
   *
   * Protobuf type {@code protos.steps.InferSchemaStep}
   */
  public static final class InferSchemaStep extends
      com.google.protobuf.GeneratedMessageV3 implements
      // @@protoc_insertion_point(message_implements:protos.steps.InferSchemaStep)
      InferSchemaStepOrBuilder {
  private static final long serialVersionUID = 0L;
    // Use InferSchemaStep.newBuilder() to construct.
    private InferSchemaStep(com.google.protobuf.GeneratedMessageV3.Builder<?> builder) {
      super(builder);
    }
    private InferSchemaStep() {
      currentSchema_ = com.google.protobuf.ByteString.EMPTY;
    }

    @java.lang.Override
    @SuppressWarnings({"unused"})
    protected java.lang.Object newInstance(
        UnusedPrivateParameter unused) {
      return new InferSchemaStep();
    }

    @java.lang.Override
    public final com.google.protobuf.UnknownFieldSet
    getUnknownFields() {
      return this.unknownFields;
    }
    public static final com.google.protobuf.Descriptors.Descriptor
        getDescriptor() {
      return com.streamdal.protos.steps.SpStepsInferschema.internal_static_protos_steps_InferSchemaStep_descriptor;
    }

    @java.lang.Override
    protected com.google.protobuf.GeneratedMessageV3.FieldAccessorTable
        internalGetFieldAccessorTable() {
      return com.streamdal.protos.steps.SpStepsInferschema.internal_static_protos_steps_InferSchemaStep_fieldAccessorTable
          .ensureFieldAccessorsInitialized(
              com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep.class, com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep.Builder.class);
    }

    public static final int CURRENT_SCHEMA_FIELD_NUMBER = 1;
    private com.google.protobuf.ByteString currentSchema_ = com.google.protobuf.ByteString.EMPTY;
    /**
     * <code>bytes current_schema = 1;</code>
     * @return The currentSchema.
     */
    @java.lang.Override
    public com.google.protobuf.ByteString getCurrentSchema() {
      return currentSchema_;
    }

    private byte memoizedIsInitialized = -1;
    @java.lang.Override
    public final boolean isInitialized() {
      byte isInitialized = memoizedIsInitialized;
      if (isInitialized == 1) return true;
      if (isInitialized == 0) return false;

      memoizedIsInitialized = 1;
      return true;
    }

    @java.lang.Override
    public void writeTo(com.google.protobuf.CodedOutputStream output)
                        throws java.io.IOException {
      if (!currentSchema_.isEmpty()) {
        output.writeBytes(1, currentSchema_);
      }
      getUnknownFields().writeTo(output);
    }

    @java.lang.Override
    public int getSerializedSize() {
      int size = memoizedSize;
      if (size != -1) return size;

      size = 0;
      if (!currentSchema_.isEmpty()) {
        size += com.google.protobuf.CodedOutputStream
          .computeBytesSize(1, currentSchema_);
      }
      size += getUnknownFields().getSerializedSize();
      memoizedSize = size;
      return size;
    }

    @java.lang.Override
    public boolean equals(final java.lang.Object obj) {
      if (obj == this) {
       return true;
      }
      if (!(obj instanceof com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep)) {
        return super.equals(obj);
      }
      com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep other = (com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep) obj;

      if (!getCurrentSchema()
          .equals(other.getCurrentSchema())) return false;
      if (!getUnknownFields().equals(other.getUnknownFields())) return false;
      return true;
    }

    @java.lang.Override
    public int hashCode() {
      if (memoizedHashCode != 0) {
        return memoizedHashCode;
      }
      int hash = 41;
      hash = (19 * hash) + getDescriptor().hashCode();
      hash = (37 * hash) + CURRENT_SCHEMA_FIELD_NUMBER;
      hash = (53 * hash) + getCurrentSchema().hashCode();
      hash = (29 * hash) + getUnknownFields().hashCode();
      memoizedHashCode = hash;
      return hash;
    }

    public static com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep parseFrom(
        java.nio.ByteBuffer data)
        throws com.google.protobuf.InvalidProtocolBufferException {
      return PARSER.parseFrom(data);
    }
    public static com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep parseFrom(
        java.nio.ByteBuffer data,
        com.google.protobuf.ExtensionRegistryLite extensionRegistry)
        throws com.google.protobuf.InvalidProtocolBufferException {
      return PARSER.parseFrom(data, extensionRegistry);
    }
    public static com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep parseFrom(
        com.google.protobuf.ByteString data)
        throws com.google.protobuf.InvalidProtocolBufferException {
      return PARSER.parseFrom(data);
    }
    public static com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep parseFrom(
        com.google.protobuf.ByteString data,
        com.google.protobuf.ExtensionRegistryLite extensionRegistry)
        throws com.google.protobuf.InvalidProtocolBufferException {
      return PARSER.parseFrom(data, extensionRegistry);
    }
    public static com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep parseFrom(byte[] data)
        throws com.google.protobuf.InvalidProtocolBufferException {
      return PARSER.parseFrom(data);
    }
    public static com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep parseFrom(
        byte[] data,
        com.google.protobuf.ExtensionRegistryLite extensionRegistry)
        throws com.google.protobuf.InvalidProtocolBufferException {
      return PARSER.parseFrom(data, extensionRegistry);
    }
    public static com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep parseFrom(java.io.InputStream input)
        throws java.io.IOException {
      return com.google.protobuf.GeneratedMessageV3
          .parseWithIOException(PARSER, input);
    }
    public static com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep parseFrom(
        java.io.InputStream input,
        com.google.protobuf.ExtensionRegistryLite extensionRegistry)
        throws java.io.IOException {
      return com.google.protobuf.GeneratedMessageV3
          .parseWithIOException(PARSER, input, extensionRegistry);
    }
    public static com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep parseDelimitedFrom(java.io.InputStream input)
        throws java.io.IOException {
      return com.google.protobuf.GeneratedMessageV3
          .parseDelimitedWithIOException(PARSER, input);
    }
    public static com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep parseDelimitedFrom(
        java.io.InputStream input,
        com.google.protobuf.ExtensionRegistryLite extensionRegistry)
        throws java.io.IOException {
      return com.google.protobuf.GeneratedMessageV3
          .parseDelimitedWithIOException(PARSER, input, extensionRegistry);
    }
    public static com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep parseFrom(
        com.google.protobuf.CodedInputStream input)
        throws java.io.IOException {
      return com.google.protobuf.GeneratedMessageV3
          .parseWithIOException(PARSER, input);
    }
    public static com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep parseFrom(
        com.google.protobuf.CodedInputStream input,
        com.google.protobuf.ExtensionRegistryLite extensionRegistry)
        throws java.io.IOException {
      return com.google.protobuf.GeneratedMessageV3
          .parseWithIOException(PARSER, input, extensionRegistry);
    }

    @java.lang.Override
    public Builder newBuilderForType() { return newBuilder(); }
    public static Builder newBuilder() {
      return DEFAULT_INSTANCE.toBuilder();
    }
    public static Builder newBuilder(com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep prototype) {
      return DEFAULT_INSTANCE.toBuilder().mergeFrom(prototype);
    }
    @java.lang.Override
    public Builder toBuilder() {
      return this == DEFAULT_INSTANCE
          ? new Builder() : new Builder().mergeFrom(this);
    }

    @java.lang.Override
    protected Builder newBuilderForType(
        com.google.protobuf.GeneratedMessageV3.BuilderParent parent) {
      Builder builder = new Builder(parent);
      return builder;
    }
    /**
     * <pre>
     * InferSchemaStep is a step that infers the schema of a payload.
     * It is designed to be used directly by the SDK rather than in a pipeline, so that
     * we can support schema inference without the need for pipelines to be created
     * </pre>
     *
     * Protobuf type {@code protos.steps.InferSchemaStep}
     */
    public static final class Builder extends
        com.google.protobuf.GeneratedMessageV3.Builder<Builder> implements
        // @@protoc_insertion_point(builder_implements:protos.steps.InferSchemaStep)
        com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStepOrBuilder {
      public static final com.google.protobuf.Descriptors.Descriptor
          getDescriptor() {
        return com.streamdal.protos.steps.SpStepsInferschema.internal_static_protos_steps_InferSchemaStep_descriptor;
      }

      @java.lang.Override
      protected com.google.protobuf.GeneratedMessageV3.FieldAccessorTable
          internalGetFieldAccessorTable() {
        return com.streamdal.protos.steps.SpStepsInferschema.internal_static_protos_steps_InferSchemaStep_fieldAccessorTable
            .ensureFieldAccessorsInitialized(
                com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep.class, com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep.Builder.class);
      }

      // Construct using com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep.newBuilder()
      private Builder() {

      }

      private Builder(
          com.google.protobuf.GeneratedMessageV3.BuilderParent parent) {
        super(parent);

      }
      @java.lang.Override
      public Builder clear() {
        super.clear();
        bitField0_ = 0;
        currentSchema_ = com.google.protobuf.ByteString.EMPTY;
        return this;
      }

      @java.lang.Override
      public com.google.protobuf.Descriptors.Descriptor
          getDescriptorForType() {
        return com.streamdal.protos.steps.SpStepsInferschema.internal_static_protos_steps_InferSchemaStep_descriptor;
      }

      @java.lang.Override
      public com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep getDefaultInstanceForType() {
        return com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep.getDefaultInstance();
      }

      @java.lang.Override
      public com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep build() {
        com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep result = buildPartial();
        if (!result.isInitialized()) {
          throw newUninitializedMessageException(result);
        }
        return result;
      }

      @java.lang.Override
      public com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep buildPartial() {
        com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep result = new com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep(this);
        if (bitField0_ != 0) { buildPartial0(result); }
        onBuilt();
        return result;
      }

      private void buildPartial0(com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep result) {
        int from_bitField0_ = bitField0_;
        if (((from_bitField0_ & 0x00000001) != 0)) {
          result.currentSchema_ = currentSchema_;
        }
      }

      @java.lang.Override
      public Builder clone() {
        return super.clone();
      }
      @java.lang.Override
      public Builder setField(
          com.google.protobuf.Descriptors.FieldDescriptor field,
          java.lang.Object value) {
        return super.setField(field, value);
      }
      @java.lang.Override
      public Builder clearField(
          com.google.protobuf.Descriptors.FieldDescriptor field) {
        return super.clearField(field);
      }
      @java.lang.Override
      public Builder clearOneof(
          com.google.protobuf.Descriptors.OneofDescriptor oneof) {
        return super.clearOneof(oneof);
      }
      @java.lang.Override
      public Builder setRepeatedField(
          com.google.protobuf.Descriptors.FieldDescriptor field,
          int index, java.lang.Object value) {
        return super.setRepeatedField(field, index, value);
      }
      @java.lang.Override
      public Builder addRepeatedField(
          com.google.protobuf.Descriptors.FieldDescriptor field,
          java.lang.Object value) {
        return super.addRepeatedField(field, value);
      }
      @java.lang.Override
      public Builder mergeFrom(com.google.protobuf.Message other) {
        if (other instanceof com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep) {
          return mergeFrom((com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep)other);
        } else {
          super.mergeFrom(other);
          return this;
        }
      }

      public Builder mergeFrom(com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep other) {
        if (other == com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep.getDefaultInstance()) return this;
        if (other.getCurrentSchema() != com.google.protobuf.ByteString.EMPTY) {
          setCurrentSchema(other.getCurrentSchema());
        }
        this.mergeUnknownFields(other.getUnknownFields());
        onChanged();
        return this;
      }

      @java.lang.Override
      public final boolean isInitialized() {
        return true;
      }

      @java.lang.Override
      public Builder mergeFrom(
          com.google.protobuf.CodedInputStream input,
          com.google.protobuf.ExtensionRegistryLite extensionRegistry)
          throws java.io.IOException {
        if (extensionRegistry == null) {
          throw new java.lang.NullPointerException();
        }
        try {
          boolean done = false;
          while (!done) {
            int tag = input.readTag();
            switch (tag) {
              case 0:
                done = true;
                break;
              case 10: {
                currentSchema_ = input.readBytes();
                bitField0_ |= 0x00000001;
                break;
              } // case 10
              default: {
                if (!super.parseUnknownField(input, extensionRegistry, tag)) {
                  done = true; // was an endgroup tag
                }
                break;
              } // default:
            } // switch (tag)
          } // while (!done)
        } catch (com.google.protobuf.InvalidProtocolBufferException e) {
          throw e.unwrapIOException();
        } finally {
          onChanged();
        } // finally
        return this;
      }
      private int bitField0_;

      private com.google.protobuf.ByteString currentSchema_ = com.google.protobuf.ByteString.EMPTY;
      /**
       * <code>bytes current_schema = 1;</code>
       * @return The currentSchema.
       */
      @java.lang.Override
      public com.google.protobuf.ByteString getCurrentSchema() {
        return currentSchema_;
      }
      /**
       * <code>bytes current_schema = 1;</code>
       * @param value The currentSchema to set.
       * @return This builder for chaining.
       */
      public Builder setCurrentSchema(com.google.protobuf.ByteString value) {
        if (value == null) { throw new NullPointerException(); }
        currentSchema_ = value;
        bitField0_ |= 0x00000001;
        onChanged();
        return this;
      }
      /**
       * <code>bytes current_schema = 1;</code>
       * @return This builder for chaining.
       */
      public Builder clearCurrentSchema() {
        bitField0_ = (bitField0_ & ~0x00000001);
        currentSchema_ = getDefaultInstance().getCurrentSchema();
        onChanged();
        return this;
      }
      @java.lang.Override
      public final Builder setUnknownFields(
          final com.google.protobuf.UnknownFieldSet unknownFields) {
        return super.setUnknownFields(unknownFields);
      }

      @java.lang.Override
      public final Builder mergeUnknownFields(
          final com.google.protobuf.UnknownFieldSet unknownFields) {
        return super.mergeUnknownFields(unknownFields);
      }


      // @@protoc_insertion_point(builder_scope:protos.steps.InferSchemaStep)
    }

    // @@protoc_insertion_point(class_scope:protos.steps.InferSchemaStep)
    private static final com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep DEFAULT_INSTANCE;
    static {
      DEFAULT_INSTANCE = new com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep();
    }

    public static com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep getDefaultInstance() {
      return DEFAULT_INSTANCE;
    }

    private static final com.google.protobuf.Parser<InferSchemaStep>
        PARSER = new com.google.protobuf.AbstractParser<InferSchemaStep>() {
      @java.lang.Override
      public InferSchemaStep parsePartialFrom(
          com.google.protobuf.CodedInputStream input,
          com.google.protobuf.ExtensionRegistryLite extensionRegistry)
          throws com.google.protobuf.InvalidProtocolBufferException {
        Builder builder = newBuilder();
        try {
          builder.mergeFrom(input, extensionRegistry);
        } catch (com.google.protobuf.InvalidProtocolBufferException e) {
          throw e.setUnfinishedMessage(builder.buildPartial());
        } catch (com.google.protobuf.UninitializedMessageException e) {
          throw e.asInvalidProtocolBufferException().setUnfinishedMessage(builder.buildPartial());
        } catch (java.io.IOException e) {
          throw new com.google.protobuf.InvalidProtocolBufferException(e)
              .setUnfinishedMessage(builder.buildPartial());
        }
        return builder.buildPartial();
      }
    };

    public static com.google.protobuf.Parser<InferSchemaStep> parser() {
      return PARSER;
    }

    @java.lang.Override
    public com.google.protobuf.Parser<InferSchemaStep> getParserForType() {
      return PARSER;
    }

    @java.lang.Override
    public com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep getDefaultInstanceForType() {
      return DEFAULT_INSTANCE;
    }

  }

  private static final com.google.protobuf.Descriptors.Descriptor
    internal_static_protos_steps_InferSchemaStep_descriptor;
  private static final 
    com.google.protobuf.GeneratedMessageV3.FieldAccessorTable
      internal_static_protos_steps_InferSchemaStep_fieldAccessorTable;

  public static com.google.protobuf.Descriptors.FileDescriptor
      getDescriptor() {
    return descriptor;
  }
  private static  com.google.protobuf.Descriptors.FileDescriptor
      descriptor;
  static {
    java.lang.String[] descriptorData = {
      "\n steps/sp_steps_inferschema.proto\022\014prot" +
      "os.steps\")\n\017InferSchemaStep\022\026\n\016current_s" +
      "chema\030\001 \001(\014B^\n\032com.streamdal.protos.step" +
      "sZ@github.com/streamdal/streamdal/libs/p" +
      "rotos/build/go/protos/stepsb\006proto3"
    };
    descriptor = com.google.protobuf.Descriptors.FileDescriptor
      .internalBuildGeneratedFileFrom(descriptorData,
        new com.google.protobuf.Descriptors.FileDescriptor[] {
        });
    internal_static_protos_steps_InferSchemaStep_descriptor =
      getDescriptor().getMessageTypes().get(0);
    internal_static_protos_steps_InferSchemaStep_fieldAccessorTable = new
      com.google.protobuf.GeneratedMessageV3.FieldAccessorTable(
        internal_static_protos_steps_InferSchemaStep_descriptor,
        new java.lang.String[] { "CurrentSchema", });
  }

  // @@protoc_insertion_point(outer_class_scope)
}
