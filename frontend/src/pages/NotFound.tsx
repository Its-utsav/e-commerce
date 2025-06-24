import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function NotFound() {
    const [time, setTime] = useState(5);
    const navigate = useNavigate();
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(() => time - 1);
            if (time === 0) {
                navigate("/");
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [time, navigate]);

    return (
        <div>
            <div className="flex h-screen w-screen flex-col items-center justify-center gap-2">
                <h1 className="p-4">404 | Not Found</h1>
                <p>Redirect to Home page in {time} seconds</p>
            </div>
        </div>
    );
}
