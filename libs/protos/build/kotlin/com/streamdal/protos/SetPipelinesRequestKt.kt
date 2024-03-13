//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: sp_external.proto

package com.streamdal.protos;

@kotlin.jvm.JvmName("-initializesetPipelinesRequest")
public inline fun setPipelinesRequest(block: com.streamdal.protos.SetPipelinesRequestKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpExternal.SetPipelinesRequest =
  com.streamdal.protos.SetPipelinesRequestKt.Dsl._create(com.streamdal.protos.SpExternal.SetPipelinesRequest.newBuilder()).apply { block() }._build()
public object SetPipelinesRequestKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  public class Dsl private constructor(
    private val _builder: com.streamdal.protos.SpExternal.SetPipelinesRequest.Builder
  ) {
    public companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.streamdal.protos.SpExternal.SetPipelinesRequest.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.streamdal.protos.SpExternal.SetPipelinesRequest = _builder.build()

    /**
     * An uninstantiable, behaviorless type to represent the field in
     * generics.
     */
    @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
    public class PipelineIdsProxy private constructor() : com.google.protobuf.kotlin.DslProxy()
    /**
     * <code>repeated string pipeline_ids = 1;</code>
     * @return A list containing the pipelineIds.
     */
    public val pipelineIds: com.google.protobuf.kotlin.DslList<kotlin.String, PipelineIdsProxy>
      @kotlin.jvm.JvmSynthetic
      get() = com.google.protobuf.kotlin.DslList(
        _builder.getPipelineIdsList()
      )
    /**
     * <code>repeated string pipeline_ids = 1;</code>
     * @param value The pipelineIds to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("addPipelineIds")
    public fun com.google.protobuf.kotlin.DslList<kotlin.String, PipelineIdsProxy>.add(value: kotlin.String) {
      _builder.addPipelineIds(value)
    }
    /**
     * <code>repeated string pipeline_ids = 1;</code>
     * @param value The pipelineIds to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("plusAssignPipelineIds")
    @Suppress("NOTHING_TO_INLINE")
    public inline operator fun com.google.protobuf.kotlin.DslList<kotlin.String, PipelineIdsProxy>.plusAssign(value: kotlin.String) {
      add(value)
    }
    /**
     * <code>repeated string pipeline_ids = 1;</code>
     * @param values The pipelineIds to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("addAllPipelineIds")
    public fun com.google.protobuf.kotlin.DslList<kotlin.String, PipelineIdsProxy>.addAll(values: kotlin.collections.Iterable<kotlin.String>) {
      _builder.addAllPipelineIds(values)
    }
    /**
     * <code>repeated string pipeline_ids = 1;</code>
     * @param values The pipelineIds to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("plusAssignAllPipelineIds")
    @Suppress("NOTHING_TO_INLINE")
    public inline operator fun com.google.protobuf.kotlin.DslList<kotlin.String, PipelineIdsProxy>.plusAssign(values: kotlin.collections.Iterable<kotlin.String>) {
      addAll(values)
    }
    /**
     * <code>repeated string pipeline_ids = 1;</code>
     * @param index The index to set the value at.
     * @param value The pipelineIds to set.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("setPipelineIds")
    public operator fun com.google.protobuf.kotlin.DslList<kotlin.String, PipelineIdsProxy>.set(index: kotlin.Int, value: kotlin.String) {
      _builder.setPipelineIds(index, value)
    }/**
     * <code>repeated string pipeline_ids = 1;</code>
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("clearPipelineIds")
    public fun com.google.protobuf.kotlin.DslList<kotlin.String, PipelineIdsProxy>.clear() {
      _builder.clearPipelineIds()
    }
    /**
     * <code>.protos.Audience audience = 2;</code>
     */
    public var audience: com.streamdal.protos.SpCommon.Audience
      @JvmName("getAudience")
      get() = _builder.getAudience()
      @JvmName("setAudience")
      set(value) {
        _builder.setAudience(value)
      }
    /**
     * <code>.protos.Audience audience = 2;</code>
     */
    public fun clearAudience() {
      _builder.clearAudience()
    }
    /**
     * <code>.protos.Audience audience = 2;</code>
     * @return Whether the audience field is set.
     */
    public fun hasAudience(): kotlin.Boolean {
      return _builder.hasAudience()
    }
  }
}
@kotlin.jvm.JvmSynthetic
public inline fun com.streamdal.protos.SpExternal.SetPipelinesRequest.copy(block: com.streamdal.protos.SetPipelinesRequestKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpExternal.SetPipelinesRequest =
  com.streamdal.protos.SetPipelinesRequestKt.Dsl._create(this.toBuilder()).apply { block() }._build()

public val com.streamdal.protos.SpExternal.SetPipelinesRequestOrBuilder.audienceOrNull: com.streamdal.protos.SpCommon.Audience?
  get() = if (hasAudience()) getAudience() else null

