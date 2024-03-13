//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: steps/sp_steps_httprequest.proto

package com.streamdal.protos.steps;

@kotlin.jvm.JvmName("-initializehttpResponse")
public inline fun httpResponse(block: com.streamdal.protos.steps.HttpResponseKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.steps.SpStepsHttprequest.HttpResponse =
  com.streamdal.protos.steps.HttpResponseKt.Dsl._create(com.streamdal.protos.steps.SpStepsHttprequest.HttpResponse.newBuilder()).apply { block() }._build()
public object HttpResponseKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  public class Dsl private constructor(
    private val _builder: com.streamdal.protos.steps.SpStepsHttprequest.HttpResponse.Builder
  ) {
    public companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.streamdal.protos.steps.SpStepsHttprequest.HttpResponse.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.streamdal.protos.steps.SpStepsHttprequest.HttpResponse = _builder.build()

    /**
     * <code>int32 code = 1;</code>
     */
    public var code: kotlin.Int
      @JvmName("getCode")
      get() = _builder.getCode()
      @JvmName("setCode")
      set(value) {
        _builder.setCode(value)
      }
    /**
     * <code>int32 code = 1;</code>
     */
    public fun clearCode() {
      _builder.clearCode()
    }

    /**
     * <code>bytes body = 2;</code>
     */
    public var body: com.google.protobuf.ByteString
      @JvmName("getBody")
      get() = _builder.getBody()
      @JvmName("setBody")
      set(value) {
        _builder.setBody(value)
      }
    /**
     * <code>bytes body = 2;</code>
     */
    public fun clearBody() {
      _builder.clearBody()
    }

    /**
     * An uninstantiable, behaviorless type to represent the field in
     * generics.
     */
    @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
    public class HeadersProxy private constructor() : com.google.protobuf.kotlin.DslProxy()
    /**
     * <code>map&lt;string, string&gt; headers = 3;</code>
     */
     public val headers: com.google.protobuf.kotlin.DslMap<kotlin.String, kotlin.String, HeadersProxy>
      @kotlin.jvm.JvmSynthetic
      @JvmName("getHeadersMap")
      get() = com.google.protobuf.kotlin.DslMap(
        _builder.getHeadersMap()
      )
    /**
     * <code>map&lt;string, string&gt; headers = 3;</code>
     */
    @JvmName("putHeaders")
    public fun com.google.protobuf.kotlin.DslMap<kotlin.String, kotlin.String, HeadersProxy>
      .put(key: kotlin.String, value: kotlin.String) {
         _builder.putHeaders(key, value)
       }
    /**
     * <code>map&lt;string, string&gt; headers = 3;</code>
     */
    @kotlin.jvm.JvmSynthetic
    @JvmName("setHeaders")
    @Suppress("NOTHING_TO_INLINE")
    public inline operator fun com.google.protobuf.kotlin.DslMap<kotlin.String, kotlin.String, HeadersProxy>
      .set(key: kotlin.String, value: kotlin.String) {
         put(key, value)
       }
    /**
     * <code>map&lt;string, string&gt; headers = 3;</code>
     */
    @kotlin.jvm.JvmSynthetic
    @JvmName("removeHeaders")
    public fun com.google.protobuf.kotlin.DslMap<kotlin.String, kotlin.String, HeadersProxy>
      .remove(key: kotlin.String) {
         _builder.removeHeaders(key)
       }
    /**
     * <code>map&lt;string, string&gt; headers = 3;</code>
     */
    @kotlin.jvm.JvmSynthetic
    @JvmName("putAllHeaders")
    public fun com.google.protobuf.kotlin.DslMap<kotlin.String, kotlin.String, HeadersProxy>
      .putAll(map: kotlin.collections.Map<kotlin.String, kotlin.String>) {
         _builder.putAllHeaders(map)
       }
    /**
     * <code>map&lt;string, string&gt; headers = 3;</code>
     */
    @kotlin.jvm.JvmSynthetic
    @JvmName("clearHeaders")
    public fun com.google.protobuf.kotlin.DslMap<kotlin.String, kotlin.String, HeadersProxy>
      .clear() {
         _builder.clearHeaders()
       }
  }
}
@kotlin.jvm.JvmSynthetic
public inline fun com.streamdal.protos.steps.SpStepsHttprequest.HttpResponse.copy(block: com.streamdal.protos.steps.HttpResponseKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.steps.SpStepsHttprequest.HttpResponse =
  com.streamdal.protos.steps.HttpResponseKt.Dsl._create(this.toBuilder()).apply { block() }._build()

