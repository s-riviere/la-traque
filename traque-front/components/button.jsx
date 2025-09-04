export function BlueButton({ children, ...props }) {
    return (<button {...props} className="bg-blue-600 hover:bg-blue-500 text-lg ease-out duration-200 text-white w-full h-full p-4 shadow-sm rounded">
        {children}
    </button>)
}

export function RedButton({ children, ...props }) {
    return (<button {...props} className="bg-red-600 hover:bg-red-500 text-lg ease-out duration-200 text-white w-full h-full p-4 shadow-sm rounded">
        {children}
    </button>)
}

export function GreenButton({ children, ...props }) {
    return (<button {...props} className="bg-green-600 hover:bg-green-500 text-lg ease-out duration-200 text-white w-full h-full p-4 shadow-sm rounded">
        {children}
    </button>)
}
