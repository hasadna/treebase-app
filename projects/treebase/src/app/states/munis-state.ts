import * as Plot from '@observablehq/plot';

import { State, LayerConfig, Chart } from "./base-state";
import { MUNIS_FILTER_ITEMS, QP_MUNI_FILTER_PD, QP_MUNI_FILTER_PD_HIGH, QP_MUNI_FILTER_PD_LOW, QP_MUNI_FILTER_PD_MID, QP_MUNI_FILTER_SEI, QP_MUNI_FILTER_SEI_HIGH, QP_MUNI_FILTER_SEI_LOW, QP_MUNI_FILTER_SEI_MID, QP_REGION_COLORING, QP_REGION_COLORING_CAR, REGION_COLORING_INTERPOLATE, REGION_COLORING_LEGEND } from './consts-regions';

export class MunisState extends State {
    constructor(filters: any) {
        super('munis', undefined, filters);
        let layerFilters: any[][] = [];

        let seiCondition = 'TRUE';
        if (this.filters[QP_MUNI_FILTER_SEI] === QP_MUNI_FILTER_SEI_HIGH) {
            seiCondition = '(socioeconomic_index >= 8 and socioeconomic_index <= 10)';
            layerFilters.push(['>=', ['get', 'socioeconomic_index'], 8]);
        } else if (this.filters[QP_MUNI_FILTER_SEI] === QP_MUNI_FILTER_SEI_MID) {
            seiCondition = '(socioeconomic_index >= 4 and socioeconomic_index <= 7)';
            layerFilters.push(['all', ['>=', ['get', 'socioeconomic_index'], 4], ['<=', ['get', 'socioeconomic_index'], 7]]);
        } else if (this.filters[QP_MUNI_FILTER_SEI] === QP_MUNI_FILTER_SEI_LOW) {
            seiCondition = '(socioeconomic_index >= 1 and socioeconomic_index <= 3)';
            layerFilters.push(['<=', ['get', 'socioeconomic_index'], 3]);
        }

        let pdCondition = 'TRUE';
        if (this.filters[QP_MUNI_FILTER_PD] === QP_MUNI_FILTER_PD_HIGH) {
            pdCondition = '(population_density >= 5000)';
            layerFilters.push(['>=', ['get', 'population_density'], 5000]);
        } else if (this.filters[QP_MUNI_FILTER_PD] === QP_MUNI_FILTER_PD_MID) {
            pdCondition = '(population_density >= 1000 and population_density < 5000)';
            layerFilters.push(['all', ['>=', ['get', 'population_density'], 1000], ['<', ['get', 'socioeconomic_index'], 5000]]);
        } else if (this.filters[QP_MUNI_FILTER_PD] === QP_MUNI_FILTER_PD_LOW) {
            pdCondition = '(population_density < 1000)';
            layerFilters.push(['<', ['get', 'population_density'], 1000]);
        }

        this.sql = [
            `SELECT muni_name, canopy_area_ratio*100 as ratio, canopy_per_capita::numeric as cpc FROM munis WHERE ${seiCondition} AND ${pdCondition} ORDER BY canopy_area_ratio DESC nulls last`,
        ];
        for (const id of ['munis-label', 'munis-border', 'munis-fill']) {
            this.layerConfig[id] = new LayerConfig([
                'all',
                ['>', ['get', 'canopy_area_ratio'], 0],
                ...layerFilters
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
        this.filterItems = MUNIS_FILTER_ITEMS;
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
            const topCpc = data[0].filter(d => d.cpc > 0).sort((a,b) => b.cpc - a.cpc).slice(0,10);
            this.charts.push(new Chart(
                'הרשויות עם שטח חופות העצים לנפש הגבוה ביותר:',
                Plot.plot({
                    height: 250,
                    width: 340,
                    y: {
                        axis: null,
                    },
                    x: {
                        grid: true,
                        label: 'שטח חופות העצים לנפש במ״ר',
                        labelAnchor: 'center',
                    },
                    marks: [
                        Plot.barX(topCpc, {
                            y: 'muni_name',
                            x: 'cpc',
                            fill: '#204E37',
                            sort: {y: '-x'}
                        }),
                        Plot.text(topCpc, {
                            x: 'cpc',
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
        }
    }

}
