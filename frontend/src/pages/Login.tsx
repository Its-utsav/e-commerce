import { useForm, type FieldErrors } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Button, ErrorCmp, Input } from "../components";
import { useState } from "react";
import authservice from "../services/auth";
import { useDispatch } from "react-redux";
import { login as userLogin } from "../features/auth/authSlice";
interface Inputs {
    email: string;
    password: string;
}

export default function Login() {
    const [errors, setErrors] = useState("");
    const [loading, setLoading] = useState<boolean>();

    const { register, handleSubmit } = useForm<Inputs>();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const login = async (data: Inputs) => {
        setErrors("");
        setLoading(true);
        try {
            const res = await authservice.login(data);
            if (res) {
                dispatch(userLogin(res));
                setLoading(false);
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
        <div>
            <div className="flex flex-col items-center justify-center">
                <div className="py-2">
                    <p>
                        Don't have account ?{" "}
                        <Link to={"/signup"} className="link">
                            SignUp
                        </Link>
                    </p>
                </div>
                <div className="w-2/3">
                    <form onSubmit={handleSubmit(login, formErrors)}>
                        <div className="space-y-5">
                            <Input
                                label="Email"
                                className="block w-full"
                                {...register("email", {
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                        message:
                                            "Email should be in valid format",
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
                        <div className="flex flex-col items-center justify-center">
                            <Button
                                type="submit"
                                className="btn-soft"
                                disabled={loading}
                            >
                                Login
                            </Button>
                            {loading && (
                                <button className="btn">
                                    <span className="loading loading-spinner"></span>
                                    loading
                                </button>
                            )}
                        </div>
                    </form>
                </div>
                {errors && <ErrorCmp value={errors} autoHide={true} />}
            </div>
        </div>
    );
}
