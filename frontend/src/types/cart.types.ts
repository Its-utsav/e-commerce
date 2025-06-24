export interface CartProduct {
    productId: string;
    quantity: number;
}

export interface CartDeatils {
    _id: string;
    amount: number;
    userId: string;
    products: CartProduct[];
    totalItems: number;
    createdAt: string; //"2025-05-12T07:57:24.483Z"
    updatedAt: string; // "2025-06-21T15:04:21.945Z"
}
