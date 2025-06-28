export interface CartProduct {
    _id: string;
    name: string;
    description: string;
    originalPrice: number;
    stock: number;
    discountInPercentage: number;
    discountInPrice: number;
    finalPrice: number;
    quantity: number;
}

export interface CartDeatils {
    _id: string;
    amount: number;
    userId: string;
    products: CartProduct[];
    totalItems: number;
    createdAt: Date; //"2025-05-12T07:57:24.483Z"
    updatedAt: Date; // "2025-06-21T15:04:21.945Z"
}

export interface ProductsIdAndQty {
    productId: string;
    quantity: number;
}
export interface NewProductInCart extends Omit<CartDeatils, "products"> {
    products: ProductsIdAndQty[];
}

export interface removeProductFromCart extends Omit<CartDeatils, "products"> {
    products: ProductsIdAndQty[];
}
