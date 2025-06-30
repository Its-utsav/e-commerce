import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
export default function Button(props: ButtonProps) {
    const { type, className = "", children, ...rest } = props;
    return (
        <div className="m-2">
            <button
                type={type}
                className={`btn text-center ${className}`}
                {...rest}
            >
                {children}
            </button>
        </div>
    );
}
