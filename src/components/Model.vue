<template>
    <svg class="model" :height="height" :width="width">
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
            config() {
                let state = this.$store.state;
                this.namespace.split('/')
                    .forEach(path => state = state[path]);

                return {
                    matrix: state.matrix,
                    states: state.states,
                    transitions: this.$store.getters[`${this.namespace}/transitions`],
                    transitionsNormalized: this.$store.getters[`${this.namespace}/transitionsNormalized`],
                };
            },
            graph() {
                return graph(this.size, this.config);
            },
            // tip() {
            //     return d3.tip().attr('class', 'd3-tip').html(function (d) {
            //         console.log(d);
            //         return d;
            //     });
            // },
        },
        watch: {
            graph() {
                this.render();
            },
        },
        methods: {
            render() {
                const g = this.graph;
                // const tip = this.tip;
                const svg = select(this.$el.children[0]);

                // svg.call(tip);

                this.renderer(svg, g);

                // svg.selectAll('.node')
                // .on('mouseover', tip.show)
                // .on('mouseout', tip.hide);

                this.height = g.graph().height + 40;
                this.width = g.graph().width + 40;

                let xCenterOffset = (this.width - g.graph().width) / 2;
                let yCenterOffset = (this.height - g.graph().height) / 2;
                this.transform = `translate(${xCenterOffset}, ${yCenterOffset})`;
            },
        },
    }
</script>

<style lang="scss">
    svg.model {
        overflow: visible;
    }

    .node {
        rect, circle, ellipse, polygon {
            stroke: #333;
            fill: #fff;
            stroke-width: 1.5px;
        }

        &.state- {
            &active {
                rect, circle, ellipse, polygon {
                    stroke: #007bff;
                    stroke-width: 3px;

                    + .label {
                        color: #007bff;
                        font-weight: bold;
                    }
                }
            }

            &previous {
                rect, circle, ellipse, polygon {
                    stroke: #007bff;
                    fill: #6c757d;

                    + .label {
                        color: #fff;
                    }
                }
            }
        }

        foreignObject {
            overflow: visible;
        }

        .tooltip {
            opacity: 0;
            pointer-events: none;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translate(-50%, 100%);
            font-size: 10px;

            min-width: 10rem;
            padding: .5rem;
            margin: .125rem 0 0;
            color: #212529;
            text-align: left;
            list-style: none;
            background-color: #fff;
            background-clip: padding-box;
            border: 1px solid rgba(0, 0, 0, .15);
            border-radius: .25rem;
        }

        &:hover {
            .tooltip {
                opacity: 1;
                pointer-events: all;
            }
        }
    }

    .edgePath {
        path {
            stroke: #333;
            fill: #333;
            stroke-width: 1.5px;
        }

        &.active {
            path {
                stroke: #007bff;
                fill: #007bff;
                stroke-width: 2px;
            }
        }
    }
</style>
