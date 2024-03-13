//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: sp_info.proto

package com.streamdal.protos;

@kotlin.jvm.JvmName("-initializeliveInfo")
public inline fun liveInfo(block: com.streamdal.protos.LiveInfoKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpInfo.LiveInfo =
  com.streamdal.protos.LiveInfoKt.Dsl._create(com.streamdal.protos.SpInfo.LiveInfo.newBuilder()).apply { block() }._build()
public object LiveInfoKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  public class Dsl private constructor(
    private val _builder: com.streamdal.protos.SpInfo.LiveInfo.Builder
  ) {
    public companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.streamdal.protos.SpInfo.LiveInfo.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.streamdal.protos.SpInfo.LiveInfo = _builder.build()

    /**
     * An uninstantiable, behaviorless type to represent the field in
     * generics.
     */
    @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
    public class AudiencesProxy private constructor() : com.google.protobuf.kotlin.DslProxy()
    /**
     * <pre>
     * If empty, client has not announced any audiences
     * </pre>
     *
     * <code>repeated .protos.Audience audiences = 1;</code>
     */
     public val audiences: com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommon.Audience, AudiencesProxy>
      @kotlin.jvm.JvmSynthetic
      get() = com.google.protobuf.kotlin.DslList(
        _builder.getAudiencesList()
      )
    /**
     * <pre>
     * If empty, client has not announced any audiences
     * </pre>
     *
     * <code>repeated .protos.Audience audiences = 1;</code>
     * @param value The audiences to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("addAudiences")
    public fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommon.Audience, AudiencesProxy>.add(value: com.streamdal.protos.SpCommon.Audience) {
      _builder.addAudiences(value)
    }
    /**
     * <pre>
     * If empty, client has not announced any audiences
     * </pre>
     *
     * <code>repeated .protos.Audience audiences = 1;</code>
     * @param value The audiences to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("plusAssignAudiences")
    @Suppress("NOTHING_TO_INLINE")
    public inline operator fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommon.Audience, AudiencesProxy>.plusAssign(value: com.streamdal.protos.SpCommon.Audience) {
      add(value)
    }
    /**
     * <pre>
     * If empty, client has not announced any audiences
     * </pre>
     *
     * <code>repeated .protos.Audience audiences = 1;</code>
     * @param values The audiences to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("addAllAudiences")
    public fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommon.Audience, AudiencesProxy>.addAll(values: kotlin.collections.Iterable<com.streamdal.protos.SpCommon.Audience>) {
      _builder.addAllAudiences(values)
    }
    /**
     * <pre>
     * If empty, client has not announced any audiences
     * </pre>
     *
     * <code>repeated .protos.Audience audiences = 1;</code>
     * @param values The audiences to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("plusAssignAllAudiences")
    @Suppress("NOTHING_TO_INLINE")
    public inline operator fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommon.Audience, AudiencesProxy>.plusAssign(values: kotlin.collections.Iterable<com.streamdal.protos.SpCommon.Audience>) {
      addAll(values)
    }
    /**
     * <pre>
     * If empty, client has not announced any audiences
     * </pre>
     *
     * <code>repeated .protos.Audience audiences = 1;</code>
     * @param index The index to set the value at.
     * @param value The audiences to set.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("setAudiences")
    public operator fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommon.Audience, AudiencesProxy>.set(index: kotlin.Int, value: com.streamdal.protos.SpCommon.Audience) {
      _builder.setAudiences(index, value)
    }
    /**
     * <pre>
     * If empty, client has not announced any audiences
     * </pre>
     *
     * <code>repeated .protos.Audience audiences = 1;</code>
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("clearAudiences")
    public fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.SpCommon.Audience, AudiencesProxy>.clear() {
      _builder.clearAudiences()
    }


    /**
     * <code>.protos.ClientInfo client = 2;</code>
     */
    public var client: com.streamdal.protos.SpInfo.ClientInfo
      @JvmName("getClient")
      get() = _builder.getClient()
      @JvmName("setClient")
      set(value) {
        _builder.setClient(value)
      }
    /**
     * <code>.protos.ClientInfo client = 2;</code>
     */
    public fun clearClient() {
      _builder.clearClient()
    }
    /**
     * <code>.protos.ClientInfo client = 2;</code>
     * @return Whether the client field is set.
     */
    public fun hasClient(): kotlin.Boolean {
      return _builder.hasClient()
    }
  }
}
@kotlin.jvm.JvmSynthetic
public inline fun com.streamdal.protos.SpInfo.LiveInfo.copy(block: com.streamdal.protos.LiveInfoKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpInfo.LiveInfo =
  com.streamdal.protos.LiveInfoKt.Dsl._create(this.toBuilder()).apply { block() }._build()

public val com.streamdal.protos.SpInfo.LiveInfoOrBuilder.clientOrNull: com.streamdal.protos.SpInfo.ClientInfo?
  get() = if (hasClient()) getClient() else null

