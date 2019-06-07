<template>
    <svg :height="height" :width="width">
        <g :transform="transform"></g>
    </svg>
</template>

<script>
    import {select} from 'd3'
    import {render as Render} from 'dagre-d3'
    import {graph} from '@/util/Drawer'

    export default {
        name: 'Model',
        props: ['size', 'namespace'],
        data() {
            return {
                renderer: new Render(),
                height: 0,
                width: 0,
                transform: '',
            };
        },
        mounted() {
            this.render();
        },
        computed: {
            matrix() {
                let state = this.$store.state;
                this.namespace.split('/')
                    .forEach(path => state = state[path]);

                return state.matrix;
            },
            graph() {
                return graph(this.size, this.matrix)
            },
        },
        watch: {
            graph() {
                this.render();
            },
        },
        methods: {
            render() {
                const g = this.graph;

                this.renderer(select(this.$el.children[0]), g);

                this.height = g.graph().height + 40;
                this.width = g.graph().width + 40;

                let xCenterOffset = (this.width - g.graph().width) / 2;
                let yCenterOffset = (this.height - g.graph().height) / 2;
                this.transform = `translate(${xCenterOffset}, ${yCenterOffset})`;
            },
        },
    }
</script>

<style>
    .node rect,
    .node circle,
    .node ellipse,
    .node polygon {
        stroke: #333;
        fill: #fff;
        stroke-width: 1.5px;
    }

    .edgePath path {
        stroke: #333;
        fill: #333;
        stroke-width: 1.5px;
    }
</style>
