import { useEffect, useState } from "react";
import { useParams } from "react-router";
import orderService from "../services/order";
import type { OrderHistory } from "../types/order.types";

export default function Order() {
    const { orderId } = useParams();
    const [order, setOrder] = useState<OrderHistory | null>();
    useEffect(() => {
        if (!orderId) return;
        orderService.getOrderDetails(orderId).then((order) => setOrder(order));
    }, [orderId]);
    console.log(order);
    return <>{order?.paymentMethod}</>;
}
