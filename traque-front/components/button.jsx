import { useTeamConnexion } from "@/context/teamConnexionContext";

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

export function LogoutButton() {
    const { logout } = useTeamConnexion();
    return <img src="/icons/logout.png" onClick={logout} className='w-12 h-12 bg-red-500 p-2 top-1 right-1 rounded-lg cursor-pointer bg-red fixed z-20' />
}
