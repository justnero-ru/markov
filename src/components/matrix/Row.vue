<template>
    <tr>
        <th>{{label}}<sub>{{ x }}</sub></th>
        <matrix-cell
                v-for="j in size"
                :key="j - 1"
                :index="index"
                :x="x"
                :y="j - 1"
                :namespace="namespace"
                :compare-namespace="compareNamespace"
                :eps="eps"
                :read-only="readOnly"
                :mode="mode"/>
    </tr>
</template>

<script>
    import MatrixCell from '@/components/matrix/Cell';

    export default {
        name: 'MatrixRow',
        components: {MatrixCell},
        props: {
            x: {
                type: Number,
                required: true,
            },
            size: {
                type: Number,
                required: true,
            },
            namespace: {
                type: String,
                required: true,
            },
            compareNamespace: {
                type: String,
                default: null,
            },
            eps: {
                type: Number,
                default: 0,
            },
            readOnly: {
                type: Boolean,
                default: false,
            },
            mode: {
                type: String,
                required: true,
            },
            label: {
                type: String,
                required: true,
            },
            index: {
                type: Number,
                default: -1,
            },
        },
    }
</script>
