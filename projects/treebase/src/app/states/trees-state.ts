import * as Plot from '@observablehq/plot';

import { State, LayerConfig, Chart, FilterOption, SelectFilterItem, MultipleSelectFilterItem } from "./base-state";
import { TREE_COLOR_INTERPOLATE, QP_TREE_STATUS_CERTAIN, QP_TREE_STATUS_SUSPECTED, TREE_COLOR_LEGEND, TREE_FILTER_ITEMS, QP_CANOPIES, QP_CANOPIES_NONE, QP_CANOPIES_MATCHED, QP_CANOPIES_LIKELY, QP_CANOPIES_MATCHED_LIKELY, QP_TREE_STATUS, QP_TREE_STATUS_ALL, QP_TREE_STATUS_FILTER, QP_TREE_STATUS_UNREPORTED, QP_TREE_HEIGHT, QP_TREE_HEIGHT_ALL, QP_TREE_HEIGHT_WHERE, QP_TREE_HEIGHT_FILTERS, QP_BARK_DIAMETER, QP_BARK_DIAMETER_ALL, QP_BARK_DIAMETER_WHERE, QP_BARK_DIAMETER_FILTERS, QP_CANOPY_AREA, QP_CANOPY_AREA_ALL, QP_CANOPY_AREA_WHERE, QP_CANOPY_AREA_FILTERS } from './consts-trees';

export class TreesState extends State {
    constructor(filters: any) {
        super('trees', undefined, filters);    
        const layers = ['trees'];
        let canopiesFilter: any[] | null = null;
        if (this.filters[QP_CANOPIES] !== QP_CANOPIES_NONE) {
            layers.push('canopies');
            if (this.filters[QP_CANOPIES] === QP_CANOPIES_MATCHED) {
                canopiesFilter = ['==', ['get', 'kind'], ['literal', 'matched']];
            } else if (this.filters[QP_CANOPIES] === QP_CANOPIES_LIKELY) {
                canopiesFilter = ['==', ['get', 'kind'], ['literal', 'likely']];
            } else if (this.filters[QP_CANOPIES] === QP_CANOPIES_MATCHED_LIKELY) {
                canopiesFilter = ['!=', ['get', 'kind'], ['literal', 'unknown']];
            }
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
        if (canopiesFilter) {
            this.layerConfig['canopies'].filter = canopiesFilter;
        }
        this.layerConfig['trees'].paint = {
            'circle-color': TREE_COLOR_INTERPOLATE,
            'circle-stroke-width': [
                "interpolate",
                ["linear"],
                ["zoom"],
                15, 0,
                18, 3
              ],
            'circle-stroke-color': '#ffffff',
        };
        let treeStatusCondition = 'TRUE';
        this.layerConfig['trees'].filter = [];
        this.filters[QP_TREE_STATUS] = this.filters[QP_TREE_STATUS] || QP_TREE_STATUS_ALL;
        if (this.filters[QP_TREE_STATUS] !== QP_TREE_STATUS_ALL) {
            this.layerConfig['trees'].filter.push(
                QP_TREE_STATUS_FILTER[this.filters[QP_TREE_STATUS]]
            );
            if (this.filters[QP_TREE_STATUS] === QP_TREE_STATUS_CERTAIN) {
                treeStatusCondition = 'certainty = TRUE';
            } else if (this.filters[QP_TREE_STATUS] === QP_TREE_STATUS_SUSPECTED) {
                treeStatusCondition = 'certainty = FALSE';
            } else if (this.filters[QP_TREE_STATUS] === QP_TREE_STATUS_UNREPORTED) {
                treeStatusCondition = 'unreported = TRUE';
            }
        }
        let speciesQuery = 'TRUE';
        this.filters.species = (this.filters.species || '').split(';').filter((s: string) => s.length > 0)
        if (this.filters.species.length > 0) {
            speciesQuery = this.filters.species.map((s: string) => `'${s}'`).join(',');
            speciesQuery = `"attributes-species-clean-en" IN (${speciesQuery})`;
            this.layerConfig['trees'].filter.push(
                ['in', ['get', 'species_en'], ['literal', this.filters.species]]
            );
        }
        let barkDiameterQuery = 'TRUE';
        if (!!this.filters[QP_BARK_DIAMETER] && this.filters[QP_BARK_DIAMETER] !== QP_BARK_DIAMETER_ALL) {
            barkDiameterQuery = QP_BARK_DIAMETER_WHERE[this.filters[QP_BARK_DIAMETER]];
            this.layerConfig['trees'].filter.push(
                QP_BARK_DIAMETER_FILTERS[this.filters[QP_BARK_DIAMETER]]
            );
        }

        let canopyAreaQuery = 'TRUE';
        if (!!this.filters[QP_CANOPY_AREA] && this.filters[QP_CANOPY_AREA] !== QP_CANOPY_AREA_ALL) {
            canopyAreaQuery = QP_CANOPY_AREA_WHERE[this.filters[QP_CANOPY_AREA]];
            this.layerConfig['trees'].filter.push(
                QP_CANOPY_AREA_FILTERS[this.filters[QP_CANOPY_AREA]]
            );
        }

        let heightQuery = 'TRUE';
        if (!!this.filters[QP_TREE_HEIGHT] && this.filters[QP_TREE_HEIGHT] !== QP_TREE_HEIGHT_ALL) {
            heightQuery = QP_TREE_HEIGHT_WHERE[this.filters[QP_TREE_HEIGHT]];
            this.layerConfig['trees'].filter.push(
                QP_TREE_HEIGHT_FILTERS[this.filters[QP_TREE_HEIGHT]]
            );
        }
        const treePropsQuery = [barkDiameterQuery, canopyAreaQuery, heightQuery].join(' AND ');

        this.sql = [
            `SELECT count(1) AS count FROM trees_compact WHERE ${this.focusQuery} AND ${treeStatusCondition} AND ${speciesQuery} AND ${treePropsQuery}`,
            `SELECT jsonb_array_elements("joint-source-type") AS name, count(1) AS count FROM trees_compact WHERE ${this.focusQuery} AND ${treeStatusCondition} AND ${speciesQuery} AND ${treePropsQuery} GROUP BY 1 ORDER BY 2 DESC`,
            `SELECT "attributes-species-clean-he" AS species_he, "attributes-species-clean-en" AS species_en FROM trees_compact WHERE "attributes-species-clean-he" is not NULL AND ${this.focusQuery} AND ${treeStatusCondition} GROUP BY 1, 2 ORDER BY 1`,
        ];
        this.legend = TREE_COLOR_LEGEND;
        this.filterItems = TREE_FILTER_ITEMS;
        this.downloadQuery = `SELECT __fields__ FROM trees_processed WHERE "meta-tree-id" in (
            SELECT "meta-tree-id" FROM trees_compact WHERE ${this.focusQuery} AND ${treeStatusCondition}) AND ${speciesQuery} AND ${treePropsQuery} AND __geo__ ORDER BY "meta-tree-id" LIMIT 5000`;
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
            this.filterItems = [...this.filterItems.slice(0, 2), new MultipleSelectFilterItem(
                'species',
                'סינון לפי מין העץ:',
                'בחירת מיני עצים...',
                 data[2].map((d: any) => new FilterOption(d['species_en'], d['species_he']))
            ), ...this.filterItems.slice(2)];
        }
    }

}
