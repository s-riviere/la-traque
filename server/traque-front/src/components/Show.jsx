export const Show = ({ when, children }) => {
    return when ? children : null;
};
