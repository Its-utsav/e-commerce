import { Link, useNavigate } from "react-router";
import { Button, ErrorCmp, Input } from "../components";
import { useForm, type FieldErrors } from "react-hook-form";
import { useState } from "react";
import authservice from "../services/auth";
import type { SignUpData } from "../types/user.types";

export default function SignUp() {
    const { register, handleSubmit } = useForm<SignUpData>();
    const [errors, setErrors] = useState("");
    const [visible, setVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>();
    const navigate = useNavigate();
    const showComponent = () => {
        setVisible(true);
        setTimeout(() => {
            setVisible(false);
            setErrors("");
        }, 3000);
    };

    const singup = async (data: SignUpData) => {
        setLoading(true);
        try {
            const res = await authservice.signup(data);
            if (res) {
                navigate("/");
            }
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
                setErrors(error.message);
                setVisible(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const formErrors = (error: FieldErrors<SignUpData>) => {
        if (error) {
            let e = "";
            for (let [field, msg] of Object.entries(error)) {
                if (field && msg.message && msg.message !== "") {
                    e += msg.message + `. `;
                }
            }
            setErrors(e);
            showComponent();
        }
    };
    return (
        <div>
            <div className="flex flex-col items-center justify-center">
                <div className="py-2">
                    <p>
                        Already have account ?{" "}
                        <Link to={"/login"} className="link">
                            Login
                        </Link>
                    </p>
                </div>
                <div className="w-2/3">
                    <form onSubmit={handleSubmit(singup, formErrors)}>
                        <div>
                            <Input
                                label="username"
                                type="name"
                                {...register("username", {
                                    required: {
                                        value: true,
                                        message: "username is required",
                                    },
                                })}
                            />
                        </div>
                        <div>
                            <Input
                                label="email"
                                {...register("email", {
                                    required: {
                                        value: true,
                                        message: "Email is required",
                                    },
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                        message:
                                            "Email should be in valid format",
                                    },
                                })}
                            />
                        </div>
                        <div>
                            <Input
                                label="password"
                                {...register("password", {
                                    required: {
                                        value: true,
                                        message: "password is required",
                                    },
                                    minLength: {
                                        value: 8,
                                        message:
                                            "Password should be at least 8 character long",
                                    },
                                })}
                            />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            {/* hide this when click on loading haha */}
                            <Button
                                type="submit"
                                className="btn-soft"
                                disabled={loading}
                            >
                                Sing up
                            </Button>
                            {loading && (
                                <button className="btn">
                                    <span className="loading loading-spinner"></span>
                                    loading
                                </button>
                            )}
                            {errors && visible && (
                                <ErrorCmp value={errors} autoHide={true} />
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
