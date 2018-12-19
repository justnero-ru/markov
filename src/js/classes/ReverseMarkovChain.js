import Transition from './Transition';
import TestResult from './TestResult';
import Cell from "./Cell";

export default class ReverseMarkovChain {
    constructor(size, transitions) {
        this.size = size;
        this.transitions = transitions;
        this._current = 0;
        this.initMatrices();
        this.initStateVisits();
    }

    get current() {
        return this._current;
    }

    initMatrices() {
        this.intensivityMatrix = new Array(this.size);
        this.transitionMatrix = new Array(this.size);

        for (let i = 0; i < this.size; i++) {
            this.intensivityMatrix[i] = new Array(this.size);
            this.transitionMatrix[i] = new Array(this.size);
            for (let j = 0; j < this.size; j++) {
                this.intensivityMatrix[i][j] = new Cell();
                this.transitionMatrix[i][j] = new Cell();
            }
        }

        for (let transition of this.transitions) {
            this.transitionMatrix[transition.from][transition.to].value++;
        }

        for (let i = 0; i < this.size; i++) {
            this.updateIntensity(i);
        }
    }

    initStateVisits() {
        this.stateVisits = new Array(this.size).fill(0);
        this.stateVisits[0]++;
    }

    test(runs, steps) {
        let results = new Array(runs);
        for (let i = 0; i < runs; i++) {
            this.reset();
            let stepCount = 0;
            for (let j = 0; j < steps; j++) {
                let transition = this.next();
                stepCount++;
                if (transition.to === null) {
                    break;
                }
            }

            results[i] = new TestResult(this.transitionMatrix, this._current, stepCount, this.stateVisits);
        }

        return results;
    }

    reset() {
        this._current = 0;
        this.initMatrices();
        this.initStateVisits();
    }

    updateIntensity(line) {
        let sum = this.transitionMatrix[line].reduce((sum, cell) => sum + cell.value, 0);

        if (sum) {
            for (let j = 0; j < this.size; j++) {
                this.intensivityMatrix[line][j].value = this.transitionMatrix[line][j].value / sum;
            }
        }
    }

    next() {
        const transition = new Transition();
        transition.from = this._current;

        let target = -1,
            rnd = Math.random();
        for (let j = 0; j < this.size; j++) {
            if (this.intensivityMatrix[this._current][j].value <= 0) {
                continue;
            }
            if (this.intensivityMatrix[this._current][j].value >= rnd) {
                target = j;
                break;
            }
            rnd -= this.intensivityMatrix[this._current][j].value;
        }

        if (target < 0) {
            return transition;
        }

        this._current = target;
        transition.to = this._current;
        this.transitionMatrix[transition.from][transition.to].value++;
        this.updateIntensity(transition.from);
        this.stateVisits[this._current]++;

        return transition;
    }
}