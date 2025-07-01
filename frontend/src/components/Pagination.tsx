export default function Pagination() {
    return (
        <div className="join">
            <input
                className="btn join-item btn-square"
                type="radio"
                name="options"
                aria-label="1"
                checked={true}
            />
            <input
                className="btn join-item btn-square"
                type="radio"
                name="options"
                aria-label="2"
            />
            <input
                className="btn join-item btn-square"
                type="radio"
                name="options"
                aria-label="3"
            />
            <input
                className="btn join-item btn-square"
                type="radio"
                name="options"
                aria-label="4"
            />
        </div>
    );
}
