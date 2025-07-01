type Props = {
    finalPrice: number;
    originalPrice: number;
    discountInPrice: number;
    discountInPercentage: number;
};
export default function Price(props: Props) {
    const { finalPrice, originalPrice, discountInPrice, discountInPercentage } =
        props;
    return (
        <div>
            {finalPrice !== originalPrice ? (
                <>
                    <span className="text-primary">₹ {finalPrice}</span>{" "}
                    <span className="text-slate-50 line-through">
                        ₹{originalPrice}
                    </span>{" "}
                    <p>
                        Discount
                        <span className="text-accent">
                            {" "}
                            ₹ {discountInPrice} % {discountInPercentage}
                        </span>
                    </p>
                </>
            ) : (
                <span>{finalPrice}</span>
            )}
        </div>
    );
}
