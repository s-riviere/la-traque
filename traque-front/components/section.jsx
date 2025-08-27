export function Section({title, className, children}) {
    return (
        <div className={className}>
            <div className='w-full h-full flex flex-col shadow-2xl'>
                <div className='w-full p-1 bg-custom-light-blue text-center'>
                    <h2 className="text-l">{title}</h2>
                </div>
                <div className='w-full h-full p-3 bg-white'>
                    {children}
                </div>
            </div>
        </div>
    );
}
