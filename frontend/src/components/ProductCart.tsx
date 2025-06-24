type ProductCartProps = {
    imgUrl: string;
    price: number;
    quantity: number;
};
export default function ProductCart({
    imgUrl,
    price,
    quantity,
}: ProductCartProps) {
    return (
        <div>
            <div>
                <img src={imgUrl} alt="" className="w-48" />
            </div>
            <div>
                <p>
                    {price} {quantity}
                </p>
            </div>
        </div>
    );
}
