import { Section } from "@/components/section";
import useAdmin from "@/hook/useAdmin";
import useLocalVariable from "@/hook/useLocalVariable";

function MessageInput({title, ...props}) {
    return (
        <div className="w-full flex flex-row gap-3 items-center">
            <p>{title}</p>
            <input className="w-full p-1 rounded ring-1 ring-inset ring-gray-400 placeholder:text-gray-600" {...props} />
        </div>
    );
}

export default function Messages() {
    const {messages, updateSettings} = useAdmin();
    const [localGameSettings, setLocalGameSettings, applyLocalGameSettings] = useLocalVariable(messages, (e) => updateSettings({messages: e}));

    function modifyLocalZoneSettings(key, value) {
        setLocalGameSettings(prev => ({...prev, [key]: value}));
    };

    return (
        <Section title="Messages" innerClassName="w-full h-full flex flex-col gap-3 items-center">
            <MessageInput id="waiting" title="Attente  :" value={localGameSettings?.waiting ?? ""} onChange={(e) => modifyLocalZoneSettings("waiting", e.target.value)} onBlur={applyLocalGameSettings}/>
            <MessageInput id="captured" title="Capture :" value={localGameSettings?.captured ?? ""} onChange={(e) => modifyLocalZoneSettings("captured", e.target.value)} onBlur={applyLocalGameSettings}/>
            <MessageInput id="winner" title="Victoire :" value={localGameSettings?.winner ?? ""} onChange={(e) => modifyLocalZoneSettings("winner", e.target.value)} onBlur={applyLocalGameSettings}/>
            <MessageInput id="loser" title="Défaite  :" value={localGameSettings?.loser ?? ""} onChange={(e) => modifyLocalZoneSettings("loser", e.target.value)} onBlur={applyLocalGameSettings}/>
        </Section>
    );
}
