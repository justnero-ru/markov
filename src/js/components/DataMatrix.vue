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
            <td v-for="(cell, j) in row"
                :class="{'zero': Math.abs(matrix[i][j].value) <= 1e-2,'same': compareTo && Math.abs(compareTo[i][j].value - matrix[i][j].value) <= 1e-2}">
                <span v-if="change === false" v-text="matrix[i][j].value.toFixed(2)"></span>
                <input v-else type="text" :name="'matrix['+i+']['+j+']'" :value="matrix[i][j].value"
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
    }
</script>

<style scoped>

</style>