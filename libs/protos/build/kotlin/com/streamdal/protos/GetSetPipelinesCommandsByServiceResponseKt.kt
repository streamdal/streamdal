//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: sp_internal.proto

package com.streamdal.protos;

@kotlin.jvm.JvmName("-initializegetSetPipelinesCommandsByServiceResponse")
public inline fun getSetPipelinesCommandsByServiceResponse(block: com.streamdal.protos.GetSetPipelinesCommandsByServiceResponseKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceResponse =
  com.streamdal.protos.GetSetPipelinesCommandsByServiceResponseKt.Dsl._create(com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceResponse.newBuilder()).apply { block() }._build()
public object GetSetPipelinesCommandsByServiceResponseKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  public class Dsl private constructor(
    private val _builder: com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceResponse.Builder
  ) {
    public companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceResponse.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceResponse = _builder.build()

    /**
     * An uninstantiable, behaviorless type to represent the field in
     * generics.
     */
    @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
    public class SetPipelineCommandsProxy private constructor() : com.google.protobuf.kotlin.DslProxy()
    /**
     * <pre>
     * SetPipelinesCommands for all active pipelines
     * </pre>
     *
     * <code>repeated .protos.Command set_pipeline_commands = 1;</code>
     */
     public val setPipelineCommands: com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommand.Command, SetPipelineCommandsProxy>
      @kotlin.jvm.JvmSynthetic
      get() = com.google.protobuf.kotlin.DslList(
        _builder.getSetPipelineCommandsList()
      )
    /**
     * <pre>
     * SetPipelinesCommands for all active pipelines
     * </pre>
     *
     * <code>repeated .protos.Command set_pipeline_commands = 1;</code>
     * @param value The setPipelineCommands to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("addSetPipelineCommands")
    public fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommand.Command, SetPipelineCommandsProxy>.add(value: com.streamdal.protos.SpCommand.Command) {
      _builder.addSetPipelineCommands(value)
    }
    /**
     * <pre>
     * SetPipelinesCommands for all active pipelines
     * </pre>
     *
     * <code>repeated .protos.Command set_pipeline_commands = 1;</code>
     * @param value The setPipelineCommands to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("plusAssignSetPipelineCommands")
    @Suppress("NOTHING_TO_INLINE")
    public inline operator fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommand.Command, SetPipelineCommandsProxy>.plusAssign(value: com.streamdal.protos.SpCommand.Command) {
      add(value)
    }
    /**
     * <pre>
     * SetPipelinesCommands for all active pipelines
     * </pre>
     *
     * <code>repeated .protos.Command set_pipeline_commands = 1;</code>
     * @param values The setPipelineCommands to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("addAllSetPipelineCommands")
    public fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommand.Command, SetPipelineCommandsProxy>.addAll(values: kotlin.collections.Iterable<com.streamdal.protos.SpCommand.Command>) {
      _builder.addAllSetPipelineCommands(values)
    }
    /**
     * <pre>
     * SetPipelinesCommands for all active pipelines
     * </pre>
     *
     * <code>repeated .protos.Command set_pipeline_commands = 1;</code>
     * @param values The setPipelineCommands to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("plusAssignAllSetPipelineCommands")
    @Suppress("NOTHING_TO_INLINE")
    public inline operator fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommand.Command, SetPipelineCommandsProxy>.plusAssign(values: kotlin.collections.Iterable<com.streamdal.protos.SpCommand.Command>) {
      addAll(values)
    }
    /**
     * <pre>
     * SetPipelinesCommands for all active pipelines
     * </pre>
     *
     * <code>repeated .protos.Command set_pipeline_commands = 1;</code>
     * @param index The index to set the value at.
     * @param value The setPipelineCommands to set.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("setSetPipelineCommands")
    public operator fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommand.Command, SetPipelineCommandsProxy>.set(index: kotlin.Int, value: com.streamdal.protos.SpCommand.Command) {
      _builder.setSetPipelineCommands(index, value)
    }
    /**
     * <pre>
     * SetPipelinesCommands for all active pipelines
     * </pre>
     *
     * <code>repeated .protos.Command set_pipeline_commands = 1;</code>
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("clearSetPipelineCommands")
    public fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommand.Command, SetPipelineCommandsProxy>.clear() {
      _builder.clearSetPipelineCommands()
    }


    /**
     * An uninstantiable, behaviorless type to represent the field in
     * generics.
     */
    @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
    public class WasmModulesProxy private constructor() : com.google.protobuf.kotlin.DslProxy()
    /**
     * <pre>
     * ID = wasm ID
     * </pre>
     *
     * <code>map&lt;string, .protos.WasmModule&gt; wasm_modules = 3;</code>
     */
     public val wasmModules: com.google.protobuf.kotlin.DslMap<kotlin.String, com.streamdal.protos.SpInternal.WasmModule, WasmModulesProxy>
      @kotlin.jvm.JvmSynthetic
      @JvmName("getWasmModulesMap")
      get() = com.google.protobuf.kotlin.DslMap(
        _builder.getWasmModulesMap()
      )
    /**
     * <pre>
     * ID = wasm ID
     * </pre>
     *
     * <code>map&lt;string, .protos.WasmModule&gt; wasm_modules = 3;</code>
     */
    @JvmName("putWasmModules")
    public fun com.google.protobuf.kotlin.DslMap<kotlin.String, com.streamdal.protos.SpInternal.WasmModule, WasmModulesProxy>
      .put(key: kotlin.String, value: com.streamdal.protos.SpInternal.WasmModule) {
         _builder.putWasmModules(key, value)
       }
    /**
     * <pre>
     * ID = wasm ID
     * </pre>
     *
     * <code>map&lt;string, .protos.WasmModule&gt; wasm_modules = 3;</code>
     */
    @kotlin.jvm.JvmSynthetic
    @JvmName("setWasmModules")
    @Suppress("NOTHING_TO_INLINE")
    public inline operator fun com.google.protobuf.kotlin.DslMap<kotlin.String, com.streamdal.protos.SpInternal.WasmModule, WasmModulesProxy>
      .set(key: kotlin.String, value: com.streamdal.protos.SpInternal.WasmModule) {
         put(key, value)
       }
    /**
     * <pre>
     * ID = wasm ID
     * </pre>
     *
     * <code>map&lt;string, .protos.WasmModule&gt; wasm_modules = 3;</code>
     */
    @kotlin.jvm.JvmSynthetic
    @JvmName("removeWasmModules")
    public fun com.google.protobuf.kotlin.DslMap<kotlin.String, com.streamdal.protos.SpInternal.WasmModule, WasmModulesProxy>
      .remove(key: kotlin.String) {
         _builder.removeWasmModules(key)
       }
    /**
     * <pre>
     * ID = wasm ID
     * </pre>
     *
     * <code>map&lt;string, .protos.WasmModule&gt; wasm_modules = 3;</code>
     */
    @kotlin.jvm.JvmSynthetic
    @JvmName("putAllWasmModules")
    public fun com.google.protobuf.kotlin.DslMap<kotlin.String, com.streamdal.protos.SpInternal.WasmModule, WasmModulesProxy>
      .putAll(map: kotlin.collections.Map<kotlin.String, com.streamdal.protos.SpInternal.WasmModule>) {
         _builder.putAllWasmModules(map)
       }
    /**
     * <pre>
     * ID = wasm ID
     * </pre>
     *
     * <code>map&lt;string, .protos.WasmModule&gt; wasm_modules = 3;</code>
     */
    @kotlin.jvm.JvmSynthetic
    @JvmName("clearWasmModules")
    public fun com.google.protobuf.kotlin.DslMap<kotlin.String, com.streamdal.protos.SpInternal.WasmModule, WasmModulesProxy>
      .clear() {
         _builder.clearWasmModules()
       }
  }
}
@kotlin.jvm.JvmSynthetic
public inline fun com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceResponse.copy(block: com.streamdal.protos.GetSetPipelinesCommandsByServiceResponseKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceResponse =
  com.streamdal.protos.GetSetPipelinesCommandsByServiceResponseKt.Dsl._create(this.toBuilder()).apply { block() }._build()

