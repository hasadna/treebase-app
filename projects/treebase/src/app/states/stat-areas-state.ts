import * as Plot from '@observablehq/plot';
import { State, LayerConfig, Chart } from './base-state';
import { QP_REGION_COLORING, QP_REGION_COLORING_CAR, REGION_COLORING_LEGEND, REGION_COLORING_INTERPOLATE, STAT_AREA_FILTER_ITEMS, QP_REGION_COLORING_CPC } from './consts-regions';


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
        this.layerConfig['munis-label'] = new LayerConfig(null, null, null);
        let coloring = this.filters[QP_REGION_COLORING] || QP_REGION_COLORING_CAR;
        if (coloring === QP_REGION_COLORING_CPC) {
            coloring = QP_REGION_COLORING_CAR;
        }
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
        this.filterItems = STAT_AREA_FILTER_ITEMS;

        this.popupLayers = {
            'stat-areas-fill': [
                {label: 'מזהה האזור', content: (p: any) => p.code},
                {label: 'יישוב', content: (p: any) => p.city_name || 'לא ידוע'},
                {label: 'אחוז כיסוי צומח', content: (p: any) => (100 * p.canopy_area_ratio).toFixed(1) + '%'},
            ]
        }

    }

    override handleData(data: any[][]) {
        this.charts = [];
        if (data[0].length) {
            console.log("STAT-AREA DATA", data[0])
            this.charts.push(new Chart(
                'התפלגות כיסוי חופות העצים בין האזורים הסטטיסטיים:',
                Plot.plot({
                    height: 250,
                    width: 340,
                    marginLeft: 50,
                    y: {
                        grid: true,
                        label: 'מספר האזורים',
                        tickPadding: 20,
                        labelAnchor: 'center',
                        labelOffset: 40,
                    },
                    x: {
                        label: 'אחוז כיסוי חופות העצים',
                        tickFormat: d => d + '%',
                        labelAnchor: 'center',
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