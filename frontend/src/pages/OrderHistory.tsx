import { useEffect, useState } from "react";
import authservice from "../services/auth";
import type { OrderHistory } from "../types/order.types";
import { Link } from "react-router";

export default function OrderHistory() {
    const [orders, setOrders] = useState<null | OrderHistory[]>();
    useEffect(() => {
        authservice.getOrderHistory().then((order) => setOrders(order));
    }, []);
    console.log(orders);
    /*
    {
            "paymentStatus": "PENDING",
            "_id": "6821d8366ce40bfd8c5d1658",
            "userId": "68208967a182deca7a9af76f",
            "products": [
                {
                    "productId": "682092351b64c8c7f29f937a",
                    "quantity": 4,
                    "price": 200,
                    "_id": "6821d8366ce40bfd8c5d1659"
                },
                {
                    "productId": "6821cffe7586604d58a457ca",
                    "quantity": 1,
                    "price": 200,
                    "_id": "6821d8366ce40bfd8c5d165a"
                }
            ],
            "amount": 1000,
            "paymentMethod": "UPI",
            "status": "CANCELLED",
            "createdAt": "2025-05-12T11:15:02.848Z",
            "updatedAt": "2025-05-12T11:20:36.507Z",
            "__v": 0
        },
    */
    return (
        <div>
            <div>
                <div>
                    {orders?.map((order) => {
                        return (
                            <Link to={`/${order._id}`} key={order._id}>
                                <div className="">
                                    <div> Order status {order.status}</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
