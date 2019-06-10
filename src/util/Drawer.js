import {graphlib} from 'dagre'
import Cell from '@/util/Cell';
import {STATE_ACTIVE, STATE_PREVIOUS} from "@/util/State";

export function graph(size, {matrix, states, transitions, transitionsNormalized}) {
    const g = new graphlib.Graph().setGraph({rankdir: 'LR'});
    const transition = {from: -1, to: -1};
    for (let i = 0; i < size; i++) {
        if (states) {
            switch (states[i].mode) {
                case STATE_PREVIOUS:
                    transition.from = i;
                    break;
                case STATE_ACTIVE:
                    transition.to = i;
                    break;
            }
        }
        g.setNode(`S${i}`, {
            shape: 'circle',
            labelType: 'html',
            label: nodeLabel(i, states[i] || null),
            class: `state-${states[i].mode}`
        });
    }
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (matrix[i][j].value !== 0) {
                g.setEdge(`S${i}`, `S${j}`, {
                    label: Cell.format(matrix[i][j]),
                    class: transition.from === i && transition.to === j ? 'active' : 'inactive',
                });
            }
        }
    }

    return g;
}

export function nodeLabel(i, state) {
    let label = `S<sub>${i}</sub>`;
    if (state) {
        let tooltip = [];
        const {visits, time} = state;
        const timeMean = visits === 0 ? 0 : time / visits;
        tooltip.push(`<dt>Посещена:</dt><dd>${visits}</dd>`);
        tooltip.push(`<dt>Время (общее):</dt><dd>${time}</dd>`);
        tooltip.push(`<dt>Время (среднее):</dt><dd>${timeMean.toFixed(2)}</dd>`);

        label += `<div class="tooltip"><dl>${tooltip.join('')}</dl></div>`;
    }

    return label;
}
