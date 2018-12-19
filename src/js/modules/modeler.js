'use strict';

import {configFromMatrix, renderSvg} from "./drawer";
import DirectMarkovChain from '../classes/DirectMarkovChain';
import ReverseMarkovChain from '../classes/ReverseMarkovChain';

require("sprintf-js");

class MarkovModel {
    constructor(options) {
        this.options = Object.assign({
            tableContainer: '#table-container',
            modelContainer: '#model-container',
            nameFormat: 'S%d',
            minId: 0,
            size: 4,
        }, options);
        this.container = {
            table: $(this.options.tableContainer),
            model: $(this.options.modelContainer),
        };

        this.init();
        this.listen();
    }

    init() {
        this.actualizeTable();
        this.tableChange();
    }

    actualizeTable() {
        let table = this.container.table.find('table');
        if (table.length === 0) {
            table = $('<table></table>', {class: 'markov__table'})
                .append(
                    $('<thead></thead>')
                        .append(
                            $('<tr></tr>')
                                .append('<th></th>')
                        ),
                    $('<tbody></tbody>'),
                );
            this.container.table.append(table);
        }
        const size = this.options.size,
            head = table.find('thead>tr'),
            body = table.find('tbody'),
            headLength = head.children().length - 1,
            bodyLength = body.children().length;

        // Head
        if (headLength < size) {
            for (let i = headLength; i < size; i++) {
                head.append(
                    $('<th></th>')
                        .text(sprintf(this.options.nameFormat, this.options.minId + i))
                )
            }
        } else if (headLength > size) {
            head.children().slice(size - headLength).remove();
        }

        // Body
        if (bodyLength < size) { // Need to add rows and columns to existing ones
            for (let i = 0; i < bodyLength; i++) { // Adding columns to existing rows
                const row = body.children().eq(i);
                for (let j = row.children().length - 1; j < size; j++) {
                    row.append(
                        $('<td></td>')
                            .append(
                                $('<input/>', {
                                    type: 'text',
                                    name: sprintf("matrix[%d][%d]", i, j),
                                    value: 0,
                                })
                            )
                    )
                }
            }
            for (let i = bodyLength; i < size; i++) { // Adding rows
                const row = $('<tr></tr>')
                    .append(
                        $('<th></th>')
                            .text(sprintf(this.options.nameFormat, this.options.minId + i))
                    );
                for (let j = 0; j < size; j++) {
                    row.append(
                        $('<td></td>')
                            .append(
                                $('<input/>', {
                                    type: 'text',
                                    name: sprintf("matrix[%d][%d]", i, j),
                                    value: 0,
                                })
                            )
                    )
                }
                body.append(row);
            }
        } else if (bodyLength > size) { // Need to remove rows and columns from preserved ones
            body.children() // Remove rows
                .slice(size - bodyLength)
                .remove();
            for (let i = 0; i < size; i++) { // Remove columns from preserved rows
                body.children().eq(i) // tr
                    .children().slice(size, bodyLength).remove();
            }
        }
    }

    listen() {
        this.container.table.on('change keyup', 'input', () => this.tableChange());
    }

    collectMatrix() {
        let matrix = [];
        for (let i = 0; i < this.options.size; i++) {
            let row = [];
            for (let j = 0; j < this.options.size; j++) {
                row.push(this.container.table.find(sprintf('[name="matrix[%d][%d]"]', i, j)).val());
            }
            matrix.push(row);
        }
        return matrix;
    }

    changeSize(size) {
        this.options.size = size;
        this.actualizeTable();
    }

    tableChange() {
        const matrix = this.collectMatrix(),
            renderer = renderSvg(configFromMatrix(matrix));
        renderer.then(svg => this.container.model.html(svg));
    }
}

$(() => {
    let model = new MarkovModel();
    $('body').on('change keyup', '#model-size', function () {
        model.changeSize($(this).val());
    })
});