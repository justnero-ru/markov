'use strict';

require("sprintf-js");
import Viz from "viz.js";
import {Module, render} from 'viz.js/full.render.js';

let viz = new Viz({Module, render});

export function configFromMatrix({matrix, stateVisits, transitions, transition, mode, deadEnds}) {
    // noinspection HtmlUnknownAttribute
    const size = matrix.length,
        format = 'S%d',
        formatLabel = format.replace('%d', '<sub><font point-size="10">%d</font></sub>');
    let names = [];
    for (let i = 0; i < size; i++) {
        names.push(sprintf('S%d', i));
    }
    let nodesInit = '',
        code = '',
        sum = 0;
    if (mode === 'frequencyTransition' || mode === 'frequencyState') {
        for (let i = 0; i < size; i++) {
            if (mode === 'frequencyState' && stateVisits) {
                sum += stateVisits[i];
            } else {
                for (let j = 0; transitions && j < size; j++) {
                    sum += transitions[i][j].value;
                }
            }
        }
    }
    for (let i = 0; i < size; i++) {
        let nodeId = size < 10 ? size - i - 1 : i,
            nodeStyles = [],
            hasColor = false;

        if (transition) {
            if (transition.to === nodeId) {
                nodeStyles.push('style="filled"');
                nodeStyles.push('color="deepskyblue"');
                hasColor = true;
            } else if (transition.from === nodeId) {
                nodeStyles.push('style="filled"');
                hasColor = true;
            }
        } else if (nodeId === 0) {
            nodeStyles.push('style="filled"');
            nodeStyles.push('color="deepskyblue"');
            hasColor = true;
        }
        if (!hasColor && deadEnds && deadEnds.includes(nodeId)) {
            nodeStyles.push('style="filled"');
            nodeStyles.push('color="gray"');
            hasColor = true;
        }
        if (mode === 'frequencyState') {
            nodeStyles.push('shape=box');
            nodeStyles.push(sprintf('label=<' + formatLabel + '<br/><br/>%s>', nodeId, (stateVisits ? parseFloat(stateVisits[nodeId]) / sum : 0).toFixed(3)));
        } if(mode === 'entryCount') {
            nodeStyles.push('shape=box');
            nodeStyles.push(sprintf('label=<' + formatLabel + '<br/><br/>%s>', nodeId, (stateVisits ? stateVisits[nodeId] : 0)));
        } else {
            nodeStyles.push(sprintf('label=<' + formatLabel + '>', nodeId));
        }
        nodesInit += sprintf("\t%s [%s]\n", names[nodeId], nodeStyles.join(', '));
        for (let j = 0; j < size; j++) {
            if (matrix[i][j].value > 0) {
                let label = mode === 'frequencyTransition' ? (sum > 0 ? transitions[i][j].value / sum : 0) : matrix[i][j].value;
                let transitionStyle = transition && transition.from === i && transition.to === j ? ', penwidth=3, color="0, 1, 1"' : '';
                code += sprintf("\t%s -> %s [label=\"%s\"%s]\n", names[i], names[j], parseFloat(label).toFixed(3), transitionStyle);
            }
        }
    }

    return sprintf("digraph {\n%s%s%s}", size < 10 ? "\trankdir=\"RL\"\n" : '', nodesInit, code);
}

export function renderSvg(config) {
    return new Promise((resolve, reject) =>
        viz.renderString(config)
            .then(result => resolve(result))
            .catch(error => {
                viz = new Viz({Module, render});
                reject(error);
            })
    );
}
