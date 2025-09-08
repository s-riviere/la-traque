"use client";
import { useEffect, useState } from "react";

export default function useMapCircleDraw(circle, setCircle) {
    const [drawingCircle, setDrawingCircle] = useState(null);

    useEffect(() => {
        setDrawingCircle(null);
    }, [circle]);

    function handleLeftClick(e) {
        if (drawingCircle) {
            setCircle(drawingCircle);
            setDrawingCircle(null);
        } else {
            setDrawingCircle({center: e.latlng, radius: 0});
        }
    }

    function handleRightClick(e) {
        if (drawingCircle) {
            setDrawingCircle(null);
        } else if (e.latlng.distanceTo(circle.center) < circle.radius) {
            setCircle(null);
        }
    }

    function handleMouseMove(e) {
        if (drawingCircle) {
            setDrawingCircle({center: drawingCircle.center, radius: e.latlng.distanceTo(drawingCircle.center)});
        }
    }

    return { drawingCircle, handleLeftClick, handleRightClick, handleMouseMove };
}
