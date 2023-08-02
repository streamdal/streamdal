type HiddenInputProps = {
  name: string;
  value: string;
  register: any;
};

export const FormHidden = ({ name, value, register }: HiddenInputProps) => (
  <input type="hidden" {...register(name)} value={value} />
);
