import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
    ErrorCmp,
    Loading,
    Pagination as PaginationComp,
    ProductCard,
} from "../components";
import productService from "../services/product";
import type { ProdcutDetails, Pagination } from "../types/product.types";

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<ProdcutDetails[] | undefined>(
        undefined,
    );
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [errors, setErrors] = useState("");
    useEffect(() => {
        productService
            .getProductsDetails()
            .then((p) => {
                setProducts(p?.products);
                setPagination({
                    totalProducts: p?.totalProducts!,
                    limit: p?.limit!,
                    page: p?.page!,
                    totalPages: p?.totalPages!,
                    pagingCounter: p?.pagingCounter!,
                    hasPrevPage: p?.hasPrevPage!,
                    hasNextPage: p?.hasNextPage!,
                    prevPage: p?.prevPage!,
                    nextPage: p?.nextPage!,
                });
            })
            .catch((e) => {
                setErrors(e.message);
            })
            .finally(() => setLoading(false));
    }, []);

    if (errors) {
        return <ErrorCmp value={errors} />;
    }

    return (
        <div>
            {loading && <Loading />}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products &&
                    products.map((product) => (
                        <Link to={`products/${product._id}`} key={product.name}>
                            <ProductCard
                                name={product.name}
                                imgUrl={
                                    product.imageUrls[0]
                                        ? product.imageUrls[0]
                                        : "./no-image.png"
                                }
                                originalPrice={product.originalPrice}
                                description={product.description}
                                finalPrice={product.finalPrice}
                                discountInPrice={product.discountInPrice}
                                discountInPercentage={
                                    product.discountInPercentage
                                }
                            />
                        </Link>
                    ))}
            </div>
            <div className="my-2 flex items-center justify-center">
                {
                    // TODO - fix pagination
                }
                <PaginationComp />
            </div>
        </div>
    );
}
