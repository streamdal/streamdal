import { ErrorType, parsePath, resolveValue, updateData } from "./validate.ts";
import { isNumeric } from "../../lib/utils.ts";
import { ChangeEvent, ReactNode } from "react";
import { FormHidden } from "./formHidden.tsx";

export type FormSelectProps = {
  name: string;
  data: any;
  setData: (data: any) => void;
  placeHolder?: string;
  label?: string;
  errors: ErrorType;
  children: ReactNode;
  inputClass?: string;
  wrapperClass?: string;
  readonly?: boolean;
};

export const FormSelect = ({
  name,
  data,
  setData,
  errors,
  label,
  children,
  placeHolder,
  inputClass,
  wrapperClass,
  readonly,
}: FormSelectProps) => {
  const value = resolveValue(data, name);
  return (
    <div class={`flex flex-col my-2 ${wrapperClass}`}>
      {label && (
        <label
          htmlFor={name}
          className={`text-xs mb-[3px] ${errors[name] && "text-streamdalRed"}`}
        >
          {label}
        </label>
      )}
      {readonly && <FormHidden name={name} value={value} />}

      <select
        id={name}
        name={name}
        disabled={readonly}
        class={`cursor-pointer rounded-sm border outline-0 px-2 pe-6 h-[47px] border-${
          errors[name] ? "streamdalRed" : "twilight"
        } ${inputClass}`}
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          updateData(data, setData, parsePath(name), e.currentTarget.value)}
        placeholder={placeHolder}
      >
        {children}
      </select>

      <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
        {errors[name]}
      </div>
    </div>
  );
};

export const optionsFromEnum = (optionsEnum: any) =>
  Object.entries(optionsEnum).filter((
    [k, _],
  ) => isNumeric(k) && Number(k) > 0)
    .map(([
      k,
      v,
    ], i) => (
      <option
        key={`option-type-key-${i}-${k}`}
        value={k}
        label={v as string}
      />
    ));

export const kvActionFromEnum = (optionsEnum: any) =>
  Object.entries(optionsEnum).filter((
    [k, _],
  ) => isNumeric(k) && Number(k) > 0)
    .map(([
      k,
      v,
    ], i) => (
      <option
        key={`option-type-key-${i}-${k}`}
        value={k}
        disabled={v !== "KV_ACTION_EXISTS"}
        label={`${(v as string).replace("KV_ACTION_", "")}${
          v !== "KV_ACTION_EXISTS" ? " - coming soon" : ""
        }`}
      />
    ));

export const kvModeFromEnum = (optionsEnum: any) =>
  Object.entries(optionsEnum).filter((
    [k, _],
  ) => isNumeric(k) && Number(k) > 0)
    .map(([
      k,
      v,
    ], i) => (
      <option
        key={`option-type-key-${i}-${k}`}
        value={k}
        label={(v as string).replace("KV_MODE_", "")}
      />
    ));

export const payloadIncludeEnum = (optionsEnum: any) =>
  Object.entries(optionsEnum).filter((
    [k, _],
  ) => isNumeric(k) && Number(k) > 0)
    .map(([
      k,
      v,
    ], i) => (
      <option
        key={`option-type-key-${i}-${k}`}
        value={k}
        label={(v as string).replace("_", " ")}
      />
    ));
