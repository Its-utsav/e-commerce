import { useDispatch } from "react-redux";
import { login } from "../features/auth/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  dispatch(login({ email: "utsav@one.com", password: "123456789" }));
  return <div>Login</div>;
}
