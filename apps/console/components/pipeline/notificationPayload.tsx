import { FormSelect, payloadIncludeEnum } from "../form/formSelect.tsx";
import { PipelineStepNotification_PayloadType } from "streamdal-protos/protos/sp_pipeline.ts";
import { ErrorType, resolveValue } from "../form/validate.ts";
import { FormNInput } from "../form/formNInput.tsx";

export type NotificationPayloadType = {
  name: string;
  data: any;
  setData: (data: any) => void;
  errors: ErrorType;
};

export const NotificationPayload = (
  { name, data, setData, errors }: NotificationPayloadType,
) => {
  const typeValue = resolveValue(data, `${name}.payloadType`);
  return (
    <div class="m-2">
      <FormSelect
        name={`${name}.payloadType`}
        label="Include Payload?"
        data={data}
        setData={setData}
        errors={errors}
        inputClass="w-64"
        children={payloadIncludeEnum(
          PipelineStepNotification_PayloadType,
        )}
      />
      {typeValue == PipelineStepNotification_PayloadType.SELECT_PATHS && (
        <FormNInput
          name={`${name}.paths`}
          data={data}
          setData={setData}
          label="Path"
          placeHolder="ex: object.field"
          errors={errors}
        />
      )}
    </div>
  );
};
