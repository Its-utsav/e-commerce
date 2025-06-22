import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import {
  Login,
  Home,
  SignUp,
  NotFound,
  OrderHistory,
  Cart,
  Profile,
} from "./pages/index.ts";
import { Provider } from "react-redux";
import store from "./store/store.ts";
import Public from "./routing/Public.tsx";
import Auth from "./routing/Auth.tsx";

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
