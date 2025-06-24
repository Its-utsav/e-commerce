export interface SellerInfo {
    _id: string;
    username: string;
    avatarUrl: string;
}

export interface ProdcutDetails {
    _id: string;
    name: string;
    sellerId: string;
    imageUrls: string[];
    description: string;
    originalPrice: number;
    stock: number;
    discountInPercentage: number;
    createdAt: string; // 2025-05-11T12:04:05.318Z
    updatedAt: string; // 2025-05-12T11:20:36.091Z
    finalPrice: number;
    discountInPrice: number;
    sellerInfo: SellerInfo;
}
export interface AllProducts {
    totalProducts: number;
    limit: number;
    page: number;
    totalPages: number;
    pagingCounter: number | null;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: null | boolean;
    nextPage: null | boolean;
    products: ProdcutDetails[];
}
