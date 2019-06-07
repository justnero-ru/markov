<template>
    <table :class="['markov__table']">
        <thead>
        <tr>
            <th>S</th>
            <th v-for="i in size" :key="i - 1">S<sub>{{ i - 1 }}</sub></th>
        </tr>
        </thead>
        <tbody>
        <matrix-row v-for="i in size"
                    :key="i - 1"
                    :x="i - 1"
                    :size="size"
                    :namespace="namespace"/>
        </tbody>
    </table>
</template>

<script>
    import MatrixRow from '@/components/matrix/Row';

    export default {
        name: 'MatrixTable',
        components: {MatrixRow},
        props: ['size', 'namespace'],
    }
</script>
