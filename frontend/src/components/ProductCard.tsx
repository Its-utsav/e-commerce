type ProductCartProps = {
  imgUrl: string;
  originalPrice: number;
  finalPrice: number;
  description: string;
  name: string;
  discountInPrice: number;
};

export default function ProductCard(props: ProductCartProps) {
  const {
    imgUrl,
    name,
    finalPrice,
    originalPrice,
    discountInPrice,
    description,
  } = props;
  return (
    <div className="border-2">
      <div>
        <div>
          <img src={imgUrl} alt={name} className="rounded-md" />
        </div>
        <div>
          <p>
            {finalPrice !== originalPrice ? (
              <>
                {finalPrice}
                <span className="line-through">{originalPrice}</span>{" "}
                <span>Discount {discountInPrice}</span>
              </>
            ) : (
              <span>{finalPrice}</span>
            )}
          </p>
        </div>
        <p>{description}</p>
      </div>
    </div>
  );
}
