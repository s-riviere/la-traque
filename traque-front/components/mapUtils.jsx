import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export function MapPan(props) {
    const map = useMap();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized && props.center) {
            map.flyTo(props.center, props.zoom, { animate: false });
            setInitialized(true)
        }
    }, [props.center]);

    return null;
}

export function MapEventListener({ onLeftClick, onRightClick, onMouseMove }) {
    const map = useMap();

    // Handle the mouse click left
    useEffect(() => {
        let moved = false;
        let downButton = null;

        const handleMouseDown = (e) => {
            moved = false;
            downButton = e.originalEvent.button;
        };

        const handleMouseMove = () => {
            moved = true;
        };

        const handleMouseUp = (e) => {
            if (!moved) {
                if (downButton == 0) {
                    onLeftClick(e);
                }
            }
            downButton = null;
        };

        map.on('mousedown', handleMouseDown);
        map.on('mousemove', handleMouseMove);
        map.on('mouseup', handleMouseUp);

        return () => {
            map.off('mousedown', handleMouseDown);
            map.off('mousemove', handleMouseMove);
            map.off('mouseup', handleMouseUp);
        };
    }, [onLeftClick, onRightClick]);

    // Handle the right click
    useEffect(() => {

        const handleMouseDown = (e) => {
            if (e.originalEvent.button == 2) {
                onRightClick(e);
            }
        };

        map.on('mousedown', handleMouseDown);

        return () => {
            map.off('mousedown', handleMouseDown);
        }
    }, [onRightClick]);

    // Handle the mouse move
    useEffect(() => {
        map.on('mousemove', onMouseMove);

        return () => {
            map.off('mousemove', onMouseMove);
        }
    }, [onMouseMove]);
    
    // Prevent right click context menu
    useEffect(() => {
        const container = map.getContainer();
        const preventContextMenu = (e) => e.preventDefault();
        container.addEventListener('contextmenu', preventContextMenu);
        return () => container.removeEventListener('contextmenu', preventContextMenu);
    }, []);
}
