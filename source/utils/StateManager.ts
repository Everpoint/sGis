import {error, isNumber} from "./utils";

/**
 * Utility class to save and restore sets of states. Used for undo/redo functions.
 */
export class StateManager {
    private _maxStates: number;
    private _activeState: number;
    private _states: any[];
    /**
     * @param {Number} [maxStates=256] - max number of stored states
     */
    constructor(maxStates = 256) {
        if (!isNumber(maxStates) || maxStates < 0) error("Incorrect value for number of states: " + maxStates);
        this._maxStates = maxStates;
        this.clear();
    }

    /**
     * Clears all stored states.
     */
    clear() {
        this._states = [];
        this._activeState = -1;
    }

    /**
     * Saves the given state and makes it active.
     * @param {*} state
     */
    setState(state) {
        let index = this._activeState + 1;

        this._states[index] = state;
        this._states.splice(index+1, this._states.length);

        this._trimStates();
        this._activeState = this._states.length - 1;
    }

    /**
     * Returns current state.
     * @returns {*}
     */
    getCurrentState() {
        return this._states[this._activeState];
    }

    /**
     * Returns previous state and makes it active. If there is no previous state, returns null.
     * @returns {*}
     */
    undo() {
        if (this._activeState <= 0) return null;
        return this._states[--this._activeState];
    }

    /**
     * Returns next state and makes it active. If there is no next state, returns null.
     * @returns {*}
     */
    redo() {
        if (this._activeState === this._states.length - 1) return null;
        return this._states[++this._activeState];
    }

    _trimStates() {
        while (this._states.length > this._maxStates) {
            this._states.shift();
        }
    }
}
