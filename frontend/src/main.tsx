import { StrictMode } from "react";
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
import {
  Cart,
  Home,
  Login,
  NotFound,
  OrderHistory,
  Product,
  Profile,
  SignUp,
} from "./pages/index.ts";
import Auth from "./routing/Auth.tsx";
import Public from "./routing/Public.tsx";
import store from "./store/store.ts";

// const Home = lazy(() => import("./pages/Home.tsx"));

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
    <>
      <Route path="/" element={<App />}>
        {/* Base App setup header , footer and outlet */}
        <Route path="*" element={<NotFound />} /> {/* Not Found page */}
        <Route path="" element={<Home />} />
        <Route element={<Public />}>
          {/*Routes that are avaiable for all users*/}
          <Route path="login" element={<Login />} /> {/*Page for Login*/}
          <Route path="signup" element={<SignUp />} /> {/*Page for singup*/}
        </Route>
        <Route element={<Auth />}>
          <Route path="orderHistory" element={<OrderHistory />} />
          <Route path="cart" element={<Cart />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="products/:productId" element={<Product />} />
      </Route>
    </>,
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
