import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
export default function Button(props: ButtonProps) {
    const { type, className = "", children, ...rest } = props;
    return (
        <div className="cursor-pointer bg-amber-300 text-center">
            <button
                type={type}
                className={`text-center ${className}`}
                {...rest}
            >
                {children}
            </button>
        </div>
    );
}
