//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: sp_external.proto

package com.streamdal.protos;

@kotlin.jvm.JvmName("-initializegetSchemaResponse")
public inline fun getSchemaResponse(block: com.streamdal.protos.GetSchemaResponseKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpExternal.GetSchemaResponse =
  com.streamdal.protos.GetSchemaResponseKt.Dsl._create(com.streamdal.protos.SpExternal.GetSchemaResponse.newBuilder()).apply { block() }._build()
public object GetSchemaResponseKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  public class Dsl private constructor(
    private val _builder: com.streamdal.protos.SpExternal.GetSchemaResponse.Builder
  ) {
    public companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.streamdal.protos.SpExternal.GetSchemaResponse.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.streamdal.protos.SpExternal.GetSchemaResponse = _builder.build()

    /**
     * <code>.protos.Schema schema = 1;</code>
     */
    public var schema: com.streamdal.protos.SpCommon.Schema
      @JvmName("getSchema")
      get() = _builder.getSchema()
      @JvmName("setSchema")
      set(value) {
        _builder.setSchema(value)
      }
    /**
     * <code>.protos.Schema schema = 1;</code>
     */
    public fun clearSchema() {
      _builder.clearSchema()
    }
    /**
     * <code>.protos.Schema schema = 1;</code>
     * @return Whether the schema field is set.
     */
    public fun hasSchema(): kotlin.Boolean {
      return _builder.hasSchema()
    }
  }
}
@kotlin.jvm.JvmSynthetic
public inline fun com.streamdal.protos.SpExternal.GetSchemaResponse.copy(block: com.streamdal.protos.GetSchemaResponseKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpExternal.GetSchemaResponse =
  com.streamdal.protos.GetSchemaResponseKt.Dsl._create(this.toBuilder()).apply { block() }._build()

public val com.streamdal.protos.SpExternal.GetSchemaResponseOrBuilder.schemaOrNull: com.streamdal.protos.SpCommon.Schema?
  get() = if (hasSchema()) getSchema() else null

