import { useEffect, useState } from "react";
import productService from "../services/product/product";
import type { ProdcutDetails } from "../types/product.types";

export default function Home() {
  const [products, setProducts] = useState<ProdcutDetails[] | null>(null);

  useEffect(() => {
    productService.getProductsDetails().then((p) => setProducts(p));
  }, []);

  return <div>Home</div>;
}
