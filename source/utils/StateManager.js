sGis.module('utils.StateManager', [
    'utils'
], (utils) => {

    'use strict';

    class StateManager {
        constructor(maxStates = 256) {
            if (!utils.isNumber(maxStates) || maxStates < 0) utils.error("Incorrect value for number of states: " + maxStates);
            this._maxStates = maxStates;
            this.clear();
        }

        clear() {
            this._states = [];
            this._activeState = -1;
        }

        setState(state) {
            let index = this._activeState + 1;

            this._states[index] = state;
            this._states.splice(index+1, this._states.length);

            this._trimStates();
            this._activeState = this._states.length - 1;
        }
        
        getCurrentState() {
            return this._states[this._activeState];
        }

        undo() {
            if (this._activeState <= 0) return null;
            return this._states[--this._activeState];
        }

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

    return StateManager;

});