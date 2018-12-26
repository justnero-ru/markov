<template>
    <table :class="['markov__table', {'markov__table__compared': compareTo}]" :size="modelSize">
        <thead>
        <tr>
            <th></th>
            <th v-for="(row, i) in matrix">S<sub>{{ i }}</sub></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(row, i) in matrix">
            <th>S<sub>{{ i }}</sub></th>
            <td v-for="(cell, j) in row" :class="{'zero': isZero(i,j),'same': isSame(i,j)}">
                <span v-if="change === false" v-text="format(cell.value)"></span>
                <input v-else type="text" :name="'matrix['+i+']['+j+']'" :value="cell.value"
                       @input="$emit('matrix-change', i, j, $event.target.value)">
            </td>
        </tr>
        </tbody>
    </table>
</template>

<script>
    export default {
        name: 'DataMatrix',
        props: ['change', 'modelSize', 'matrix', 'compareTo'],
        methods: {
            isZero(i, j) {
                return Math.abs((this.compareTo ? this.compareTo : this.matrix)[i][j].value) <= 1 / 2 * 1e-3;
            },
            isSame(i, j) {
                return this.compareTo && Math.abs(this.compareTo[i][j].value - this.matrix[i][j].value) <= (this.compareTo[i][j].value / 100) * 5;
            },
            format(value) {
                return value.toFixed(3);
            }
        }
    }
</script>

<style scoped>

</style>