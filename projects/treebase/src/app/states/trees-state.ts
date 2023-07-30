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
        this.layerConfig['trees'].filter = [];
        this.filters.certainty = this.filters.certainty || 'all';
        if (this.filters.certainty !== 'all') {
            this.layerConfig['trees'].filter.push(
                ['==', ['get', 'certainty'], this.filters.certainty === 'certain']
            );
            if (this.filters.certainty === QP_CERTAINTY_CERTAIN) {
                certaintyCondition = 'certainty = TRUE';
            } else if (this.filters.certainty === QP_CERTAINTY_SUSPECTED) {
                certaintyCondition = 'certainty = FALSE';
            }
        }
        let speciesQuery = 'TRUE';
        this.filters.species = this.filters.species || 'all';
        if (this.filters.species !== 'all') {
            speciesQuery = `"attributes-species-clean-en" = '${this.filters.species}'`;
            this.layerConfig['trees'].filter.push(
                ['==', ['get', 'species_en'], ["literal", this.filters.species]]
            );
        }
        this.sql = [
            `SELECT count(1) AS count FROM trees_compact WHERE ${this.focusQuery} AND ${certaintyCondition} AND ${speciesQuery}`,
            `SELECT jsonb_array_elements("joint-source-type") AS name, count(1) AS count FROM trees_compact WHERE ${this.focusQuery} AND ${certaintyCondition} AND ${speciesQuery} GROUP BY 1 ORDER BY 2 DESC`,
            `SELECT "attributes-species-clean-he" AS species_he, "attributes-species-clean-en" AS species_en FROM trees_compact WHERE "attributes-species-clean-he" is not NULL AND ${this.focusQuery} AND ${certaintyCondition} GROUP BY 1, 2 ORDER BY 1`,
        ];
        this.legend = TREE_COLOR_LEGEND;
        this.filterItems = TREE_FILTER_ITEMS;
        this.downloadQuery = `SELECT __fields__ FROM trees_processed WHERE "meta-tree-id" in (
            SELECT "meta-tree-id" FROM trees_compact WHERE ${this.focusQuery} AND ${certaintyCondition}) AND ${speciesQuery} AND __geo__ ORDER BY "meta-tree-id" LIMIT 5000`;
        if (this.layerConfig['trees'].filter.length > 1) {
            this.layerConfig['trees'].filter = ['all', ...this.layerConfig['trees'].filter];
        } else if (this.layerConfig['trees'].filter.length === 1) {
            this.layerConfig['trees'].filter = this.layerConfig['trees'].filter[0];
        } else {
            this.layerConfig['trees'].filter = null;
        }
    }

    override handleData(data: any[][]) {
        this.charts = [];

        const RENAME: any = {
            'חישה מרחוק/ממשלתי':
                    'עיבוד חופות עצים/(חישה מרחוק, מפ"י)',
            'סקר רגלי/ממשלתי':
                    'רשות המים/(נתוני רשויות מעובדים)'
        };

        if (data[1].length) {
            const total = data[0][0]['count'];
            const sources = data[1];
            this.charts.push(new Chart(
                'מספר עצים לפי סוג מקור מידע:',
                Plot.plot({
                    height: 250,
                    width: 340,
                    marginRight: 100,
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
                            text: d => (RENAME[d['name']] || d['name']).replace(/\//, '\n'),
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
                'species',
                'סינון לפי מין העץ...',
                [new FilterOption('all', 'כל המינים'),
                 ...data[2].map((d: any) => new FilterOption(d['species_en'], d['species_he']))]
            )];
        }
    }

}
