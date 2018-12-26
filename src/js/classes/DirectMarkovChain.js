import Transition from './Transition';
import TestResult from './TestResult';
import Cell from "./Cell";

export default class DirectMarkovChain {
    constructor(matrix) {
        this._current = 0;
        this.size = matrix.length;
        this.intensivityMatrix = DirectMarkovChain.normalize(matrix);
        this.initTransitionMatrix();
        this.initStateVisits();
    }

    get current() {
        return this._current;
    }

    static normalize(matrix) {
        const size = matrix.length;
        for (let i = 0; i < size; i++) {
            const sum = matrix[i].reduce((sum, cell) => sum + parseFloat(cell.value), 0);
            if (sum) {
                for (let j = 0; j < size; j++) {
                    matrix[i][j].value = (matrix[i][j].value / sum).toFixed(3);
                }
            }
        }
        return matrix;
    }

    initTransitionMatrix() {
        this.transitionMatrix = new Array(this.size);
        for (let i = 0; i < this.size; i++) {
            this.transitionMatrix[i] = new Array(this.size);
            for (let j = 0; j < this.size; j++) {
                this.transitionMatrix[i][j] = new Cell();
            }
        }
    }

    initStateVisits() {
        this.stateVisits = new Array(this.size).fill(0);
        this.stateVisits[0]++;
    }

    getTransitions() {
        let transitions = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.intensivityMatrix[i][j].value > 0) {
                    transitions.push([i, j]);
                }
            }
        }
        return transitions;
    }

    test(runs, steps) {
        let results = new Array(runs);
        for (let i = 0; i < runs; i++) {
            this.reset();
            let stepCount = 0,
                chain = [];
            for (let j = 0; j < steps; j++) {
                let transition = this.next();
                stepCount++;
                if (transition.to === null) {
                    break;
                }
                chain.push(transition);
            }

            results[i] = new TestResult(this.transitionMatrix, this._current, stepCount, this.stateVisits, chain);
        }

        return results;
    }

    reset() {
        this._current = 0;
        this.initTransitionMatrix();
        this.initStateVisits();
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
        this.stateVisits[this._current]++;

        return transition;
    }
}