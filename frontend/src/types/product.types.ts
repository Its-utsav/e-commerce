export interface SellerInfo {
    _id: string;
    username: string;
    avatarUrl: string;
}

export interface ProdcutDetails {
    _id: string;
    name: string;
    sellerId: string;
    imageUrls: string[] | string;
    description: string;
    originalPrice: number;
    stock: number;
    discountInPercentage: number;
    createdAt: Date; // 2025-05-11T12:04:05.318Z
    updatedAt: Date; // 2025-05-12T11:20:36.091Z
    finalPrice: number;
    discountInPrice: number;
    sellerInfo: SellerInfo;
}
export interface Pagination {
    totalProducts: number;
    limit: number;
    page: number;
    totalPages: number;
    pagingCounter: number | null;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: null | boolean;
    nextPage: null | boolean;
}

export interface AllProducts extends Pagination {
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
