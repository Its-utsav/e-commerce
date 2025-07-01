type SlideshowProps = {
    imageUrls: string[] | string;
};

export default function Slideshow({ imageUrls }: SlideshowProps) {
    return (
        <div className="carousel h-3/3 max-w-md carousel-center space-x-4 rounded-box bg-neutral p-4">
            {Array.isArray(imageUrls) ? (
                imageUrls.map((img) => (
                    <div className="carousel-item" key={img}>
                        <img src={img} className="rounded-box" />
                    </div>
                ))
            ) : (
                <div className="carousel-item">
                    <img src={imageUrls} className="rounded-box" />
                </div>
            )}
        </div>
    );
}
