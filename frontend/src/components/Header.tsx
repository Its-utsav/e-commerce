import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import { logout } from "../features/auth/authSlice";
import authservice from "../services/auth/auth";
import type { RootState } from "../store/store";
import Button from "./Button";
import Container from "./Container";

function LogOut() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleClick = () => {
        authservice.logout().then((res) => {
            if (res) {
                dispatch(logout());
                navigate("/");
            }
        });
    };
    return <Button onClick={handleClick}>Log out</Button>;
}

export default function Header() {
    const { userInfo } = useSelector((state: RootState) => state.auth);
    const linkStatus = userInfo ? true : false;
    const navItems = [
        { name: "Home", path: "/", active: true },
        { name: "Login", path: "/login", active: !linkStatus },
        { name: "Singup", path: "/signup", active: !linkStatus },
        { name: "Cart", path: "/cart", active: linkStatus },
        { name: "Order History", path: "/orderHistory", active: linkStatus },
        { name: "Profile", path: "/profile", active: linkStatus },
    ];

    return (
        <header>
            <Container>
                <nav className="flex items-center justify-between">
                    {navItems.map((item) =>
                        item.active ? (
                            <NavLink
                                to={item.path}
                                key={item.name}
                                className={({ isActive }) =>
                                    `mx-4 ${isActive ? "text-red-300" : ""}`
                                }
                            >
                                {item.name}
                            </NavLink>
                        ) : null,
                    )}
                    {userInfo && <LogOut />}
                </nav>
            </Container>
        </header>
    );
}
