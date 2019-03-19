<template>
    <table :class="['markov__table', {'markov__table__compared': compareTo}]">
        <thead>
        <tr>
            <th @click="changeMode" :class="[{'mode': canChangeMode}, mode]">{{ modeLabel }}</th>
            <th v-for="(row, x) in matrix">{{ modeLabel }}<sub>{{ x }}</sub></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(row, x) in values">
            <th>{{ modeLabel }}<sub>{{ x }}</sub></th>
            <td v-for="(cell, y) in row" :class="{'zero': isZero(x,y),'same': isSame(x,y)}">
                <span v-if="change === false" v-text="cell"></span>
                <input v-else type="text" :value="cell"
                       @input="onChange(x, y, $event.target.value)">
            </td>
        </tr>
        </tbody>
    </table>
</template>

<script>
    export default {
        name: 'DataMatrix',
        props: {
            change: {
                type: Boolean,
                default: true,
            },
            matrix: {
                type: Array,
                required: true,
            },
            compareTo: {
                type: [Array, Boolean],
                default: false,
            },
            eps: {
                type: [Boolean, Number],
                default: .001,
            },
        },
        data: () => ({
            mode: 'data',
        }),
        created() {
            this.$watch('matrix', (...args) => console.log('matrix change', args));
        },
        computed: {
            canChangeMode() {
                return this.change && this.eps === true;
            },
            modeLabel() {
                switch (this.mode) {
                    case 'eps':
                        return '𝜀';
                    case 'data':
                    default:
                        return 'S';
                }
            },
            values() {
                const mat = new Array(this.matrix.length);
                for (let i = 0; i < mat.length; i++) {
                    mat[i] = new Array(this.matrix.length);
                    for (let j = 0; j < mat.length; j++) {
                        mat[i][j] = this.mode === 'data' ?
                            (this.change ?
                                    this.matrix[i][j].value :
                                    this.format(i, j, this.matrix[i][j].value)
                            ) :
                            this.matrix[i][j].eps
                    }
                }
                return mat;
            }
        },
        methods: {
            changeMode() {
                if (this.canChangeMode) {
                    switch (this.mode) {
                        case 'eps':
                            this.mode = 'data';
                            break;
                        default:
                            this.mode = 'eps';
                            break;
                    }
                }
            },
            onChange(x, y, value) {
                this.$emit('matrix-change', {x, y, value, mode: this.mode});
            },
            isZero(x, y) {
                return Math.abs((this.compareTo ? this.compareTo : this.matrix)[x][y].value) <= this.epsValue(x, y, false);
            },
            isSame(x, y) {
                if (this.compareTo) {
                    const diff = Math.abs(this.compareTo[x][y].value - this.matrix[x][y].value);
                    return diff <= this.epsValue(x, y);
                }
                return true;
            },
            format(x, y, value) {
                let eps = this.epsValue(x, y, false);

                if (value < eps) {
                    return 0;
                }
                if (1 - value < eps) {
                    return 1;
                }
                return (eps * Math.round(value / eps)).toPrecision(Math.ceil(Math.log10(1 / eps)));
            },
            epsValue(x, y, display = true) {
                if (this.eps === true) {
                    if (display) {
                        return this.compareTo ? this.compareTo[x][y].eps : this.matrix[x][y].eps;
                    }
                    return this.compareTo ? Math.min(this.compareTo[x][y].eps, this.matrix[x][y].eps) : this.matrix[x][y].eps;
                }

                return display ? this.eps : Math.min(this.eps, this.matrix[x][y].eps);
            },
        }
    }
</script>
