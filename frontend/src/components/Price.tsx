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
        <p>
            {finalPrice !== originalPrice ? (
                <>
                    {finalPrice}
                    <span className="line-through">{originalPrice}</span>{" "}
                    <span>
                        Discount {discountInPrice} % {discountInPercentage}
                    </span>
                </>
            ) : (
                <span>{finalPrice}</span>
            )}
        </p>
    );
}
