import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
export default function Button(props: ButtonProps) {
    const { type, className = "", children, ...rest } = props;
    return (
        <div className="btn">
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
