import { useEffect, useState } from "react";
import authservice from "../services/auth/auth";
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
  console.log(user);
  return (
    user && (
      <div className="h-48">
        <div className="flex flex-col items-center justify-center">
          {user.avatarUrl && <img src={user.avatarUrl} alt={user.username} />}
          <p className="my-4">username : {user.username}</p>
          <p className="my-4">email : {user.email}</p>
          <p className="my-4">role : {user.role}</p>
        </div>
      </div>
    )
  );
}
