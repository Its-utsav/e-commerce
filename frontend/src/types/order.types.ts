export interface OrdersProducts {
    productId: string;
    quantity: number;
    price: number;
    _id: string;
}

export interface OrderHistory {
    paymentStatus: string;
    _id: string;
    userId: string;
    products: OrdersProducts[];
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface NewOrder {
    paymentMethod: string;
}

export interface PaymentResponse {
    message: string;
}
