import Cell from './Cell';
import Transition from './Transition';
import * as PD from 'probability-distributions';
import flatten from 'lodash.flatten';

export default class MultiReverseMarkovChain {
    constructor(size, iterationsCount, transitions) {
        this.size = size;
        this.iterationsCount = iterationsCount;
        this.intensities = [];
        this.stateVisits = [];
        this.stateTimes = [];
        this.transitions = [transitions];
        this.generatedIterations = 0;
        this.distributionConfig = {
            distribution: 'uniform',
            min: 0,
            max: 1,
        };
    }

    generate(steps, chains, distributionConfig) {
        this.distributionConfig = distributionConfig || this.distributionConfig;
        for (; this.generatedIterations < this.iterationsCount; this.generatedIterations++) {
            this.iteration(steps, chains);
        }

        return {
            intensities: this.intensities,
            transitions: this.transitions,
            stateVisits: this.stateVisits,
            stateTimes: this.stateTimes,
        };
    }

    iteration(steps, chains) {
        const transitions = flatten(this.transitions[this.generatedIterations]),
            matrix = MultiReverseMarkovChain.createMatrix(this.size);

        for (let transition of transitions) {
            matrix[transition.from][transition.to].value++;
        }

        this.intensities.push(this.normalize(matrix));

        const {transitions: testedTransitions, stateVisits, stateTimes} = this.test(steps, chains);
        this.transitions.push(testedTransitions);
        this.stateVisits.push(stateVisits);
        this.stateTimes.push(stateTimes);
    }

    test(steps, chains) {
        const transitions = [];
        const stateVisits = [];
        const stateTimes = [];

        for (let i = 0; i < this.size; i++) {
            stateVisits[i] = 0;
            stateTimes[i] = 0;
        }

        for (let i = 0; i < chains; i++) {
            let current = 0,
                transitionsRun = [];
            stateVisits[current]++;
            stateTimes[current] += this.consumeTime();
            for (let j = 0; j < steps; j++) {
                let transition = this.next(current);
                if (transition.to === null) {
                    break;
                }
                current = transition.to;
                stateVisits[current]++;
                stateTimes[current] += this.consumeTime();
                transitionsRun.push(transition);
            }
            transitions.push(transitionsRun);
        }

        return {
            transitions,
            stateVisits,
            stateTimes,
        };
    }

    next(from) {
        const matrix = this.intensities[this.generatedIterations],
            transition = new Transition();
        transition.from = from;

        let target = -1,
            rnd = Math.random();
        for (let j = 0; j < this.size; j++) {
            if (matrix[from][j].value <= 0) {
                continue;
            }
            if (matrix[from][j].value >= rnd) {
                target = j;
                break;
            }
            rnd -= matrix[from][j].value;
        }

        if (target >= 0) {
            transition.to = target;
        }

        return transition;
    }

    normalize(matrix) {
        for (let i = 0; i < this.size; i++) {
            const sum = matrix[i].reduce((sum, cell) => sum + cell.value, 0);
            if (sum) {
                for (let j = 0; j < this.size; j++) {
                    matrix[i][j].value /= sum;
                }
            }
        }

        return matrix;
    }

    consumeTime() {
        const {distribution, A, B} = this.distributionConfig;

        let value = 0;
        switch(distribution) {
            case 'normal':
                value = PD.rnorm(1, A, B)[0];
                break;
            case 'log-normal':
                value = PD.rlnorm(1, A, B)[0];
                break;
            case 'uniform':
            default:
                value = PD.runif(1, A, B)[0];
                break;
        }

        return Math.abs(value);
    }

    static createMatrix(size) {
        const matrix = new Array(size);
        for (let i = 0; i < size; i++) {
            matrix[i] = new Array(size);
            for (let j = 0; j < size; j++) {
                matrix[i][j] = new Cell();
            }
        }
        return matrix;
    }
}
