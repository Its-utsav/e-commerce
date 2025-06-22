import { useId, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input(props: InputProps) {
  const id = useId();
  const { label, type, className, ...rest } = props;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="text-center">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={`Enter ${label || "input"}`}
        id={id}
        {...rest}
        className={className}
      />
    </div>
  );
}
