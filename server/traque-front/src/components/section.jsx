export function Section({ title = null, outerClassName = "", innerClassName = "", children = null }) {
    return (
        <div className={outerClassName}>
            <div className='w-full h-full flex flex-col shadow-2xl'>
                {title &&
                    <div className='w-full p-1 bg-custom-light-blue text-center'>
                        <h2 className="text-l">{title}</h2>
                    </div>
                }
                <div className='w-full flex-1 min-h-0 p-3 bg-white'>
                    <div className={`w-full h-full ${innerClassName}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
