import { useEffect, useState } from "react";
import { ErrorCmp, ProductCart } from "../components";
import cartService from "../services/cart";
import type { CartDeatils } from "../types/cart.types";

export default function Cart() {
    const [cart, setCart] = useState<CartDeatils | null>(null);
    // const [product, setProducts] = useState<ProdcutDetails[] | null>(null);
    const [errors, setErrors] = useState("");

    useEffect(() => {
        cartService
            .getCartDeatils()
            .then((c) => setCart(c))
            .catch((e) => {
                setErrors(e.message);
            });
    }, []);

    if (errors) {
        return (
            <ErrorCmp
                value={errors}
                autoHide={false}
                className="alert-warning"
            />
        );
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
                    {cart?.products &&
                        cart?.products?.map((p) => (
                            <ProductCart
                                key={p._id}
                                imgUrl={p.img}
                                price={p.finalPrice}
                                quantity={p.stock}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}
