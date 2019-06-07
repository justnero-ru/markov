<template>
    <tr>
        <th>S<sub>{{ x }}</sub></th>
        <matrix-cell
                v-for="j in size"
                :key="j - 1"
                :x="x"
                :y="j - 1"
                :namespace="namespace"/>
    </tr>
</template>

<script>
    import MatrixCell from '@/components/matrix/Cell';

    export default {
        name: 'MatrixRow',
        components: {MatrixCell},
        props: ['size', 'x', 'namespace'],
    }
</script>
