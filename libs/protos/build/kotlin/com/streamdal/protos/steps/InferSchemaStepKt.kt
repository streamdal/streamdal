//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: steps/sp_steps_inferschema.proto

package com.streamdal.protos.steps;

@kotlin.jvm.JvmName("-initializeinferSchemaStep")
public inline fun inferSchemaStep(block: com.streamdal.protos.steps.InferSchemaStepKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep =
  com.streamdal.protos.steps.InferSchemaStepKt.Dsl._create(com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep.newBuilder()).apply { block() }._build()
public object InferSchemaStepKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  public class Dsl private constructor(
    private val _builder: com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep.Builder
  ) {
    public companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep = _builder.build()

    /**
     * <code>bytes current_schema = 1;</code>
     */
    public var currentSchema: com.google.protobuf.ByteString
      @JvmName("getCurrentSchema")
      get() = _builder.getCurrentSchema()
      @JvmName("setCurrentSchema")
      set(value) {
        _builder.setCurrentSchema(value)
      }
    /**
     * <code>bytes current_schema = 1;</code>
     */
    public fun clearCurrentSchema() {
      _builder.clearCurrentSchema()
    }
  }
}
@kotlin.jvm.JvmSynthetic
public inline fun com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep.copy(block: com.streamdal.protos.steps.InferSchemaStepKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.steps.SpStepsInferschema.InferSchemaStep =
  com.streamdal.protos.steps.InferSchemaStepKt.Dsl._create(this.toBuilder()).apply { block() }._build()

