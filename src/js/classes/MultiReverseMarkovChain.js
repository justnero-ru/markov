import Cell from "./Cell";
import Transition from "./Transition";

export default class MultiReverseMarkovChain {
    constructor(size, iterationsCount, transitions) {
        this.size = size;
        this.iterationsCount = iterationsCount;
        this.intensities = [];
        this.stateVisits = [];
        this.transitions = [transitions];
        this.generatedIterations = 0;
    }

    generate(steps, chains) {
        for (; this.generatedIterations < this.iterationsCount; this.generatedIterations++) {
            this.iteration(steps, chains);
        }

        return {
            intensities: this.intensities,
            transitions: this.transitions,
            stateVisits: this.stateVisits,
        };
    }

    iteration(steps, chains) {
        const transitions = this.transitions[this.generatedIterations].flat(),
            matrix = MultiReverseMarkovChain.createMatrix(this.size);

        for (let transition of transitions) {
            matrix[transition.from][transition.to].value++;
        }

        this.intensities.push(this.normalize(matrix));

        const {transitions: testedTransitions, stateVisits} = this.test(steps, chains);
        this.transitions.push(testedTransitions);
        this.stateVisits.push(stateVisits);
    }

    test(steps, chains) {
        const transitions = [];
        const stateVisits = [];

        for (let i = 0; i < this.size; i++) {
            stateVisits[i] = 0;
        }

        for (let i = 0; i < chains; i++) {
            let current = 0,
                transitionsRun = [];
            stateVisits[current]++;
            for (let j = 0; j < steps; j++) {
                let transition = this.next(current);
                if (transition.to === null) {
                    break;
                }
                current = transition.to;
                stateVisits[current]++;
                transitionsRun.push(transition);
            }
            transitions.push(transitionsRun);
        }

        return {
            transitions,
            stateVisits,
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
