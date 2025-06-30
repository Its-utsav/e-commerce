import { useId, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
};

export default function Input(props: InputProps) {
    const id = useId();
    const { label, type, className, ...rest } = props;
    return (
        <div className="py-2">
            <label className="floating-label">
                <input
                    type={type}
                    placeholder={label}
                    id={id}
                    {...rest}
                    className={`input input-md w-full ${className}`}
                />
                {label && <span>{label}</span>}
            </label>
        </div>
    );
}
