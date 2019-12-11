import {graphlib} from 'dagre'
import Cell from '@/util/Cell';
import {STATE_ACTIVE, STATE_PREVIOUS} from '@/util/State';

export function graph(size, {matrix, states}) {
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
            label: `S<sub>${i}</sub>`,
            class: `state-${i} state-${states[i].mode}`
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
