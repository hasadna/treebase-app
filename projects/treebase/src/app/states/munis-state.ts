import * as Plot from '@observablehq/plot';

import { State, LayerConfig, Chart, REGION_COLORING_OPTIONS, REGION_COLORING_INTERPOLATE, REGION_COLORING_LEGEND, QP_REGION_COLORING, QP_REGION_COLORING_CAR } from "./base-state";

export class MunisState extends State {
    constructor(filters: any) {
        super('munis', undefined, filters);
        this.sql = [
            `SELECT muni_name, canopy_area_ratio*100 as ratio FROM munis ORDER BY canopy_area_ratio DESC nulls last`,
        ];
        for (const id of ['munis-label', 'munis-border', 'munis-fill']) {
            this.layerConfig[id] = new LayerConfig([
                '>', ['get', 'canopy_area_ratio'], 0
            ], null, null);
        }
        const coloring = this.filters[QP_REGION_COLORING] || QP_REGION_COLORING_CAR;
        this.legend = REGION_COLORING_LEGEND[coloring];
        this.layerConfig['munis-fill'].paint = {
            'fill-color': REGION_COLORING_INTERPOLATE[coloring],
            'fill-opacity': 0.8
        };
        this.layerConfig['munis-border'].paint = {
            'line-color': '#155b2e',
            'line-opacity': 0.4
        };
        this.layerConfig['trees'] = new LayerConfig(null, null, null);
        this.filterItems = [
            REGION_COLORING_OPTIONS
        ];
    }

    override handleData(data: any[][]) {
        this.charts = [];
        if (data[0].length) {
            console.log("MUNI DATA", data[0])
            this.charts.push(new Chart(
                'הרשויות עם כיסוי חופות העצים הגבוה ביותר:',
                Plot.plot({
                    height: 250,
                    width: 340,
                    y: {
                        axis: null,
                    },
                    x: {
                        grid: true,
                        tickFormat: d => d + '%',
                        label: 'אחוז כיסוי חופות העצים',
                        labelAnchor: 'center',
                    },
                    marks: [
                        Plot.barX(data[0].slice(0,10), {
                            y: 'muni_name',
                            x: 'ratio',
                            fill: '#204E37',
                            sort: {y: '-x'}
                        }),
                        Plot.text(data[0].slice(0,10), {
                            x: 'ratio',
                            y: 'muni_name',
                            text: 'muni_name',
                            textAnchor: 'start',
                            dx: -3,
                            fill: '#fff',
                        }),
                        Plot.ruleX([0]),
                    ]
                })
            ));
            this.charts.push(new Chart(
                'התפלגות כיסוי חופות העצים בין הרשויות:',
                Plot.plot({
                    height: 250,
                    width: 340,
                    marginLeft: 30,
                    y: {
                        grid: true,
                        label: 'מספר רשויות',
                        tickPadding: 15,
                        labelAnchor: 'center',
                        labelOffset: 30,
                    },
                    x: {
                        label: 'אחוז כיסוי חופות העצים',
                        tickFormat: d => d + '%',
                        labelAnchor: 'center',
                    },
                    marks: [
                        Plot.rectY(data[0], {
                            ...Plot.binX({y: 'count'}, {x: 'ratio', interval: 2.5}),
                            fill: '#204E37',
                        }),
                        Plot.ruleY([0]),
                    ]
                })
            ));
        }
    }

}
