export type HiddenInputProps = {
  name: string;
  value: string;
};

export const FormHidden = ({
  name,
  value,
}: HiddenInputProps) => (
  <input
    type="hidden"
    id={name}
    name={name}
    value={value}
  />
);
