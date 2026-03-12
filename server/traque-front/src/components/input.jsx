export function NumberInput({onChange, ...props}) {
    function customStringToInt(e) {
        return parseInt(e, 10) || null;
    }

    return (
        <input className="w-12 h-10 text-center rounded ring-1 ring-inset ring-black placeholder:text-gray-400" onChange={(e) => onChange(customStringToInt(e.target.value))} {...props} />
    );
}
