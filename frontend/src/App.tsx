import { Outlet } from "react-router";
import { Footer, Header } from "./components";
import { useEffect } from "react";
import productService from "./services/product/product";

export default function App() {
  const fetchData = async () => {
    const res = await productService.getProductsDetails("search=product");
    console.log(res);
  };
  // console.log(loginUser({ email: "utsav@one.com", password: "123456789" }));
  useEffect(() => {
    // fetchData();
  }, []);
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
