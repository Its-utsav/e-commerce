import Price from "./Price";

type ProductCartProps = {
    imgUrl: string;
    originalPrice: number;
    finalPrice: number;
    description: string;
    name: string;
    discountInPrice: number;
    discountInPercentage: number;
};

export default function ProductCard(props: ProductCartProps) {
    const {
        imgUrl,
        name,
        finalPrice,
        originalPrice,
        discountInPrice,
        description,
        discountInPercentage,
    } = props;
    return (
        <div className="card-border card h-[400px] bg-base-100 p-2 shadow-sm">
            <figure>
                <img src={imgUrl} alt={name} />
            </figure>
            <div className="card-body">
                <h2 className="card-title">{name}</h2>
                <p>{description}</p>
                {/* <div className="card-actions justify-end">
                    <button className="btn btn-primary">Add to Cart</button>
                </div> */}
            </div>
            <Price
                finalPrice={finalPrice}
                originalPrice={originalPrice}
                discountInPercentage={discountInPercentage}
                discountInPrice={discountInPrice}
                key={name}
            />
        </div>
    );
}
