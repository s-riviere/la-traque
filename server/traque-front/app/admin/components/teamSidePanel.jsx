import { env } from 'next-runtime-env';
import { useEffect, useState } from "react";
import useAdmin from "@/hook/useAdmin";
import { getStatus } from '@/util/functions';
import { Colors, GameState } from '@/util/types';

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
            <img src={`/icons/${icon}/${color}.png`} className="w-6 h-6" />
            <p style={{color: Colors[color]}}>{value}</p>
        </div>
    );
}

export default function TeamSidePanel({ selectedTeamId, onClose }) {
    const { getTeam, gameState } = useAdmin();
    const [imgSrc, setImgSrc] = useState("");
    const [_, setRefreshKey] = useState(0);
    const team = getTeam(selectedTeamId);
    const NO_VALUE = "XX";
    const NEXT_PUBLIC_SOCKET_HOST = env("NEXT_PUBLIC_SOCKET_HOST");
    const SERVER_URL = (NEXT_PUBLIC_SOCKET_HOST == "localhost" ? "http://" : "https://") + NEXT_PUBLIC_SOCKET_HOST + "/back";

    useEffect(() => {
        setImgSrc(`${SERVER_URL}/photo/my?team=${selectedTeamId}&t=${Date.now()}`);
    }, [selectedTeamId]);

    if (!team) return null;

    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshKey(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    function formatTime(startDate, endDate) {
        // startDate in milliseconds
        if (endDate == null || startDate == null || startDate < 0) return NO_VALUE + ":" + NO_VALUE;
        const seconds = Math.floor((endDate - startDate) / 1000);
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    function formatDistance(distance) {
        // distance in meters
        if (distance == null || distance < 0) return NO_VALUE + "km";
        return `${Math.floor(distance / 100) / 10}km`;
    }

    function formatSpeed(distance, startDate, endDate) {
        // distance in meters | startDate in milliseconds
        if (distance == null || distance < 0 || endDate == null || startDate == null || endDate <= startDate) return NO_VALUE + "km/h";
        const speed = distance / (endDate - startDate);
        return `${Math.floor(speed * 36000) / 10}km/h`;
    }

    function formatDate(date) {
        // date in milliseconds
        const dateNow = Date.now();
        if (date == null || dateNow <= date || dateNow - date >= 1_000_000) return NO_VALUE + "s";
        return `${Math.floor((dateNow - date) / 1000)}s`;
    }

    return (
        <div className="w-full h-full relative flex flex-col p-3 gap-3">
            <button className="absolute left-2 -top-1 text-black text-5xl" onClick={onClose} title="Fermer">x</button>
            <p className="text-2xl font-bold text-center" style={{color: getStatus(team, gameState).color}}>{getStatus(team, gameState).label}</p>
            <p className="text-4xl font-bold text-center">{team.name ?? NO_VALUE}</p>
            <div className="flex justify-center">
                <img src={imgSrc ? imgSrc : "/images/missing_image.jpg"} alt="Photo de l'équipe"/>
            </div>
            <div className="flex flex-row justify-between items-center">
                <IconValue color={team.sockets.length > 0 ? "green" : "red"} icon="user" value={team.sockets?.length ?? NO_VALUE} />
                <IconValue color={team.battery >= 20 ? "green" : "red"} icon="battery" value={(team.battery ?? NO_VALUE) + "%"} />
                <IconValue
                    color={team.lastCurrentLocationDate && (Date.now() - team.lastCurrentLocationDate <= 30000) ? "green" : "red"}
                    icon="location" value={formatDate(team.lastCurrentLocationDate)}
                />
            </div>
            <div>
                <DotLine label="ID d'équipe" value={String(selectedTeamId).padStart(6, '0').replace(/(\d{3})(\d{3})/, "$1 $2")} />
                <DotLine label="ID de capture" value={team.captureCode ? String(team.captureCode).padStart(4, '0') : NO_VALUE} />
            </div>
            { gameState != GameState.FINISHED &&
                <div>
                    <DotLine label="Chasse" value={getTeam(team.chasing)?.name ?? NO_VALUE} />
                    <DotLine label="Chassé par" value={getTeam(team.chased)?.name ?? NO_VALUE} />
                </div>
            }
            { (gameState == GameState.PLAYING || gameState == GameState.FINISHED) && false &&
                <div>
                    <DotLine label="Distance" value={formatDistance(team.distance)} />
                    <DotLine label="Temps de survie" value={formatTime(0, team.finishDate || Date.now())} />
                    <DotLine label="Vitesse moyenne" value={formatSpeed(team.distance, 0, team.finishDate || Date.now())} />
                    <DotLine label="Captures" value={team.nCaptures ?? NO_VALUE} />
                    <DotLine label="Observations" value={team.nSentLocation ?? NO_VALUE} />
                    <DotLine label="Observé" value={team.nObserved ?? NO_VALUE} />
                </div>
            }
            <div>
                <DotLine label="Modèle" value={team.phoneModel ?? NO_VALUE} />
                <DotLine label="Nom" value={team.phoneName ?? NO_VALUE} />
            </div>
        </div>
    );
}
