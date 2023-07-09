import * as Plot from '@observablehq/plot';

import { State, LayerConfig, Chart, REGION_COLORING_OPTIONS, REGION_COLORING_INTERPOLATE, REGION_COLORING_PARAM, REGION_COLORING_LEGEND } from "./base-state";

export class StatAreasState extends State {
    constructor(filters: any) {
        super('stat-areas', undefined, filters);
        this.sql = [
            `SELECT round(canopy_area_ratio*20) * 5 as ratio, count(1) as count FROM stat_areas WHERE canopy_area_ratio > 0 GROUP BY 1 ORDER BY 1 `,
        ];
        for (const id of ['stat-areas-label', 'stat-areas-border', 'stat-areas-fill']) {
            this.layerConfig[id] = new LayerConfig([
                '>', ['get', 'canopy_area_ratio'], 0
            ], null, null);
        }
        const coloring = this.filters[REGION_COLORING_PARAM] || 'car';
        this.legend = REGION_COLORING_LEGEND[coloring];
        this.layerConfig['stat-areas-fill'].paint = {
            'fill-color': REGION_COLORING_INTERPOLATE[coloring],
            'fill-opacity': 0.8
        };
        this.layerConfig['stat-areas-border'].paint = {
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
            console.log("STAT-AREA DATA", data[0])
            this.charts.push(new Chart(
                'התפלגות כיסוי חופות העצים בין האיזורים הסטטיסטיים:',
                Plot.plot({
                    height: 250,
                    width: 340,
                    marginLeft: 50,
                    y: {
                        grid: true,
                        label: 'מספר א״ס',
                        tickPadding: 20,            
                    },
                    x: {
                        label: 'אחוז כיסוי חופות העצים',
                    },
                    marks: [
                        Plot.barY(data[0], {y: 'count', x: 'ratio', fill: '#204E37'}),
                        Plot.ruleY([0]),
                    ]
                })
            ));
        }
    }
}