//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: sp_external.proto

package com.streamdal.protos;

@kotlin.jvm.JvmName("-initializetestRequest")
public inline fun testRequest(block: com.streamdal.protos.TestRequestKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpExternal.TestRequest =
  com.streamdal.protos.TestRequestKt.Dsl._create(com.streamdal.protos.SpExternal.TestRequest.newBuilder()).apply { block() }._build()
public object TestRequestKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  public class Dsl private constructor(
    private val _builder: com.streamdal.protos.SpExternal.TestRequest.Builder
  ) {
    public companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.streamdal.protos.SpExternal.TestRequest.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.streamdal.protos.SpExternal.TestRequest = _builder.build()

    /**
     * <code>string input = 1;</code>
     */
    public var input: kotlin.String
      @JvmName("getInput")
      get() = _builder.getInput()
      @JvmName("setInput")
      set(value) {
        _builder.setInput(value)
      }
    /**
     * <code>string input = 1;</code>
     */
    public fun clearInput() {
      _builder.clearInput()
    }
  }
}
@kotlin.jvm.JvmSynthetic
public inline fun com.streamdal.protos.SpExternal.TestRequest.copy(block: com.streamdal.protos.TestRequestKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpExternal.TestRequest =
  com.streamdal.protos.TestRequestKt.Dsl._create(this.toBuilder()).apply { block() }._build()

