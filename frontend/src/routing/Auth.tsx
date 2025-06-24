import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";

export default function Auth() {
    const { userInfo } = useSelector((state: RootState) => state.auth);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        if (!userInfo) {
            if (pathname !== "/signup") navigate("/login");
        }
        if (userInfo && (pathname === "/login" || pathname === "/signup")) {
            navigate("/");
        }
    }, [userInfo, navigate]);

    return (
        <>
            <Outlet />
        </>
    );
}
