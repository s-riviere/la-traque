"use client";

export default function useMultipleCircleDraw(circles, addCircle, removeCircle, radius) {

    function getDistanceFromLatLon({ lat: lat1, lng: lon1 }, { lat: lat2, lng: lon2 }) {
        const degToRad = (deg) => deg * (Math.PI / 180);
        var R = 6371; // Radius of the earth in km
        var dLat = degToRad(lat2 - lat1);
        var dLon = degToRad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d * 1000;
    }

    function isBaddlyPlaced(latlng) {
        return circles.some(circle => getDistanceFromLatLon(latlng, circle.center) < 2 * circle.radius);
    }

    function getCircleFromLatlng(latlng) {
        return circles.find(circle => getDistanceFromLatLon(latlng, circle.center) < circle.radius);
    }

    function handleLeftClick(e) {
        if (isBaddlyPlaced(e.latlng)) return;
        addCircle(e.latlng, radius);
    }

    function handleRightClick(e) {
        const circle = getCircleFromLatlng(e.latlng);
        if (circle) removeCircle(circle.id);
    }

    return { handleLeftClick, handleRightClick };
}
