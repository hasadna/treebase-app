import * as Plot from '@observablehq/plot';

import { State, LayerConfig, Chart, TREE_COLOR_INTERPOLATE, TREE_COLOR_LEGEND, CheckFilterItem, TREE_FILTER_ITEMS } from "./base-state";

export class TreesState extends State {
    constructor(filters: any) {
        super('trees', undefined, filters);
        this.sql = [
            `SELECT count(distinct "meta-tree-id") as count FROM trees_processed`,
            `SELECT "meta-collection-type" || '\n' || "meta-source-type" as name, count(1) as count FROM trees_processed GROUP BY 1 order by 2 desc`,
        ];
        const layers = ['trees'];
        if (this.filters.canopies !== '0') {
            layers.push('canopies');
        }
        if (this.filters.cadaster !== '0') {
            layers.push('cadaster-label', 'cadaster-border');
        }
        for (const id of layers) {
            this.layerConfig[id] = new LayerConfig(null, null, null);
        }
        this.layerConfig['trees'].paint = {
            'circle-color': TREE_COLOR_INTERPOLATE,
            'circle-stroke-width': 0
        };
        this.legend = TREE_COLOR_LEGEND;
        this.filterItems = TREE_FILTER_ITEMS;
    }

    override handleData(data: any[][]) {
        this.charts = [];
        if (data[1].length) {
            const total = data[0][0]['count'];
            const sources = data[1];
            this.charts.push(new Chart(
                'מספר עצים לפי סוג מקור מידע:',
                Plot.plot({
                    height: 250,
                    width: 340,
                    marginRight: 80,
                    y: {
                        axis: null,
                    },
                    x: {
                        grid: true,
                    },
                    marks: [
                        Plot.barX(sources, {
                            y: 'name',
                            x: 'count',
                            fill: '#204E37',
                            sort: {y: '-x'}
                        }),
                        Plot.text(sources, {
                            x: 'count',
                            y: 'name',
                            text: 'name',
                            textAnchor: 'end',
                            dx: 3,
                            fill: '#204E37',
                        }),
                        Plot.ruleX([0]),
                    ]
                })
            ));
        }
    }

}
