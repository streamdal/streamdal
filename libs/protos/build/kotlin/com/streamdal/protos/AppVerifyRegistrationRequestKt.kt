//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: sp_external.proto

package com.streamdal.protos;

@kotlin.jvm.JvmName("-initializeappVerifyRegistrationRequest")
public inline fun appVerifyRegistrationRequest(block: com.streamdal.protos.AppVerifyRegistrationRequestKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpExternal.AppVerifyRegistrationRequest =
  com.streamdal.protos.AppVerifyRegistrationRequestKt.Dsl._create(com.streamdal.protos.SpExternal.AppVerifyRegistrationRequest.newBuilder()).apply { block() }._build()
public object AppVerifyRegistrationRequestKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  public class Dsl private constructor(
    private val _builder: com.streamdal.protos.SpExternal.AppVerifyRegistrationRequest.Builder
  ) {
    public companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.streamdal.protos.SpExternal.AppVerifyRegistrationRequest.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.streamdal.protos.SpExternal.AppVerifyRegistrationRequest = _builder.build()

    /**
     * <code>string email = 1;</code>
     */
    public var email: kotlin.String
      @JvmName("getEmail")
      get() = _builder.getEmail()
      @JvmName("setEmail")
      set(value) {
        _builder.setEmail(value)
      }
    /**
     * <code>string email = 1;</code>
     */
    public fun clearEmail() {
      _builder.clearEmail()
    }

    /**
     * <code>string code = 2;</code>
     */
    public var code: kotlin.String
      @JvmName("getCode")
      get() = _builder.getCode()
      @JvmName("setCode")
      set(value) {
        _builder.setCode(value)
      }
    /**
     * <code>string code = 2;</code>
     */
    public fun clearCode() {
      _builder.clearCode()
    }
  }
}
@kotlin.jvm.JvmSynthetic
public inline fun com.streamdal.protos.SpExternal.AppVerifyRegistrationRequest.copy(block: com.streamdal.protos.AppVerifyRegistrationRequestKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpExternal.AppVerifyRegistrationRequest =
  com.streamdal.protos.AppVerifyRegistrationRequestKt.Dsl._create(this.toBuilder()).apply { block() }._build()

