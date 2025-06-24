import { Outlet } from "react-router";
import { Footer, Header } from "./components";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login, logout } from "./features/auth/authSlice";
import authservice from "./services/auth/auth";

export default function App() {
    const dispatch = useDispatch();
    // const fetchData = async () => {
    //   const res = await productService.getProductsDetails("search=product");
    //   console.log(res);
    // };
    // console.log(loginUser({ email: "utsav@one.com", password: "123456789" }));
    useEffect(() => {
        // fetchData();
        const user = localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user")!)
            : null;

        if (user) {
            dispatch(login(user));
        } else {
            authservice.getUserInfo().then((res) => {
                if (res) {
                    dispatch(login(res));
                } else {
                    dispatch(logout());
                }
            });
        }
    }, []);
    return (
        <>
            <div className="flex min-h-screen flex-wrap content-between">
                <div className="mx-4 block w-full">
                    <Header />
                    <Outlet />
                    <Footer />
                </div>
            </div>
        </>
    );
}
