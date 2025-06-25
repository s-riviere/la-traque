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

    function handleLeftClick(e) {
        if (!drawing) {
            setCenter(e.latlng);
            setRadius(null);
            setDrawing(true);
        } else {
            setDrawing(false);
            setArea({center, radius});
        }
    }

    function handleRightClick(e) {
        if (drawing) {
            setDrawing(false);
            setCenter(area?.center || null);
            setRadius(area?.radius || null);
        } else {
            setArea(null);
        }
    }

    function handleMouseMove(e) {
        if (drawing) {
            setRadius(e.latlng.distanceTo(center));
        }
    }

    return { center, radius, handleLeftClick, handleRightClick, handleMouseMove };
}
