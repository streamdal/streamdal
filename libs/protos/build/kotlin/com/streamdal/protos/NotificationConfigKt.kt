//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: sp_notify.proto

package com.streamdal.protos;

@kotlin.jvm.JvmName("-initializenotificationConfig")
public inline fun notificationConfig(block: com.streamdal.protos.NotificationConfigKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpNotify.NotificationConfig =
  com.streamdal.protos.NotificationConfigKt.Dsl._create(com.streamdal.protos.SpNotify.NotificationConfig.newBuilder()).apply { block() }._build()
public object NotificationConfigKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  public class Dsl private constructor(
    private val _builder: com.streamdal.protos.SpNotify.NotificationConfig.Builder
  ) {
    public companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.streamdal.protos.SpNotify.NotificationConfig.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.streamdal.protos.SpNotify.NotificationConfig = _builder.build()

    /**
     * <code>optional string id = 1;</code>
     */
    public var id: kotlin.String
      @JvmName("getId")
      get() = _builder.getId()
      @JvmName("setId")
      set(value) {
        _builder.setId(value)
      }
    /**
     * <code>optional string id = 1;</code>
     */
    public fun clearId() {
      _builder.clearId()
    }
    /**
     * <code>optional string id = 1;</code>
     * @return Whether the id field is set.
     */
    public fun hasId(): kotlin.Boolean {
      return _builder.hasId()
    }

    /**
     * <code>string name = 2;</code>
     */
    public var name: kotlin.String
      @JvmName("getName")
      get() = _builder.getName()
      @JvmName("setName")
      set(value) {
        _builder.setName(value)
      }
    /**
     * <code>string name = 2;</code>
     */
    public fun clearName() {
      _builder.clearName()
    }

    /**
     * <code>.protos.NotificationType type = 3;</code>
     */
    public var type: com.streamdal.protos.SpNotify.NotificationType
      @JvmName("getType")
      get() = _builder.getType()
      @JvmName("setType")
      set(value) {
        _builder.setType(value)
      }
    /**
     * <code>.protos.NotificationType type = 3;</code>
     */
    public fun clearType() {
      _builder.clearType()
    }

    /**
     * <code>.protos.NotificationSlack slack = 1000;</code>
     */
    public var slack: com.streamdal.protos.SpNotify.NotificationSlack
      @JvmName("getSlack")
      get() = _builder.getSlack()
      @JvmName("setSlack")
      set(value) {
        _builder.setSlack(value)
      }
    /**
     * <code>.protos.NotificationSlack slack = 1000;</code>
     */
    public fun clearSlack() {
      _builder.clearSlack()
    }
    /**
     * <code>.protos.NotificationSlack slack = 1000;</code>
     * @return Whether the slack field is set.
     */
    public fun hasSlack(): kotlin.Boolean {
      return _builder.hasSlack()
    }

    /**
     * <code>.protos.NotificationEmail email = 1001;</code>
     */
    public var email: com.streamdal.protos.SpNotify.NotificationEmail
      @JvmName("getEmail")
      get() = _builder.getEmail()
      @JvmName("setEmail")
      set(value) {
        _builder.setEmail(value)
      }
    /**
     * <code>.protos.NotificationEmail email = 1001;</code>
     */
    public fun clearEmail() {
      _builder.clearEmail()
    }
    /**
     * <code>.protos.NotificationEmail email = 1001;</code>
     * @return Whether the email field is set.
     */
    public fun hasEmail(): kotlin.Boolean {
      return _builder.hasEmail()
    }

    /**
     * <code>.protos.NotificationPagerDuty pagerduty = 1002;</code>
     */
    public var pagerduty: com.streamdal.protos.SpNotify.NotificationPagerDuty
      @JvmName("getPagerduty")
      get() = _builder.getPagerduty()
      @JvmName("setPagerduty")
      set(value) {
        _builder.setPagerduty(value)
      }
    /**
     * <code>.protos.NotificationPagerDuty pagerduty = 1002;</code>
     */
    public fun clearPagerduty() {
      _builder.clearPagerduty()
    }
    /**
     * <code>.protos.NotificationPagerDuty pagerduty = 1002;</code>
     * @return Whether the pagerduty field is set.
     */
    public fun hasPagerduty(): kotlin.Boolean {
      return _builder.hasPagerduty()
    }
    public val configCase: com.streamdal.protos.SpNotify.NotificationConfig.ConfigCase
      @JvmName("getConfigCase")
      get() = _builder.getConfigCase()

    public fun clearConfig() {
      _builder.clearConfig()
    }
  }
}
@kotlin.jvm.JvmSynthetic
public inline fun com.streamdal.protos.SpNotify.NotificationConfig.copy(block: com.streamdal.protos.NotificationConfigKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.SpNotify.NotificationConfig =
  com.streamdal.protos.NotificationConfigKt.Dsl._create(this.toBuilder()).apply { block() }._build()

public val com.streamdal.protos.SpNotify.NotificationConfigOrBuilder.slackOrNull: com.streamdal.protos.SpNotify.NotificationSlack?
  get() = if (hasSlack()) getSlack() else null

public val com.streamdal.protos.SpNotify.NotificationConfigOrBuilder.emailOrNull: com.streamdal.protos.SpNotify.NotificationEmail?
  get() = if (hasEmail()) getEmail() else null

public val com.streamdal.protos.SpNotify.NotificationConfigOrBuilder.pagerdutyOrNull: com.streamdal.protos.SpNotify.NotificationPagerDuty?
  get() = if (hasPagerduty()) getPagerduty() else null

