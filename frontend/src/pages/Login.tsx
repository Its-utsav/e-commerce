import { useForm, type FieldErrors } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Button, ErrorCmp, Input } from "../components";
import { useState } from "react";
import authservice from "../services/auth/auth";
import { useDispatch } from "react-redux";
import { login as userLogin } from "../features/auth/authSlice";
interface Inputs {
    email: string;
    password: string;
}

export default function Login() {
    const [errors, setErrors] = useState("");
    const { register, handleSubmit } = useForm<Inputs>();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const login = async (data: Inputs) => {
        setErrors("");
        try {
            const res = await authservice.login(data);
            if (res) {
                dispatch(userLogin(res));
                navigate("/");
            }
        } catch (error) {
            if (error instanceof Error) setErrors(error.message);
            console.error(error);
        }
    };

    const formErrors = (error: FieldErrors<Inputs>) => {
        if (error) {
            let e = "";

            for (let [field, msg] of Object.entries(error)) {
                if (field && msg.message && msg.message !== "") {
                    e += msg.message + " ";
                }
            }

            setErrors(e);
        }
    };

    return (
        <div className="flex w-full flex-col items-center justify-between gap-4">
            <div>
                Login
                <div>
                    <p>
                        Don't have account ? <Link to={"/signup"}>SignUp</Link>
                    </p>
                </div>
            </div>
            <form onSubmit={handleSubmit(login, formErrors)}>
                <div className="space-y-5">
                    <Input
                        label="Email"
                        className="block w-full"
                        {...register("email", {
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: "Email should be in valid format",
                            },
                            required: {
                                value: true,
                                message: "Email is required",
                            },
                        })}
                    />
                </div>
                <div className="space-y-5">
                    <Input
                        label="Password"
                        className="block w-full"
                        {...register("password", {
                            minLength: {
                                value: 8,
                                message:
                                    "Password should be at least 8 character long",
                            },
                            required: {
                                value: true,
                                message: "Password is required",
                            },
                        })}
                    />
                </div>
                <Button type="submit">Login</Button>
            </form>
            {errors && <ErrorCmp value={errors} />}
        </div>
    );
}
