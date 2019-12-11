import State from '@/util/State';
import Cell from '@/util/Cell';
import * as PD from 'probability-distributions';

export function getDestination({size, normalized}, {from, rnd}) {
    if (from >= size) {
        throw new Error('From can\'t be greater than model size');
    }

    let left = rnd;
    for (let to = 0; to < size; to++) {
        if (normalized[from][to].value > 0 && normalized[from][to].value >= left) {
            return to;
        }
        left -= normalized[from][to].value;
    }

    return -1;
}

export function getStep({size, normalized}, {from}) {
    if (from >= size) {
        throw new Error('From can\'t be greater than model size');
    }

    const rnd = Math.random();

    return getDestination({size, normalized}, {from, rnd});
}

export function consumeTime({type = false, attrs = []}) {
    switch (type) {
        case false:
            return 0;
        case 'normal':
            return Math.abs(PD.rnorm(1, attrs[0], attrs[1])[0]);
        case 'log-normal':
            return Math.abs(PD.rlnorm(1, attrs[0], attrs[1])[0]);
        case 'uniform':
        default:
            return Math.abs(PD.runif(1, attrs[0], attrs[1])[0]);
    }
}

export function directRound({size, chains, steps, matrix, distribution = {}}) {
    const states = [];
    const chain = [];
    for (let i = 0; i < size; i++) {
        states.push(State.empty());
    }
    for (let i = 0; i < chains; i++) {
        let current = 0;
        let next = -1;
        chain.push([current]);
        states[current].visits++;
        for (let j = 0; j < steps && current !== -1; j++) {
            next = getStep({size, normalized: matrix}, {from: current});
            if (next !== -1) {
                chain[i].push(next);
                states[next].visits++;
                states[current].time += consumeTime(distribution);
            }
            current = next;
        }
    }

    return {states, chains: chain, matrix};
}

export function reverseRound({size, chains}) {
    const transitions = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push(Cell.empty());
        }
        transitions.push(row);
    }
    for (let i = 0; i < chains.length; i++) {
        for (let j = 1; j < chains[i].length; j++) {
            const x = chains[i][j - 1];
            const y = chains[i][j];
            transitions[x][y].value++;
        }
    }

    return normalize(transitions);
}

export function normalize(matrix) {
    const normalized = [];
    for (let i = 0; i < matrix.length; i++) {
        const sum = matrix[i].reduce((sum, cell) => sum + cell.value, 0);
        normalized.push(matrix[i].map(cell => sum ? Cell.normalized(cell, sum) : Cell.empty()));
    }

    return normalized;
}
