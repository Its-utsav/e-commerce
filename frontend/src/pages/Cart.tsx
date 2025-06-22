import { useEffect, useState } from "react";
import cartService from "../services/cart/cart";
import type { CartDeatils } from "../types/cart.types";
import { ErrorCmp } from "../components";

export default function Cart() {
  const [cart, setCart] = useState<null | CartDeatils>(null);
  const [errors, setErrors] = useState("");
  useEffect(() => {
    cartService
      .getCartDeatils()
      .then((c) => setCart(c))
      .catch((e) => {
        setErrors(e.message);
      });
  }, []);
  // console.log(cart);
  if (errors) {
    return <ErrorCmp value={errors} />;
  }
  return <div>Cart</div>;
}
