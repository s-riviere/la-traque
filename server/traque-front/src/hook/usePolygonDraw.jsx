"use client";
import { useState } from "react";
import { useMap } from "react-leaflet";

export default function useMapPolygonDraw(polygons, addPolygon, removePolygon) {
    const map = useMap();
    const nodeCatchDistance = 30; // px
    const nodeHighlightDistance = 30; // px
    const [currentPolygon, setCurrentPolygon] = useState([]);
    const [highlightNodes, setHighlightNodes] = useState([]);
    const [prevPolygons, setPrevPolygons] = useState([]);

    if (polygons != prevPolygons) {
        setPrevPolygons(polygons);
        setCurrentPolygon([]);
        setHighlightNodes([]);
    }

    function latlngEqual(latlng1, latlng2, epsilon = 1e-9) {
        return Math.abs(latlng1.lat - latlng2.lat) < epsilon && Math.abs(latlng1.lng - latlng2.lng) < epsilon;
    }

    function layerDistance(latlng1, latlng2) {
        // Return the pixel distance between latlng1 and latlng2 as they appear on the map
        const {x: x1, y: y1} = map.latLngToLayerPoint(latlng1);
        const {x: x2, y: y2} = map.latLngToLayerPoint(latlng2);
        return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
    }

    function isDrawing() {
        return currentPolygon.length > 0;
    }

    function areSegmentsIntersecting(p1, p2, p3, p4) {
        // Return true if the segments (p1, p2) and (p3, p4) are strictly intersecting, else false
        const direction = (a, b, c) => {
            return (c.lng - a.lng) * (b.lat - a.lat) - (b.lng - a.lng) * (c.lat - a.lat);
        };

        const d1 = direction(p3, p4, p1);
        const d2 = direction(p3, p4, p2);
        const d3 = direction(p1, p2, p3);
        const d4 = direction(p1, p2, p4);

        return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
    }

    function isIntersecting(segment, pointArray, isPolygon) {
        // Return true if segment intersects one of the pointArray segments according to areSegmentsIntersecting
        // Moreover if isPolygon, then it verifies if segment intersects the segment closing pointArray
        const length = pointArray.length;

        for (let i = 0; i < length-1; i++) {
            if (areSegmentsIntersecting(segment[0], segment[1], pointArray[i], pointArray[i+1])) {
                return true;
            }
        }

        if (isPolygon && length > 2) {
            return areSegmentsIntersecting(segment[0], segment[1], pointArray[length-1], pointArray[0]);
        } else {
            return false;
        }
    }

    function isInPolygon(latlng, polygon) {
        // Return true if latlng is strictly inside polygon
        // Return false if latlng is outside polygon or on a vertex of the polygon
        // Return true or false if latlng is on the border
        if (latlngEqual(latlng, polygon[0])) return false;

        const length = polygon.length;
        const {lat: x, lng: y} = latlng;
        let inside = false;

        for (let i = 0, j = length - 1; i < length; j = i++) {
            if (latlngEqual(latlng, polygon[j])) return false;

            const {lat: xi, lng: yi} = polygon[i];
            const {lat: xj, lng: yj} = polygon[j];
            const intersects = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

            if (intersects) inside = !inside;
        }

        return inside;
    }

    function isClockwise(points) {
        // Return true if the tab describes a clockwise polygon (Shoelace formula)
        let sum = 0;
        for (let i = 0; i < points.length; i++) {
            const curr = points[i];
            const next = points[(i + 1) % points.length];
            sum += (next.lng - curr.lng) * (next.lat + curr.lat);
        }
        return sum > 0;
    };
    
    function getPolygonIndex(latlng) {
        // Return the index of the polygon where latlng is according to isInPolygon
        return polygons.findIndex(polygon => isInPolygon(latlng, polygon));
    }

    function getEventLatLng(e) {
        // Return the closest latlng to e.latlng among the existing nodes including the first node of currentPolygon
        // If the closest distance is superior to nodeCatchDistance, then e.latlng is returned
        const closeNodes = [];
        // Existing nodes
        for (const polygon of polygons) {
            for (const node of polygon) {
                const d = layerDistance(e.latlng, node);
                if (d < nodeCatchDistance) {
                    closeNodes.push([d, node]);
                }
            }
        }
        // First node of currentPolygon
        if (isDrawing()) {
            const d = layerDistance(e.latlng, currentPolygon[0]);
            if (d < nodeCatchDistance) {
                closeNodes.push([d, currentPolygon[0]]);
            }
        }
        // If there is no close node
        if (closeNodes.length == 0) {
            return e.latlng;
        // Else return the closest close node
        } else {
            return closeNodes.reduce((min, current) => current[0] < min[0] ? current : min)[1];
        }
    }

    function handleLeftClick(e) {
        setHighlightNodes([]);
        const latlng = getEventLatLng(e);
        const length = currentPolygon.length;

        // If it is the first node
        if (!isDrawing()) {
            // If the point is not in an existing polygon
            if (getPolygonIndex(latlng) == -1) {
                setCurrentPolygon([latlng]);
            }

        // If it is the last node
        } else if (latlngEqual(latlng, currentPolygon[0])) {
            // If the current polygon is a polygon (at least 3 points)
            if (length >= 3) {
                // If the current polygon is not circling an existing polygon
                for (const polygon of polygons) {
                    // meanPoint exists and is strictly inside polygon
                    const meanPoint = {
                        lat: (polygon[0].lat + polygon[1].lat + polygon[2].lat) / 3,
                        lng: (polygon[0].lng + polygon[1].lng + polygon[2].lng) / 3
                    };
                    if (isInPolygon(meanPoint, currentPolygon)) return;
                }
                // Making the new polygon clockwise to simplify some algorithms
                if (!isClockwise(currentPolygon)) currentPolygon.reverse();
                addPolygon(currentPolygon);
                setCurrentPolygon([]);
            }

        // If it is an intermediate node
        } else {
            // Is the polygon closing to early ?
            for (const point of currentPolygon) if (latlngEqual(point, latlng)) return;
            // Is the new point making the current polygon intersect with itself ?
            if (isIntersecting([latlng, currentPolygon[length-1]], currentPolygon, false)) return;
            // Is the new point inside a polygon ?
            if (getPolygonIndex(latlng) != -1) return;
            // Is the new point making the current polygon intersect with another polygon ?
            for (const polygon of polygons) {
                // Strict intersection
                if (isIntersecting([latlng, currentPolygon[length-1]], polygon, true)) return;
                // Intersection by joining two non adjacent nodes of polygon
                let tab = [-1, -1];
                for (let i = 0; i < polygon.length; i++) {
                    if (latlngEqual(latlng, polygon[i])) tab[0] = i;
                    if (latlngEqual(currentPolygon[length-1], polygon[i])) tab[1] = i;
                }
                if (
                    tab[0] != -1 && tab[1] != -1 &&
                    (tab[0] != (tab[1] + 1) % polygon.length) &&
                    (tab[1] != (tab[0] + 1) % polygon.length)
                ) return;
            }
            setCurrentPolygon([...currentPolygon, latlng]);
        }
    }

    function handleRightClick(e) {
        setHighlightNodes([]);
        // If isDrawing, cancel the currentPolygon
        if (isDrawing()) {
            setCurrentPolygon([]);
        // If not isDrawing, remove the clicked polygon
        } else {
            const i = getPolygonIndex(e.latlng);
            if (i != -1) removePolygon(i);
        }
    }

    function handleMouseMove(e) {
        const nodes = [];
        for (const polygon of polygons) {
            for (const node of polygon) {
                if (layerDistance(node, e.latlng) < nodeHighlightDistance && node != currentPolygon[0]) nodes.push(node);
            }
        }
        setHighlightNodes(nodes);
    }

    return { currentPolygon, highlightNodes, handleLeftClick, handleRightClick, handleMouseMove };
}
