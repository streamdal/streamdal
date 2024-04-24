import { useState } from "preact/hooks";
import IconChevronDown from "tabler-icons/tsx/chevron-down.tsx";
import IconChevronUp from "tabler-icons/tsx/chevron-up.tsx";
import IconGripVertical from "tabler-icons/tsx/grip-vertical.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";

import { Pipeline, PipelineStep } from "streamdal-protos/protos/sp_pipeline.ts";
import { DetectiveType } from "streamdal-protos/protos/steps/sp_steps_detective.ts";

import * as uuid from "$std/uuid/mod.ts";
import { initFlowbite } from "https://esm.sh/v132/flowbite@1.7.0/denonext/flowbite.mjs";
import { FormHidden } from "root/components/form/formHidden.tsx";
import { FormInput } from "root/components/form/formInput.tsx";
import { FormStringKV } from "root/components/form/formStringKV.tsx";
import { KVAction } from "streamdal-protos/protos/shared/sp_shared.ts";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import { KVMode } from "streamdal-protos/protos/steps/sp_steps_kv.ts";
import {
  FormSelect,
  kvActionFromEnum,
  kvModeFromEnum,
  optionsFromEnum,
} from "../../components/form/formSelect.tsx";
import { InlineInput } from "../../components/form/inlineInput.tsx";
import {
  ErrorType,
  resolveValue,
  validate,
} from "../../components/form/validate.ts";
import { DeleteModal } from "../../components/modals/deleteModal.tsx";
import {
  kinds,
  newStep,
  PipelineSchema,
} from "../../components/pipeline/pipeline.ts";
import { PipelineMenu } from "../../components/pipeline/pipelineMenu.tsx";
import { StepMenu } from "../../components/pipeline/stepMenu.tsx";
import { Tooltip } from "../../components/tooltip/tooltip.tsx";
import { PipelineHTTP } from "../pipelines/pipelineHTTP.tsx";
import { PipelineSchemaValidation } from "../pipelines/pipelineSchemaValidation.tsx";
import { PipelineTransform } from "../pipelines/pipelineTransform.tsx";
import { argTypes, StepArgs } from "../../components/pipeline/stepArgs.tsx";
import { StepConditions } from "./stepConditions.tsx";

import IconX from "tabler-icons/tsx/x.tsx";

