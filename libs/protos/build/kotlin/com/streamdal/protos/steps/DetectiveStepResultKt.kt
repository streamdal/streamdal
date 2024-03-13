//Generated by the protocol buffer compiler. DO NOT EDIT!
// source: steps/sp_steps_detective.proto

package com.streamdal.protos.steps;

@kotlin.jvm.JvmName("-initializedetectiveStepResult")
public inline fun detectiveStepResult(block: com.streamdal.protos.steps.DetectiveStepResultKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResult =
  com.streamdal.protos.steps.DetectiveStepResultKt.Dsl._create(com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResult.newBuilder()).apply { block() }._build()
public object DetectiveStepResultKt {
  @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
  @com.google.protobuf.kotlin.ProtoDslMarker
  public class Dsl private constructor(
    private val _builder: com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResult.Builder
  ) {
    public companion object {
      @kotlin.jvm.JvmSynthetic
      @kotlin.PublishedApi
      internal fun _create(builder: com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResult.Builder): Dsl = Dsl(builder)
    }

    @kotlin.jvm.JvmSynthetic
    @kotlin.PublishedApi
    internal fun _build(): com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResult = _builder.build()

    /**
     * An uninstantiable, behaviorless type to represent the field in
     * generics.
     */
    @kotlin.OptIn(com.google.protobuf.kotlin.OnlyForUseByGeneratedProtoCode::class)
    public class MatchesProxy private constructor() : com.google.protobuf.kotlin.DslProxy()
    /**
     * <code>repeated .protos.steps.DetectiveStepResultMatch matches = 1;</code>
     */
     public val matches: com.google.protobuf.kotlin.DslList<com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResultMatch, MatchesProxy>
      @kotlin.jvm.JvmSynthetic
      get() = com.google.protobuf.kotlin.DslList(
        _builder.getMatchesList()
      )
    /**
     * <code>repeated .protos.steps.DetectiveStepResultMatch matches = 1;</code>
     * @param value The matches to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("addMatches")
    public fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResultMatch, MatchesProxy>.add(value: com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResultMatch) {
      _builder.addMatches(value)
    }
    /**
     * <code>repeated .protos.steps.DetectiveStepResultMatch matches = 1;</code>
     * @param value The matches to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("plusAssignMatches")
    @Suppress("NOTHING_TO_INLINE")
    public inline operator fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResultMatch, MatchesProxy>.plusAssign(value: com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResultMatch) {
      add(value)
    }
    /**
     * <code>repeated .protos.steps.DetectiveStepResultMatch matches = 1;</code>
     * @param values The matches to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("addAllMatches")
    public fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResultMatch, MatchesProxy>.addAll(values: kotlin.collections.Iterable<com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResultMatch>) {
      _builder.addAllMatches(values)
    }
    /**
     * <code>repeated .protos.steps.DetectiveStepResultMatch matches = 1;</code>
     * @param values The matches to add.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("plusAssignAllMatches")
    @Suppress("NOTHING_TO_INLINE")
    public inline operator fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResultMatch, MatchesProxy>.plusAssign(values: kotlin.collections.Iterable<com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResultMatch>) {
      addAll(values)
    }
    /**
     * <code>repeated .protos.steps.DetectiveStepResultMatch matches = 1;</code>
     * @param index The index to set the value at.
     * @param value The matches to set.
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("setMatches")
    public operator fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResultMatch, MatchesProxy>.set(index: kotlin.Int, value: com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResultMatch) {
      _builder.setMatches(index, value)
    }
    /**
     * <code>repeated .protos.steps.DetectiveStepResultMatch matches = 1;</code>
     */
    @kotlin.jvm.JvmSynthetic
    @kotlin.jvm.JvmName("clearMatches")
    public fun com.google.protobuf.kotlin.DslList<com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResultMatch, MatchesProxy>.clear() {
      _builder.clearMatches()
    }

  }
}
@kotlin.jvm.JvmSynthetic
public inline fun com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResult.copy(block: com.streamdal.protos.steps.DetectiveStepResultKt.Dsl.() -> kotlin.Unit): com.streamdal.protos.steps.SpStepsDetective.DetectiveStepResult =
  com.streamdal.protos.steps.DetectiveStepResultKt.Dsl._create(this.toBuilder()).apply { block() }._build()

