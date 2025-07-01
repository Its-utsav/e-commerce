export default function Loading() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <span className="loading loading-xs loading-dots"></span>
            <span className="loading loading-sm loading-dots"></span>
            <span className="loading loading-md loading-dots"></span>
            <span className="loading loading-lg loading-dots"></span>
            <span className="loading loading-xl loading-dots"></span>
        </div>
    );
}
