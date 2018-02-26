/**
 * Utility class to save and restore sets of states. Used for undo/redo functions.
 */
export class StateManager<T> {
    private readonly _maxStates: number;
    private _activeState: number;
    private _states: T[];

    /**
     * @param maxStates - max number of stored states
     */
    constructor(maxStates = 256) {
        this._maxStates = maxStates;
        this.clear();
    }

    /**
     * Clears all stored states.
     */
    clear(): void {
        this._states = [];
        this._activeState = -1;
    }

    /**
     * Saves the given state and makes it active.
     * @param state
     */
    setState(state: T): void {
        let index = this._activeState + 1;

        this._states[index] = state;
        this._states.splice(index+1, this._states.length);

        this._trimStates();
        this._activeState = this._states.length - 1;
    }

    /**
     * Returns current state.
     */
    getCurrentState(): T | null{
        return this._states[this._activeState] === undefined ? null : this._states[this._activeState];
    }

    /**
     * Returns previous state and makes it active. If there is no previous state, returns null.
     */
    undo(): T | null {
        if (this._activeState <= 0) return null;
        return this._states[--this._activeState];
    }

    /**
     * Returns next state and makes it active. If there is no next state, returns null.
     */
    redo(): T | null {
        if (this._activeState === this._states.length - 1) return null;
        return this._states[++this._activeState];
    }

    private _trimStates(): void {
        while (this._states.length > this._maxStates) {
            this._states.shift();
        }
    }
}
