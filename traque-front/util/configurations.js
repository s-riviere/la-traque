import { ZoneTypes } from "./types";

export const mapLocations = {
    paris: [48.86, 2.33]
}

export const mapZooms = {
    low: 4,
    high: 15,
}

export const mapStyles = {
    default: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: 'Tiles &copy; Esri'
    },
}

export const defaultZoneSettings = {
    circle: {type: ZoneTypes.CIRCLE, min: null, max: null, reductionCount: 4, duration: 10},
    polygon: {type: ZoneTypes.POLYGON, polygons: []}
}

export const teamStatus = {
    playing:    { label: "En jeu",          color: "text-custom-green"  },
    captured:   { label: "Capturée",        color: "text-custom-red"    },
    outofzone:  { label: "Hors zone",       color: "text-custom-orange" },
    ready:      { label: "Placée",          color: "text-custom-green"  },
    notready:   { label: "Non placée",      color: "text-custom-red"    },
    waiting:    { label: "En attente",      color: "text-custom-grey"   },
}
