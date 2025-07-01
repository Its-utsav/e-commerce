import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router";
import App from "./App.tsx";
import "./index.css";
import { NotFound, Profile } from "./pages/index.ts";
import Auth from "./routing/Auth.tsx";
import Public from "./routing/Public.tsx";
import store from "./store/store.ts";
import Loading from "./components/Loading.tsx";

const Home = lazy(() => import("./pages/Home.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const SignUp = lazy(() => import("./pages/SignUp.tsx"));
const Product = lazy(() => import("./pages/Product.tsx"));
const OrderHistory = lazy(() => import("./pages/OrderHistory.tsx"));
const Cart = lazy(() => import("./pages/Cart.tsx"));
const Order = lazy(() => import("./pages/Order.tsx"));

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <App />,
//     children: [
//       {
//         path: "/",
//         element: <Home />,
//       },
//     ],
//   },
// ]);

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route
                path=""
                element={
                    <Suspense fallback={<Loading />}>
                        <Home />
                    </Suspense>
                }
            />
            <Route element={<Public />}>
                <Route
                    path="login"
                    element={
                        <Suspense fallback={<Loading />}>
                            <Login />
                        </Suspense>
                    }
                />
                <Route
                    path="signup"
                    element={
                        <Suspense fallback={<Loading />}>
                            <SignUp />
                        </Suspense>
                    }
                />
            </Route>
            <Route element={<Auth />}>
                <Route path="orders">
                    <Route
                        index
                        element={
                            <Suspense fallback={<Loading />}>
                                <OrderHistory />
                            </Suspense>
                        }
                    />
                    <Route
                        path=":orderId"
                        element={
                            <Suspense fallback={<Loading />}>
                                <Order />
                            </Suspense>
                        }
                    />
                </Route>
                <Route
                    path="cart"
                    element={
                        <Suspense fallback={<Loading />}>
                            <Cart />
                        </Suspense>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <Suspense fallback={<Loading />}>
                            <Profile />
                        </Suspense>
                    }
                />
            </Route>
            <Route
                path="products/:productId"
                element={
                    <Suspense fallback={<Loading />}>
                        <Product />
                    </Suspense>
                }
            />
            <Route path="*" element={<NotFound />} />
        </Route>,
    ),
);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
        {/* <App /> */}
    </StrictMode>,
);
