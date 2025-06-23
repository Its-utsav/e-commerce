import { useEffect, useState } from "react";
import { ErrorCmp, ProductCart } from "../components";
import cartService from "../services/cart/cart";
import productService from "../services/product/product";
import type { CartDeatils } from "../types/cart.types";
import type { ProdcutDetails } from "../types/product.types";

export default function Cart() {
  const [cart, setCart] = useState<CartDeatils | null>(null);
  const [product, setProducts] = useState<ProdcutDetails[] | null>(null);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    cartService
      .getCartDeatils()
      .then((c) => setCart(c))
      .catch((e) => {
        setErrors(e.message);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!cart?.products.length) return;
      try {
        const res = await Promise.all(
          cart.products.map((p) =>
            productService.getProductDetails(p.productId),
          ),
        );
        setProducts(res as ProdcutDetails[]);
      } catch (error) {}
    };
    fetchData();
  }, [cart]);

  console.log(product);
  if (errors) {
    return <ErrorCmp value={errors} />;
  }

  return (
    <div>
      <div>
        <table>
          <thead>
            <tr>
              <th>Total Amount </th>
              <th>Total Items</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td> ₹ {cart?.amount}</td>
              <td>{cart?.totalItems}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <div className="flex flex-col gap-2">
          {product &&
            product?.map((p) => (
              <ProductCart
                key={p._id}
                imgUrl={p.imageUrls[0]}
                price={p.finalPrice}
                quantity={p.stock}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
