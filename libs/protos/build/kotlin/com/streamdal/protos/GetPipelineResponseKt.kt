//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: sp_external.proto

package com.streamdal.protos;

@kotlin.jvm.JvmName("-initializegetPipelineResponse")
public inline fun getPipelineResponse(block: com.streamdal.protos.GetPipelineResponseKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpExternal.GetPipelineResponse =
  com.streamdal.protos.GetPipelineResponseKt.Dsl._create(com.streamdal.protos.SpExternal.GetPipelineResponse.newBuilder()).apply { block() }._build()
public object GetPipelineResponseKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  public class Dsl private constructor(
    private val _builder: com.streamdal.protos.SpExternal.GetPipelineResponse.Builder
  ) {
    public companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.streamdal.protos.SpExternal.GetPipelineResponse.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.streamdal.protos.SpExternal.GetPipelineResponse = _builder.build()

    /**
     * <code>.protos.Pipeline pipeline = 1;</code>
     */
    public var pipeline: com.streamdal.protos.SpPipeline.Pipeline
      @JvmName("getPipeline")
      get() = _builder.getPipeline()
      @JvmName("setPipeline")
      set(value) {
        _builder.setPipeline(value)
      }
    /**
     * <code>.protos.Pipeline pipeline = 1;</code>
     */
    public fun clearPipeline() {
      _builder.clearPipeline()
    }
    /**
     * <code>.protos.Pipeline pipeline = 1;</code>
     * @return Whether the pipeline field is set.
     */
    public fun hasPipeline(): kotlin.Boolean {
      return _builder.hasPipeline()
    }
  }
}
@kotlin.jvm.JvmSynthetic
public inline fun com.streamdal.protos.SpExternal.GetPipelineResponse.copy(block: com.streamdal.protos.GetPipelineResponseKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpExternal.GetPipelineResponse =
  com.streamdal.protos.GetPipelineResponseKt.Dsl._create(this.toBuilder()).apply { block() }._build()

public val com.streamdal.protos.SpExternal.GetPipelineResponseOrBuilder.pipelineOrNull: com.streamdal.protos.SpPipeline.Pipeline?
  get() = if (hasPipeline()) getPipeline() else null

