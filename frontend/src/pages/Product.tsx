import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ErrorCmp, Loading } from "../components";
import { Product as ProductComponent } from "../components/index";
import productService from "../services/product/product";
import type { ProdcutDetails } from "../types/product.types";

export default function Product() {
  const { productId } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<null | ProdcutDetails>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (productId) {
          const res = await productService.getProductDetails(productId);
          res ? setProduct(res) : null;
        }
      } catch (error) {
        if (error instanceof Error) setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);
  if (error) {
    return <ErrorCmp value={error} />;
  }
  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        product && <ProductComponent product={product} />
      )}
    </div>
  );
}
