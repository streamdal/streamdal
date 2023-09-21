import { useState } from "preact/hooks";

export const Toggle = (
  { label, value, setValue }: {
    label: string;
    value: boolean;
    setValue: (arg: boolean) => void;
  },
) => {
  const [checked, setChecked] = useState(value);
  return (
    <label
      className="relative inline-flex items-center cursor-pointer"
      onClick={() => {
        setChecked(!checked);
        setValue(!value);
      }}
    >
      <span className="mr-3 text-[12px] font-[500] leading-[20px] text-cobweb">
        {label}
      </span>

      <div
        className={`w-[28px] h-[14px] rounded-full flex items-center my-1 ${
          checked ? "bg-streamdalPurple justify-end" : "bg-haze justify-start"
        }`}
      >
        <div
          className={`absolute w-[12px] h-[12px] rounded-full bg-white m-[2px]`}
        >
        </div>
      </div>
    </label>
  );
};
