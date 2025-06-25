"use client";
import { useEffect, useState } from "react";

export default function useMapCircleDraw(area, setArea) {
    const [drawing, setDrawing] = useState(false);
    const [center, setCenter] = useState(area?.center || null);
    const [radius, setRadius] = useState(area?.radius || null);

    useEffect(() => {
        setDrawing(false);
        setCenter(area?.center || null);
        setRadius(area?.radius || null);
    }, [area])

    function handleClick(e) {
        if (!drawing) {
            setCenter(e.latlng);
            setRadius(null);
            setDrawing(true);
        } else {
            setDrawing(false);
            setArea({center, radius});
        }
    }

    function handleMouseMove(e) {
        if (drawing) {
            setRadius(e.latlng.distanceTo(center));
        }
    }

    return { handleClick, handleMouseMove, center, radius };
}
