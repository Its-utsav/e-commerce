import type { ProdcutDetails } from "../types/product.types";
import Button from "./Button";
import Price from "./Price";
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
        discountInPercentage,
    } = props.product;

    return (
        <div className="grid">
            <Slideshow imageUrls={imageUrls ? imageUrls : "no-image.png"} />

            <div className="">
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
                <Price
                    finalPrice={finalPrice}
                    originalPrice={originalPrice}
                    discountInPrice={discountInPrice}
                    discountInPercentage={discountInPercentage}
                />
            </div>
        </div>
    );
}
