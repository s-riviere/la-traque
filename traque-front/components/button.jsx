export function CustomButton({ color, children, ...props }) {
    const colorClasses = {
        blue: 'bg-blue-600 hover:bg-blue-500',
        red: 'bg-red-600 hover:bg-red-500',
        green: 'bg-green-600 hover:bg-green-500',
        yellow: 'bg-yellow-600 hover:bg-yellow-500',
        purple: 'bg-purple-600 hover:bg-purple-500',
        gray: 'bg-gray-600 hover:bg-gray-500',
    };

    return (
        <button {...props} className={`${colorClasses[color]} text-lg ease-out duration-200 text-white w-full h-full p-4 shadow-sm rounded`}>
            {children}
        </button>
    );
}
