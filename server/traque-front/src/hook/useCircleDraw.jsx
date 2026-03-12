"use client";
import { useState } from "react";

export default function useMapCircleDraw(circle, setCircle) {
    const [drawingCircle, setDrawingCircle] = useState(null);
    const [prevCircle, setPrevCircle] = useState(circle);

    if (circle !== prevCircle) {
        setPrevCircle(circle);
        setDrawingCircle(null);
    }

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