export default function PipelineDetail({
  pipeline,
  notifications,
}: {
  pipeline: Pipeline;
  notifications: NotificationConfig[];
}) {
  const [open, setOpen] = useState([0]);
  const [deleteOpen, setDeleteOpen] = useState<any>(null);

  //
  // typing the initializer to force preact useState hooks to
  // properly type this since it doesn't support useState<type>
  const e: ErrorType = {};
  const [errors, setErrors] = useState(e);
  const [data, setData] = useState<any>({
    ...pipeline,
    steps: pipeline?.steps?.map((s: PipelineStep, i) => ({
      ...s,
      dragId: uuid.v1.generate(),
      dragOrder: i,
    })),
  });

  const [dragId, setDragId] = useState(null);
  const [canDrag, setCanDrag] = useState(false);

  const addStep = () => {
    setData({
      ...data,
      steps: [
        ...data ? data.steps : [],
        ...[
          {
            ...newStep,
            dragId: uuid.v1.generate(),
            dragOrder: data?.steps?.length,
          },
        ],
      ],
    });
    setOpen([...open, data.steps.length]);
    setTimeout(() => initFlowbite(), 1000);
  };

  const deleteStep = (stepIndex: number) => {
    setData({
      ...data,
      steps: data.steps.filter((_: any, i: number) => i !== stepIndex),
    });
    setDeleteOpen(null);
  };

  const onSubmit = async (e: any) => {
    const formData = new FormData(e.target);

    const { errors } = validate(PipelineSchema as any, formData);
    setErrors(errors || {});

    if (errors) {
      e.preventDefault();
      return;
    }
  };

  const handleDrag = (ev: any) => {
    setDragId(ev.currentTarget.id);
  };

  const handleDrop = (ev: any) => {
    const dragStep = data.steps.find((s: PipelineStep & { dragId: string }) =>
      s.dragId === dragId
    );
    const dropStep = data.steps.find((s: PipelineStep & { dragId: string }) =>
      s.dragId === ev.currentTarget.id
    );
    const dragOrder = dragStep.dragOrder;
    const dropOrder = dropStep.dragOrder;

    setData({
      ...data,
      steps: data.steps.map((
        s: PipelineStep & { dragId: string; dragOrder: number },
      ) => ({
        ...s,
        dragOrder: s.dragId === dragId
          ? dropOrder
          : s.dragId === ev.currentTarget.id
          ? dragOrder
          : s.dragOrder,
      })),
    });
    setDragId(null);
  };

  return (
    <>
      <form onSubmit={onSubmit} action="/pipelines/save" method="post">
        <div class="flex items-center justify-between rounded-t px-[18px] pb-[8px] pt-[18px]">
          <div class="flex flex-row items-center">
            <div class="mr-2 h-[54px] text-[30px] font-medium">
              <FormHidden name="id" value={data?.id} />
              <InlineInput
                placeHolder="Name your pipeline"
                name="name"
                data={data}
                setData={setData}
                errors={errors}
                inputClass="w-full"
                defaultValue={resolveValue(data, "name")}
              />
            </div>
            <PipelineMenu id={pipeline?.id} />
          </div>
          <div class="ml-2">
            <a href="/" f-partial="/partials">
              <IconX class="w-6 h-6 pointer-events-none" />
            </a>
          </div>
        </div>

        <div class="flex flex-col px-6 pt-6">
          <div class="mb-6 flex flex-row items-center justify-between">
            <div class="flex flex-row items-center">
              <div class="mr-2 text-[16px] font-semibold">Steps</div>
              <div class="text-stormCloud text-[14px] font-medium">
                {pipeline?.steps?.length || 0}
              </div>
            </div>
            <IconPlus
              data-tooltip-target="step-add"
              class="h-5 w-5 cursor-pointer"
              onClick={() => {
                addStep();
              }}
            />
            <Tooltip targetId="step-add" message="Add a new step" />
          </div>

          {{ ...data }?.steps
            ?.sort((a: any, b: any) => a.dragOrder - b.dragOrder)
            .map((step: PipelineStep & { dragId: string }, i: number) => (
              <div class="mb-6 flex flex-row items-start">
                <div class="text-twilight mr-6 mt-4 text-[16px] font-medium">
                  {i + 1}
                </div>
                <div class="border-twilight w-full rounded-md border">
                  <div
                    class="flex w-full flex-row justify-between px-[9px] py-[13px]"
                    id={step.dragId}
                    draggable={canDrag}
                    onDragOver={(ev) => ev.preventDefault()}
                    onDragStart={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div class="flex flex-row">
                      <div class="mr-2">
                        <IconGripVertical
                          class="text-twilight h-6 w-6 cursor-grab"
                          onMouseEnter={() => setCanDrag(true)}
                          onMouseLeave={() => setCanDrag(true)}
                        />
                      </div>
                      <div class="mr-2 text-[16px] font-medium">
                        <InlineInput
                          placeHolder={"Name your step"}
                          name={`steps.${i}.name`}
                          data={data}
                          setData={setData}
                          errors={errors}
                          inputClass="w-full"
                          defaultValue={`Step #${i + 1}`}
                        />
                      </div>
                      <StepMenu
                        index={i}
                        onDelete={() => setDeleteOpen(i)}
                      />
                      {deleteOpen === i
                        ? (
                          <DeleteModal
                            entityType="Pipeline step"
                            entityName={step.name}
                            onClose={() => setDeleteOpen(null)}
                            onDelete={() => deleteStep(i)}
                          />
                        )
                        : null}
                    </div>
                    {open.includes(i)
                      ? (
                        <IconChevronUp
                          class="text-twilight h-6 w-6 cursor-pointer"
                          onClick={() =>
                            setOpen(open.filter((o: number) => o !== i))}
                        />
                      )
                      : (
                        <IconChevronDown
                          class="text-twilight h-6 w-6 cursor-pointer"
                          onClick={() => setOpen([...open, i])}
                        />
                      )}
                  </div>
                  <div
                    class={`mr-2 border-t p-[13px] text-[16px] font-medium ${
                      open.includes(i) ? "visible" : "hidden"
                    }`}
                  >
                    <FormSelect
                      name={`steps.${i}.step.oneofKind`}
                      data={data}
                      setData={setData}
                      label="Step Type"
                      errors={errors}
                      inputClass="w-64"
                      readonly={step.step.oneofKind === "custom"}
                      children={kinds.map((kind, i) => (
                        <option
                          key={`step-kind-key-${i}`}
                          value={kind.value}
                          label={kind.label}
                          disabled={kind.value === "custom"}
                        />
                      ))}
                    />
                    {"detective" === step.step.oneofKind && (
                      <>
                        <FormInput
                          name={`steps.${i}.step.detective.path`}
                          data={data}
                          setData={setData}
                          label="Path"
                          inputClass="w-full"
                          placeHolder={["HAS_FIELD", "IS_TYPE"].includes(
                              DetectiveType[data.steps[i].step.detective?.type],
                            )
                            ? "json.path"
                            : "an empty path will search entire json payload"}
                          errors={errors}
                        />
                        <div className="flex flex-col">
                          <FormSelect
                            name={`steps.${i}.step.detective.type`}
                            label="Detective Type"
                            data={data}
                            setData={setData}
                            errors={errors}
                            children={optionsFromEnum(DetectiveType)}
                          />
                          <div>
                            {argTypes.includes(
                              DetectiveType[
                                data.steps[i].step.detective?.type
                              ] as keyof typeof DetectiveType,
                            ) && (
                              <StepArgs
                                stepIndex={i}
                                type={DetectiveType[
                                  data.steps[i].step.detective.type
                                ] as keyof typeof DetectiveType}
                                data={data}
                                setData={setData}
                                errors={errors}
                              />
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    {"transform" === step.step.oneofKind && (
                      <PipelineTransform
                        stepNumber={i}
                        step={step}
                        data={data}
                        setData={setData}
                        errors={errors}
                      />
                    )}
                    {"schemaValidation" === step.step.oneofKind && (
                      <PipelineSchemaValidation
                        stepNumber={i}
                        step={step}
                        data={data}
                        setData={setData}
                        errors={errors}
                      />
                    )}
                    {"kv" === step.step.oneofKind && (
                      <>
                        <FormSelect
                          name={`steps.${i}.step.kv.action`}
                          label="Type"
                          data={data}
                          setData={setData}
                          errors={errors}
                          inputClass="w-64"
                          children={kvActionFromEnum(KVAction)}
                        />
                        <FormSelect
                          name={`steps.${i}.step.kv.mode`}
                          label="Mode"
                          data={data}
                          setData={setData}
                          errors={errors}
                          inputClass="w-64"
                          children={kvModeFromEnum(KVMode)}
                        />
                        <FormInput
                          name={`steps.${i}.step.kv.key`}
                          data={data}
                          setData={setData}
                          label="Key"
                          inputClass="w-full"
                          errors={errors}
                        />
                      </>
                    )}
                    {"httpRequest" === step.step.oneofKind && (
                      <PipelineHTTP
                        stepNumber={i}
                        data={data}
                        setData={setData}
                        errors={errors}
                      />
                    )}

                    {"custom" === step.step.oneofKind
                      ? (
                        <>
                          <div class="p-2 text-sm text-stormCloud">
                            Custom Wasm steps are not editable in the console.
                          </div>
                          <FormHidden
                            name={`steps.${i}.WasmId`}
                            value={resolveValue(data, `steps.${i}.WasmId`)}
                          />
                          <FormStringKV
                            name={`steps.${i}.step.custom.args`}
                            data={data}
                            label="Args"
                            description="Custom step arguments"
                            errors={errors}
                            readonly={true}
                          />
                        </>
                      )
                      : (
                        <StepConditions
                          notifications={notifications}
                          stepIndex={i}
                          data={data}
                          setData={setData}
                          errors={errors}
                        />
                      )}
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div class="mb-6 mr-6 flex flex-row justify-end">
          <button class="btn-heimdal" type="submit">
            Save
          </button>
        </div>
      </form>
    </>
  );
}