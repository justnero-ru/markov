export const STATE_IDLE = 'idle';
export const STATE_PREVIOUS = 'previous';
export const STATE_ACTIVE = 'active';
export const STATE_MODES = [STATE_IDLE, STATE_PREVIOUS, STATE_ACTIVE];

export default class State {
    /**
     * @param {string} mode
     * @param {number} visits
     * @param {number} time
     * @returns {{mode: string, visits: number, time: number}}
     */
    static build(mode = STATE_IDLE, visits = 0, time = 0) {
        return {mode, visits, time};
    }

    /**
     * @returns {{mode: string, visits: number, time: number}}
     */
    static empty() {
        return this.build();
    }

    /**
     * @param {{mode: string, visits: number, time: number}}
     * @returns {{mode: string, visits: number, time: number}}
     */
    static copy({mode = STATE_IDLE, visits = 0, time = 0}) {
        return this.build(mode, visits, time);
    }

    /**
     * @param {{mode: string, visits: number, time: number}} state
     * @param {number} factor
     * @returns {{mode: string, visits: number, time: number}}
     */
    static normalized(state, factor) {
        return this.override(state, {visits: factor !== 0 ? state.visits / factor : 0});
    }

    /**
     * @param {{mode: string, visits: number, time: number}} state
     * @returns {{mode: string, visits: number, time: number}}
     */
    static idle(state) {
        return this.override(state, {
            mode: STATE_IDLE,
        });
    }

    /**
     * @param {{mode: string, visits: number, time: number}} state
     * @param {number} time
     * @returns {{mode: string, visits: number, time: number}}
     */
    static from(state, time = 0) {
        return this.override(state, {
            mode: STATE_PREVIOUS,
            time: (state.time || 0) + time,
        });
    }

    /**
     * @param {{mode: string, visits: number, time: number}} state
     * @returns {{mode: string, visits: number, time: number}}
     */
    static to(state) {
        return this.override(state, {
            mode: STATE_ACTIVE,
            visits: (state.visits || 0) + 1,
        });
    }

    /**
     * @param {{mode: string, visits: number, time: number}} state
     * @param {{mode: string|undefined, visits: number|undefined, time: number|undefined}} attrs
     * @returns {{mode: string, visits: number, time: number}}
     */
    static override(state, attrs) {
        return Object.assign({}, state, attrs);
    }
}
