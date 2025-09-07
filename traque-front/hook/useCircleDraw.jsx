"use client";
import { useEffect, useState } from "react";

export default function useMapCircleDraw(circle, setCircle) {
    const [drawing, setDrawing] = useState(false);
    const [center, setCenter] = useState(circle?.center || null);
    const [radius, setRadius] = useState(circle?.radius || null);

    useEffect(() => {
        setDrawing(false);
        setCenter(circle?.center || null);
        setRadius(circle?.radius || null);
    }, [circle])

    function handleLeftClick(e) {
        if (!drawing) {
            setCenter(e.latlng);
            setRadius(null);
            setDrawing(true);
        } else {
            setDrawing(false);
            setCircle({center, radius});
        }
    }

    function handleRightClick(e) {
        if (drawing) {
            setDrawing(false);
            setCenter(circle?.center || null);
            setRadius(circle?.radius || null);
        } else {
            setCircle(null);
        }
    }

    function handleMouseMove(e) {
        if (drawing) {
            setRadius(e.latlng.distanceTo(center));
        }
    }

    return { center, radius, handleLeftClick, handleRightClick, handleMouseMove };
}
