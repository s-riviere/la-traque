"use client";

export default function useMultipleCircleDraw(circles, addCircle, removeCircle, radius) {

    function isBaddlyPlaced(latlng) {
        return circles.some(circle => latlng.distanceTo(circle.center) < 2 * circle.radius);
    }

    function getCircleFromLatlng(latlng) {
        return circles.find(circle => latlng.distanceTo(circle.center) < circle.radius);
    }

    function handleLeftClick(e) {
        if (!isBaddlyPlaced(e.latlng)) addCircle(e.latlng, radius);
    }

    function handleRightClick(e) {
        const circle = getCircleFromLatlng(e.latlng);
        if (circle) removeCircle(circle.id);
    }

    return { handleLeftClick, handleRightClick };
}
