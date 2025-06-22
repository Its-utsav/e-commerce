import type { ProdcutDetails } from "../types/product.types";

type ProductProps = {
  product: ProdcutDetails;
};
export default function Product(props: ProductProps) {
  const { name, imageUrls } = props.product;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <h1>{name}</h1>
        <div className="h-4 bg-red-200">
          <img src={imageUrls[0]} alt="" />
        </div>
        <div className="h-full bg-red-200"></div>
      </div>
    </div>
  );
}
