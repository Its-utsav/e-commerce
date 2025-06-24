import type { ProdcutDetails } from "../types/product.types";
import Button from "./Button";
import SellerInfo from "./SellerInfo";
import Slideshow from "./Slideshow";

type ProductProps = {
    product: ProdcutDetails;
};

export default function Product(props: ProductProps) {
    const {
        name,
        imageUrls,
        finalPrice,
        originalPrice,
        discountInPrice,
        sellerInfo,
    } = props.product;

    return (
        <div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {/* <h1>{name}</h1> */}
                <div className="bg-red-200">
                    <Slideshow imageUrls={imageUrls} />
                </div>
                <div className="h-full bg-red-200">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div>
                            <Button disabled>Add To cart</Button>
                            <SellerInfo
                                avatarUrl={sellerInfo.avatarUrl}
                                name={sellerInfo.username}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-span-full">
                    <h1>{name}</h1>
                    <p>
                        {finalPrice !== originalPrice ? (
                            <>
                                {finalPrice}
                                <span className="line-through">
                                    {originalPrice}
                                </span>{" "}
                                <span>Discount {discountInPrice}</span>
                            </>
                        ) : (
                            <span>{finalPrice}</span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
