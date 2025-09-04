import { GameState } from './types';
import { teamStatus } from './configurations';

export function getStatus(team, gamestate) {
    switch (gamestate) {
        case GameState.SETUP:
            return teamStatus.waiting;
        case GameState.PLACEMENT:
            return team.ready ? teamStatus.ready : teamStatus.notready;
        case GameState.PLAYING:
            return team.captured ? teamStatus.captured : team.outofzone ? teamStatus.outofzone : teamStatus.playing;
        case GameState.FINISHED:
            return team.captured ? teamStatus.captured : teamStatus.playing;
    }
}
