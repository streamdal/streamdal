//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: sp_external.proto

package com.streamdal.protos;

@kotlin.jvm.JvmName("-initializegetNotificationRequest")
public inline fun getNotificationRequest(block: com.streamdal.protos.GetNotificationRequestKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpExternal.GetNotificationRequest =
  com.streamdal.protos.GetNotificationRequestKt.Dsl._create(com.streamdal.protos.SpExternal.GetNotificationRequest.newBuilder()).apply { block() }._build()
public object GetNotificationRequestKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  public class Dsl private constructor(
    private val _builder: com.streamdal.protos.SpExternal.GetNotificationRequest.Builder
  ) {
    public companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.streamdal.protos.SpExternal.GetNotificationRequest.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.streamdal.protos.SpExternal.GetNotificationRequest = _builder.build()

    /**
     * <code>string notification_id = 1;</code>
     */
    public var notificationId: kotlin.String
      @JvmName("getNotificationId")
      get() = _builder.getNotificationId()
      @JvmName("setNotificationId")
      set(value) {
        _builder.setNotificationId(value)
      }
    /**
     * <code>string notification_id = 1;</code>
     */
    public fun clearNotificationId() {
      _builder.clearNotificationId()
    }
  }
}
@kotlin.jvm.JvmSynthetic
public inline fun com.streamdal.protos.SpExternal.GetNotificationRequest.copy(block: com.streamdal.protos.GetNotificationRequestKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpExternal.GetNotificationRequest =
  com.streamdal.protos.GetNotificationRequestKt.Dsl._create(this.toBuilder()).apply { block() }._build()

