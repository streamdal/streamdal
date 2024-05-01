import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import { useEffect, useState } from "preact/hooks";
import {
  FormSelect,
  payloadIncludeEnum,
} from "root/components/form/formSelect.tsx";
import { FormNInput } from "root/components/form/formNInput.tsx";
import { PipelineStepNotification_PayloadType } from "streamdal-protos/protos/sp_pipeline.ts";
import { ErrorType, resolveValue } from "root/components/form/validate.ts";

export type StepNotificationType = {
  notification: NotificationConfig;
  name: string;
  data: any;
  setData: (data: any) => void;
  errors: ErrorType;
};

export const StepNotification = (
  { notification, name, data, setData, errors }: StepNotificationType,
) => {
  const [checked, setChecked] = useState(false);
  const typeValue = resolveValue(data, `${name}.payloadType`);

  useEffect(() => {
    const existingNotifications = resolveValue(
      data,
      `${name}.notificationConfigIds`,
    );

    setChecked(existingNotifications?.includes(notification.id));
  }, [notification]);

  return (
    <>
      <div
        class="flex flex-row items-center mb"
        onClick={() => setChecked(!checked)}
      >
        <input
          type="checkbox"
          name={`${name}.notificationConfigIds`}
          className={`w-4 h-4 rounded border mx-2 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2`}
          checked={checked}
          value={notification.id}
        />
        <label className="text-web font-medium text-[14px]">
          {`${notification.config.oneofKind} -  ${notification.name}`}
        </label>
      </div>
      {checked &&
        (
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
        )}
    </>
  );
};
