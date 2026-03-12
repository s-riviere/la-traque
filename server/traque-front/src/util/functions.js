import { GameState } from '../config/types';
import { teamStatus } from '../config/configurations';

export function getStatus(team, gamestate) {
    if (!team) return null;
    switch (gamestate) {
        case GameState.SETUP:
            return teamStatus.waiting;
        case GameState.PLACEMENT:
            return team.ready ? teamStatus.ready : teamStatus.notready;
        case GameState.PLAYING:
            return team.captured ? teamStatus.captured : team.outOfZone ? teamStatus.outofzone : teamStatus.playing;
        case GameState.FINISHED:
            return team.captured ? teamStatus.defeat : teamStatus.victory;
        default:
            return teamStatus.default;
    }
}
