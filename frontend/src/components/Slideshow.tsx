import { useEffect, useState } from "react";
import Button from "./Button";

type SlideshowProps = {
    imageUrls: string[];
};

export default function Slideshow({ imageUrls }: SlideshowProps) {
    const [url, setUrl] = useState(imageUrls[0]);
    const [count, setCount] = useState(0);

    useEffect(() => {
        setUrl(imageUrls[count]);
    }, [count]);

    const handleNextClick = () => {
        setCount((prevCount) => prevCount + 1);
    };

    const handlePrevClick = () => {
        setCount((prevCount) => prevCount - 1);
    };

    return (
        <div>
            {imageUrls.length > 1 ? (
                <div>
                    <img src={url} alt="" />
                    <Button
                        type="button"
                        onClick={handleNextClick}
                        disabled={count === imageUrls.length - 1}
                    >
                        Next
                    </Button>
                    <Button
                        type="button"
                        onClick={handlePrevClick}
                        disabled={count === 0}
                    >
                        Prev
                    </Button>
                </div>
            ) : (
                <img src={url} alt="" />
            )}
        </div>
    );
}
