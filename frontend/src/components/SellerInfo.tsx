type SellerInfoProps = {
    name: string;
    avatarUrl: string;
};
export default function SellerInfo({ name, avatarUrl }: SellerInfoProps) {
    return (
        <div>
            <div>
                <h1 className="text-center">{name}</h1>
                <img src={avatarUrl} alt={name} />
            </div>
        </div>
    );
}
