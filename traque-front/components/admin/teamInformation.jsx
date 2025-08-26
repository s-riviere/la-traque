import useAdmin from "@/hook/useAdmin";

function DotLine({ label, value }) {
    return (
        <div className="flex items-center">
            <span className="text-lg">{label}</span>
            <span
                className="flex-1 mx-2 overflow-hidden whitespace-nowrap text-black font-bold select-none"
                aria-hidden="true"
            >
                {" . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "}
            </span>
            <span className="text-lg">{value}</span>
        </div>
    );
}

// ...existing imports...

export default function TeamInformation({ selectedTeamId, onClose }) {
    const { getTeam, getTeamName, teams } = useAdmin();
    const team = getTeam(selectedTeamId);

    if (!team) return null;

    function formatTime(seconds) {
        if (!seconds || seconds < 0) return "—";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    // Determine image source
    const imageSrc = team.photoUrl && team.photoUrl.trim() !== ""
        ? team.photoUrl
        : "/images/missing_image.jpg";

    return (
        <div className="bg-white p-6 w-[20rem] max-w-full relative">
            <button
                className="absolute top-2 right-2 text-black text-6xl mr-3"
                onClick={onClose}
                title="Fermer"
            >
                ×
            </button>
            <div className={`text-2xl font-bold text-center mb-2 ${team.captured ? "text-custom-red" : "text-custom-green"} font-bold`}>
                {team.captured ? "Capturée" : "En jeu"}
            </div>
            <div className="text-4xl font-bold text-center mb-4">
                {team.name}
            </div>
            <div className="mb-4 flex justify-center">
                <img
                    src={imageSrc}
                    alt=""
                    className=""
                />
            </div>
            <DotLine label="ID de capture" value={String(team.captureCode).padStart(4, '0')} />
            <DotLine label="ID d'équipe" value={String(team.id).padStart(6, '0')} />
            <div className="h-4" />
            <DotLine label="Chasse" value={getTeamName(team.chasing) ?? "—"} />
            <DotLine label="Chassé par" value={getTeamName(team.chased) ?? "—"} />
            <div className="h-6" />
            <DotLine label="Distance" value={team.distanceTravelled != null ? `${team.distanceTravelled.toFixed(2)} m` : "—"} />
            <DotLine label="Temps de survie" value={team.timeAlive != null ? formatTime(team.timeAlive) : "—"} />
            <DotLine label="Vitesse moyenne" value={team.averageSpeed != null ? `${team.averageSpeed.toFixed(2)} m/s` : "—"} />
            <DotLine label="Captures" value={team.nCaptures ?? "—"} />
            <DotLine label="Observations" value={team.nObservations ?? "—"} />
            <DotLine label="Observé" value={team.nObserved ?? "—"} />
            <DotLine label="Hors zone" value={team.outOfZone ? "Vrai" : "Faux" ?? "—"} />
        </div>
    );
}