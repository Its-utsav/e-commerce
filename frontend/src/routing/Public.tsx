import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Navigate, Outlet } from "react-router";

export default function Public() {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  return userInfo ? <Navigate to={"/"} /> : <Outlet />;
}
