import { useEffect, useState } from "react";
import authservice from "../services/auth";
import type { GeneralUserResponse } from "../types/user.types";

export default function Profile() {
    const [user, setUser] = useState<null | GeneralUserResponse>(null);
    const fetchInfo = async () => {
        const res = await authservice.getUserInfo();
        setUser(res);
    };
    useEffect(() => {
        fetchInfo();
    }, []);

    return (
        user && (
            <div>
                <div className="flex flex-col items-center justify-center">
                    {user.avatarUrl && (
                        <div className="avatar h-32">
                            <img
                                className="h-48 rounded-sm"
                                src={user.avatarUrl}
                                alt={`${user.username} profile image`}
                            />
                        </div>
                    )}
                    <p className="my-4">username : {user.username}</p>
                    <p className="my-4">email : {user.email}</p>
                    <p className="my-4">role : {user.role}</p>
                </div>
            </div>
        )
    );
}
