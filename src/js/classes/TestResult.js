export default class TestResult {
    constructor(transitions, lastPosition, stepCount, stateVisits, chain) {
        this._transitions = transitions;
        this._lastPosition = lastPosition;
        this._stepCount = stepCount;
        this._stateVisits = stateVisits;
        this._chain = chain;
    }

    get chain() {
        return this._chain;
    }

    get stateVisits() {
        return this._stateVisits;
    }

    get stepCount() {
        return this._stepCount;
    }

    get lastPosition() {
        return this._lastPosition;
    }

    get transitions() {
        return this._transitions;
    }
}