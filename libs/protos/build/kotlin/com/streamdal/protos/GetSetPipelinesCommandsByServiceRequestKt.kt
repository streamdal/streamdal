//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: sp_internal.proto

package com.streamdal.protos;

@kotlin.jvm.JvmName("-initializegetSetPipelinesCommandsByServiceRequest")
public inline fun getSetPipelinesCommandsByServiceRequest(block: com.streamdal.protos.GetSetPipelinesCommandsByServiceRequestKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceRequest =
  com.streamdal.protos.GetSetPipelinesCommandsByServiceRequestKt.Dsl._create(com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceRequest.newBuilder()).apply { block() }._build()
public object GetSetPipelinesCommandsByServiceRequestKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  public class Dsl private constructor(
    private val _builder: com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceRequest.Builder
  ) {
    public companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceRequest.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceRequest = _builder.build()

    /**
     * <code>string service_name = 1;</code>
     */
    public var serviceName: kotlin.String
      @JvmName("getServiceName")
      get() = _builder.getServiceName()
      @JvmName("setServiceName")
      set(value) {
        _builder.setServiceName(value)
      }
    /**
     * <code>string service_name = 1;</code>
     */
    public fun clearServiceName() {
      _builder.clearServiceName()
    }
  }
}
@kotlin.jvm.JvmSynthetic
public inline fun com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceRequest.copy(block: com.streamdal.protos.GetSetPipelinesCommandsByServiceRequestKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpInternal.GetSetPipelinesCommandsByServiceRequest =
  com.streamdal.protos.GetSetPipelinesCommandsByServiceRequestKt.Dsl._create(this.toBuilder()).apply { block() }._build()

