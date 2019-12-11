<template>
    <div style="position: relative;" ref="cont">
        <svg ref="svg" class="model" :height="height" :width="width">
            <g ref="g" :transform="transform"></g>
        </svg>
        <div :class="{'model-tooltip': true, 'show': tooltip.isShown}"
             :style="`top: ${tooltip.top}px; left: ${tooltip.left}px;`">
            <dl>
                <dt>Посещена:</dt>
                <dd>{{ tooltip.visits }}</dd>
                <dt>Частота:</dt>
                <dd>{{ tooltip.frequency}}</dd>
                <dt>Время (общее):</dt>
                <dd>{{ tooltip.timeTotal }}</dd>
                <dt>Время (среднее):</dt>
                <dd>{{ tooltip.timeMean }}</dd>
            </dl>
        </div>
    </div>
</template>

<script>
    import {select} from 'd3'
    import {render as Render} from 'dagre-d3'
    import {graph} from '@/util/Drawer'

    export default {
        name: 'Model',
        props: ['size', 'namespace', 'index'],
        data() {
            return {
                renderer: new Render(),
                height: 0,
                width: 0,
                transform: '',
                tooltipStateId: false,
                tooltipOffsetX: 0,
                tooltipOffsetY: 0,
            };
        },
        mounted() {
            this.render();
        },
        computed: {
            tooltip() {
                if (this.tooltipStateId === false) {
                    return {
                        isShown: false,
                        top: 0,
                        left: 0,
                        visits: 0,
                        frequency: 0,
                        timeTotal: 0,
                        timeMean: 0,
                    }
                }

                const {visits, time} = this.config.states[this.tooltipStateId];
                const timeMean = visits === 0 ? 0 : time / visits;

                return {
                    isShown: this.tooltipStateId !== false,
                    top: this.tooltipOffsetY + 5,
                    left: this.tooltipOffsetX + 5,
                    visits: visits.toFixed(2),
                    frequency: this.config.statesNormalized[this.tooltipStateId].visits.toFixed(2),
                    timeTotal: time.toFixed(2),
                    timeMean: timeMean.toFixed(2),
                };
            },
            config() {
                let state = this.$store.state;
                this.namespace.split('/')
                    .forEach(path => state = state[path]);

                if (this.index !== undefined) {
                    return {
                        matrix: state.matrices[this.index],
                        states: state.states[this.index],
                        statesNormalized: this.$store.getters[`${this.namespace}/statesNormalized`][this.index],
                        transitions: this.$store.getters[`${this.namespace}/transitions`][this.index],
                        transitionsNormalized: this.$store.getters[`${this.namespace}/transitionsNormalized`][this.index],
                    };
                }

                return {
                    matrix: state.matrix,
                    states: state.states,
                    statesNormalized: this.$store.getters[`${this.namespace}/statesNormalized`],
                    transitions: this.$store.getters[`${this.namespace}/transitions`],
                    transitionsNormalized: this.$store.getters[`${this.namespace}/transitionsNormalized`],
                    showTooltip: (stateId, offsetX, offsetY) => this.showTooltip(stateId, offsetX, offsetY),
                    hideTooltip: stateId => this.hideTooltip(stateId),
                };
            },
            graph() {
                return graph(this.size, this.config);
            },
        },
        watch: {
            graph() {
                this.render();
            },
        },
        methods: {
            showTooltip(stateId, offsetX, offsetY) {
                this.tooltipStateId = stateId;
                this.tooltipOffsetX = offsetX;
                this.tooltipOffsetY = offsetY;
            },
            hideTooltip(stateId) {
                if (this.tooltipStateId === stateId) {
                    this.tooltipStateId = false;
                }
            },
            render() {
                const g = this.graph;
                const svg = select(this.$refs.g);

                this.renderer(svg, g);

                for (let i = 0; i < this.config.states.length; i++) {
                    svg.selectAll(`.state-${i}`)
                        .on('mousemove', (a, b, c) => {
                            const container = this.$refs.cont.getBoundingClientRect();
                            const target = c[0].getBoundingClientRect();
                            const nodeId = Number.parseInt(a.substr(1));

                            const offset = {
                                x: target.x - container.x + target.width / 2,
                                y: target.y - container.y + target.height - 5,
                            };

                            if (offset.x + 80 > container.width) {
                                offset.x = container.width - 80;
                            }

                            if (offset.y + 102 > container.height) {
                                offset.y -= target.height + 102 + 5;
                            }

                            this.showTooltip(nodeId, offset.x, offset.y);
                        })
                        .on('mouseout', () => this.hideTooltip(i));
                }

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
    .model-tooltip {
        position: absolute;
        z-index: 10000;
        opacity: 0;
        pointer-events: none;
        top: 0;
        left: 0;
        width: 160px;
        height: 102px;
        transform: translateX(-50%);
        font-size: 10px;

        padding: .5rem;
        color: #212529;
        text-align: left;
        list-style: none;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid rgba(0, 0, 0, .15);
        border-radius: .25rem;

        &.show {
            opacity: 1;
            pointer-events: all;
        }

        dl {
            display: flex;
            flex-wrap: wrap;
            margin: 0;

            dt, dd {
                display: block;
                margin-bottom: 0;
            }

            dt {
                flex-grow: 1;
                min-width: 50%;

                ~ dt {
                    margin-top: .5rem;
                }
            }

            dd {
                flex-shrink: 1;

                ~ dd {
                    margin-top: .5rem;
                }
            }

            dd:last-child {
                margin-bottom: 0;
            }
        }
    }

    svg.model {
        overflow: visible;
        user-select: none;
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

        .label > g > * {
            overflow: visible;
        }

        /*&:hover {*/
        /*    .tooltip {*/
        /*        opacity: 1;*/
        /*        pointer-events: all;*/
        /*    }*/
        /*}*/
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
