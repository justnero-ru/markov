import {graphlib} from 'dagre'
import Cell from '@/util/Cell';

export function graph(size, matrix) {
    const g = new graphlib.Graph().setGraph({rankdir: 'LR'});
    for (let i = 0; i < size; i++) {
        g.setNode(`S${i}`, {
            shape: 'circle',
            labelType: 'html',
            label: `S<sub>${i}</sub>`,
        });
    }
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (matrix[i][j].value !== 0) {
                g.setEdge(`S${i}`, `S${j}`, {
                    label: Cell.format(matrix[i][j]),
                });
            }
        }
    }

    return g;
}
