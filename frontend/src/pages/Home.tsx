import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ErrorCmp, Loading, ProductCard } from "../components";
import productService from "../services/product/product";
import type { ProdcutDetails } from "../types/product.types";

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<ProdcutDetails[] | undefined>(
        undefined,
    );
    const [errors, setErrors] = useState("");
    useEffect(() => {
        productService
            .getProductsDetails()
            .then((p) => setProducts(p?.products))
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
                                imgUrl={product.imageUrls[0]}
                                originalPrice={product.originalPrice}
                                description={product.description}
                                finalPrice={product.finalPrice}
                                discountInPrice={product.discountInPrice}
                            />
                        </Link>
                    ))}
            </div>
        </div>
    );
}
