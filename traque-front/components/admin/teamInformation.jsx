import useAdmin from "@/hook/useAdmin";
import { GameState } from '@/util/gameState';
import { useEffect, useState } from "react";
import { env } from 'next-runtime-env';

function DotLine({ label, value }) {
    return (
        <div className="flex items-center">
            <span className="whitespace-nowrap text-m">{label}</span>
            <span
                className="flex-1 mx-2 overflow-hidden whitespace-nowrap text-black font-bold select-none"
                aria-hidden="true"
            >
                {" . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "}
            </span>
            <span className="whitespace-nowrap text-m">{value}</span>
        </div>
    );
}

function IconValue({ color, icon, value }) {
    return (
        <div className="flex flex-row gap-2">
            <img src={`/icons/${color}${icon}.png`} className="w-6 h-6" />
            <p className={`text-custom-${color}`}>{value}</p>
        </div>
    );
}

const TEAM_STATUS = {
    playing:    { label: "En jeu",          color: "text-custom-green" },
    captured:   { label: "Capturée",        color: "text-custom-red" },
    outofzone:  { label: "Hors zone",       color: "text-custom-orange" },
    ready:      { label: "Placée",          color: "text-custom-green" },
    notready:   { label: "Non placée",      color: "text-custom-red" },
    waiting:    { label: "En attente",      color: "text-custom-grey" },
};

function getStatus(team, gamestate) {
    switch (gamestate) {
        case GameState.SETUP:
            return TEAM_STATUS.waiting;
        case GameState.PLACEMENT:
            return team.ready ? TEAM_STATUS.ready : TEAM_STATUS.notready;
        case GameState.PLAYING:
            return team.captured ? TEAM_STATUS.captured : team.outofzone ? TEAM_STATUS.outofzone : TEAM_STATUS.playing;
        case GameState.FINISHED:
            return team.captured ? TEAM_STATUS.captured : TEAM_STATUS.playing;
    }
}

export default function TeamInformation({ selectedTeamId, onClose }) {
    const { getTeam, getTeamName, startDate, gameState } = useAdmin();
    const [imgSrc, setImgSrc] = useState("");
    const team = getTeam(selectedTeamId);
    const NO_VALUE = "XX";
    const NEXT_PUBLIC_SOCKET_HOST = env("NEXT_PUBLIC_SOCKET_HOST");
    const SERVER_URL = (NEXT_PUBLIC_SOCKET_HOST == "localhost" ? "http://" : "https://") + NEXT_PUBLIC_SOCKET_HOST + "/back";

    useEffect(() => {
        setImgSrc(`${SERVER_URL}/photo/my?team=${selectedTeamId}&t=${Date.now()}`);
    }, [selectedTeamId]);

    if (!team) return null;

    function formatTime(startDate) {
        // startDate in milliseconds
        const date = team.captured ? team.finishDate : Date.now();
        if (date == null || startDate == null || startDate < 0) return NO_VALUE + ":" + NO_VALUE;
        const seconds = Math.floor((date - startDate) / 1000);
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    function formatDistance(distance) {
        // distance in meters
        if (distance == null || distance < 0) return NO_VALUE + "km";
        return `${Math.floor(distance / 100) / 10}km`;
    }

    function formatSpeed(distance, startDate) {
        // distance in meters | startDate in milliseconds
        const date = team.captured ? team.finishDate : Date.now();
        if (distance == null || distance < 0 || date == null || startDate == null || date <= startDate) return NO_VALUE + "km/h";
        const speed = distance / (date - startDate);
        return `${Math.floor(speed * 36000) / 10}km/h`;
    }

    function formatDate(date) {
        // date in milliseconds
        const dateNow = Date.now();
        if (date == null || dateNow <= date || dateNow - date >= 1_000_000) return NO_VALUE + "s";
        return `${Math.floor((dateNow - date) / 1000)}s`;
    }

    return (
        <div className="relative p-3 w-3/12 h-full flex flex-col gap-3">
            <button className="absolute left-2 -top-1 text-black text-5xl" onClick={onClose} title="Fermer">x</button>
            <p className={`text-2xl font-bold text-center ${getStatus(team, gameState).color} font-bold`}>{getStatus(team, gameState).label}</p>
            <p className="text-4xl font-bold text-center">{team.name ?? NO_VALUE}</p>
            <div className="flex justify-center">
                <img src={imgSrc ? imgSrc : "/images/missing_image.jpg"} alt="Photo de l'équipe"/>
            </div>
            <div className="flex flex-row justify-between items-center">
                <IconValue color={team.sockets.length > 0 ? "green" : "red"} icon="dude" value={team.sockets.length ?? NO_VALUE} />
                <IconValue color={team.battery >= 20 ? "green" : "red"} icon="battery" value={(team.battery ?? NO_VALUE) + "%"} />
                <IconValue
                    color={team.lastCurrentLocationDate != null && (Date.now() - team.lastCurrentLocationDate <= 30000) ? "green" : "red"}
                    icon="location" value={formatDate(team.lastCurrentLocationDate)}
                />
            </div>
            <div>
                <DotLine label="ID d'équipe" value={String(team.id).padStart(6, '0').replace(/(\d{3})(\d{3})/, "$1 $2")} />
                <DotLine label="ID de capture" value={String(team.captureCode).padStart(4, '0')} />
            </div>
            <div>
                <DotLine label="Chasse" value={getTeamName(team.chasing) ?? NO_VALUE} />
                <DotLine label="Chassé par" value={getTeamName(team.chased) ?? NO_VALUE} />
            </div>
            <div>
                <DotLine label="Distance" value={formatDistance(team.distance)} />
                <DotLine label="Temps de survie" value={formatTime(startDate)} />
                <DotLine label="Vitesse moyenne" value={formatSpeed(team.distance, startDate)} />
                <DotLine label="Captures" value={team.nCaptures ?? NO_VALUE} />
                <DotLine label="Observations" value={team.nSentLocation ?? NO_VALUE} />
                <DotLine label="Observé" value={team.nObserved ?? NO_VALUE} />
            </div>
            <div>
                <DotLine label="Modèle" value={team.phoneModel ?? NO_VALUE} />
                <DotLine label="Nom" value={team.phoneName ?? NO_VALUE} />
            </div>
        </div>
    );
}
