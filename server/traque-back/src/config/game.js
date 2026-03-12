/* eslint-disable no-unused-vars */
import { DEFAULT_ZONES_SETTINGS } from "#config/zone.js";
import { DefaultState, PlacementState, PlayingState, FinishedState } from '#core/states/game/index.js';

export const STATE_SETTINGS = {
    ENTRY_STATE_CLASS: DefaultState,
    TRANSITION_MATRIX: {
        [DefaultState.name]: {
            [DefaultState.name]:   (state) => false,
            [PlacementState.name]: (state) => state.canGameStart(),
            [PlayingState.name]:   (state) => false,
            [FinishedState.name]:  (state) => false,
        },
        [PlacementState.name]: {
            [DefaultState.name]:   (state) => true,
            [PlacementState.name]: (state) => false,
            [PlayingState.name]:   (state) => true,
            [FinishedState.name]:  (state) => false,
        },
        [PlayingState.name]: {
            [DefaultState.name]:   (state) => true,
            [PlacementState.name]: (state) => true,
            [PlayingState.name]:   (state) => false,
            [FinishedState.name]:  (state) => state.isGameOver(),
        },
        [FinishedState.name]: {
            [DefaultState.name]:   (state) => true,
            [PlacementState.name]: (state) => false,
            [PlayingState.name]:   (state) => false,
            [FinishedState.name]:  (state) => false,
        }
    },
};

export const DEFAULT_GAME_SETTINGS = {
    playingZones: DEFAULT_ZONES_SETTINGS.CIRCLE,
    placementZones: {},
    scanDelay: 10 * 60 * 1000, // ms
    outOfZoneDelay: 5 * 60 * 1000 // ms
};

export const TEAM_ID_LENGTH = 6;
export const CAPTURE_CODE_LENGTH = 4;

export const RESTART_TIMERS = true;
