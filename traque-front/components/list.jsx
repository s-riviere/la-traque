export function List({array, children}) {
    // The elements of array have to be identified by a field id
    return (
        <div className='w-full h-full bg-gray-300 overflow-y-auto'>
            <ul className="w-full p-1 divide-y-4 divide-gray-300">
                {array.map((elem, i) => (
                    <li className="w-full" key={elem.id}>
                        {children(elem, i)}
                    </li>
                ))}
            </ul>
        </div>
    );
}
