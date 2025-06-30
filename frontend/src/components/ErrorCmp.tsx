import { useEffect, useState } from "react";

interface Props {
    value: string;
    autoHide?: boolean;
    className?: string;
}

export default function ErrorCmp(props: Props) {
    const { autoHide, value, className = "alert-error" } = props;

    const [visible, setVisible] = useState<boolean>(false);
    const showComponent = () => {
        setVisible(true);
        setTimeout(() => {
            setVisible(false);
        }, 3000);
    };
    const normalShow = () => {
        setVisible(true);
    };
    useEffect(() => {
        if (autoHide === true) {
            showComponent();
        } else {
            normalShow();
        }
    }, [value, autoHide]);
    return (
        <div role="alert" className={`alert ${className}`}>
            {visible && <span>{value}</span>}
        </div>
    );
}
