type SellerInfoProps = {
  name: string;
  avatarUrl: string;
};
export default function SellerInfo({ name, avatarUrl }: SellerInfoProps) {
  return (
    <div>
      <div>
        <h1>{name}</h1>
        <img src={avatarUrl} alt={name} />
      </div>
    </div>
  );
}
