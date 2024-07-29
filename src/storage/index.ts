import { GamePersistentState, GameState } from "../game";
import { Preferences } from "../preferences";

export interface IGameStorage {
    saveGame: (gameState: GameState) => void;
    savePersistentState: (persistentState: GamePersistentState) => void;
    savePreferences: (preferences: Preferences) => void;
    gameExists: () => boolean;
    persistentStateExists: () => boolean;
    preferencesExists: () => boolean;
    loadGame: () => GameState;
    loadPersistentState: () => GamePersistentState;
    loadPreferences: () => Preferences;
    clearGame: () => void;
    clearPersistentState: () => void;
    clearPreferences: () => void;
}
