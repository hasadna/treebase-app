import * as Plot from '@observablehq/plot';

import { State, LayerConfig, Chart, FilterOption, SelectFilterItem } from "./base-state";
import { TREE_COLOR_INTERPOLATE, QP_CERTAINTY_CERTAIN, QP_CERTAINTY_SUSPECTED, TREE_COLOR_LEGEND, TREE_FILTER_ITEMS } from './consts-trees';

export class TreesState extends State {
    constructor(filters: any) {
        super('trees', undefined, filters);    
        const layers = ['trees'];
        if (this.filters.canopies !== '0') {
            layers.push('canopies');
        }
        if (this.filters.cadaster !== '0') {
            layers.push('cadaster-label', 'cadaster-border');
        }
        if (this.focus?.kind === 'road') {
            layers.push('roads-border');
        }
        for (const id of layers) {
            this.layerConfig[id] = new LayerConfig(null, null, null);
        }
        this.layerConfig['trees'].paint = {
            'circle-color': TREE_COLOR_INTERPOLATE,
            'circle-stroke-width': [
                "interpolate",
                ["linear"],
                ["zoom"],
                15, 0,
                18, 1
              ],
            'circle-stroke-color': '#ffffff',
        };
        let certaintyCondition = 'TRUE';
        if (this.filters.certainty !== 'all') {
            this.layerConfig['trees'].filter = [
                '==', ['get', 'certainty'], this.filters.certainty === 'certain'
            ]
            if (this.filters.certainty === QP_CERTAINTY_CERTAIN) {
                certaintyCondition = 'certainty = TRUE';
            } else if (this.filters.certainty === QP_CERTAINTY_SUSPECTED) {
                certaintyCondition = 'certainty = FALSE';
            } else {
                certaintyCondition = 'TRUE';
            }
        }
        this.sql = [
            `SELECT count(1) AS count FROM trees_compact WHERE ${this.focusQuery} AND ${certaintyCondition}`,
            `SELECT jsonb_array_elements("joint-source-type") AS name, count(1) AS count FROM trees_compact WHERE ${this.focusQuery} AND ${certaintyCondition} GROUP BY 1 ORDER BY 2 DESC`,
            `SELECT "attributes-genus-clean-he" AS genus_he, "attributes-genus-clean-en" AS genus_en FROM trees_processed WHERE "attributes-genus-clean-he" is not NULL AND ${this.focusQuery} AND ${certaintyCondition} GROUP BY 1, 2 ORDER BY 1`,
        ];
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
                            tip: 'x',
                            title: d => `${d['count'].toLocaleString()} עצים (${(d['count'] / total * 100).toFixed(1)}%)`,
                            text: d => d['name'].replace(/\//, '\n'),
                            textAnchor: 'end',
                            dx: 3,
                            fill: '#204E37',
                        }),
                        Plot.ruleX([0]),
                    ]
                })
            ));
        }
        if (data[2].length) {
            this.filterItems = [...this.filterItems, new SelectFilterItem(
                'genus',
                'סינון לפי מין העץ...',
                [new FilterOption('all', 'כל המינים'),
                 ...data[2].map((d: any) => new FilterOption(d['genus_en'], d['genus_he']))]
            )];
        }
    }

}
