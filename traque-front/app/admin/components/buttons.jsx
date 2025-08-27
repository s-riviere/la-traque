export function MapButton({ icon, title }) {
    return (
        <button title={title} className="w-16 h-16 bg-custom-light-blue rounded-full hover:bg-blue-500 transition flex items-center justify-center">
            <img src={`/icons/${icon}.png`} className="w-10 h-10" />
        </button>
    );
}

export function ControlButton({ icon, title }) {
    return (
        <button title={title} className="w-[4.5rem] h-[4.5rem] bg-custom-light-blue rounded-lg hover:bg-blue-500 transition flex items-center justify-center">
            <img src={`/icons/${icon}.png`} className="w-10 h-10" />
        </button>
    );
}
