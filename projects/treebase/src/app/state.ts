import { Observable, forkJoin, from, tap } from "rxjs";
import { ApiService } from "./api.service";
import * as Plot from '@observablehq/plot';


export type StateMode = 'about' | 'trees' | 'tree' | 'stat-areas' | 'stat-area' | 'munis' | 'muni';

export class LayerConfig {
    constructor(public filter: any | null, public paint: any | null, public layout: any | null) {
    }
}

export class Chart {
    constructor(public title: string, public chart: Node) {}
}

export class State {

    data: any[][];
    sql: string[] = [];
    geo: {
        zoom: number;
        center: [number, number];
    } | null = null;
    processed = false;
    layerConfig: {[id: string]: LayerConfig} = {};
    charts: Chart[] = [];

    constructor(public mode: StateMode, public id?: string) {}
    
    process(api: ApiService): Observable<any> {
        const ret = from([true]);
        if (this.processed) {
            return ret;
        }
        if (this.sql.length) {
            return forkJoin(this.sql.map(sql => api.query(sql))).pipe(
                tap((data: any[][]) => {
                    this.processed = true;
                    this.data = data;
                    this.handleData(data);
                })
            )
        }
        return ret;
    }

    isLayerVisible(id: string): boolean {
        return !!this.layerConfig[id];
    }

    getLayerConfig(id: string): LayerConfig {
        return this.layerConfig[id];
    }

    handleData(data: any[][]) {
    }
}

const CANOPY_AREA_RATIO_INTERPOLATE = [
    'interpolate', ['exponential', 0.01], ['get', 'canopy_area_ratio'],
    0, ['to-color', '#ccc'],
    0.05, ['to-color', '#acecc2'],
    0.4, ['to-color', '#155b2e'],
];
export class MuniState extends State {
    constructor(id: string) {
        super('muni', id);
        this.sql = [
            `SELECT * FROM munis WHERE "muni_code" = '${this.id}'`,
            `SELECT "meta-source" as name, count(1) as count FROM trees_processed WHERE "muni_code" = '${this.id}' GROUP BY 1 order by 2 desc`,
            `SELECT count(1) as total_count FROM trees_processed WHERE "muni_code" = '${this.id}'`,
        ];
        for (const id of ['munis-label', 'munis-border', 'munis-fill']) {
            this.layerConfig[id] = new LayerConfig([
                '==', ['get', 'muni_code'], ['literal', this.id]
            ], null, null);
        }
        this.layerConfig['munis-fill'].paint = {
            'fill-color': CANOPY_AREA_RATIO_INTERPOLATE,
            'fill-opacity': 0.8
        };
        this.layerConfig['munis-border'].paint = {
            'line-color': '#ff871f',
            'line-opacity': 0.4
        };
        this.layerConfig['trees'] = new LayerConfig([
            '==', ['get', 'muni'], ['literal', this.id]
        ], null, null);
    }

    override handleData(data: any[][]) {
        if (data[0].length && data[0][0]) {
            this.geo = {
                zoom: 13,
                center: data[0][0]['center']
            };    
        }
    }

}

export class MunisState extends State {
    constructor() {
        super('munis');
        this.sql = [
            `SELECT muni_name, canopy_area_ratio*100 as ratio FROM munis ORDER BY canopy_area_ratio DESC nulls last`,
        ];
        for (const id of ['munis-label', 'munis-border', 'munis-fill']) {
            this.layerConfig[id] = new LayerConfig([
                '>', ['get', 'canopy_area_ratio'], 0
            ], null, null);
        }
        this.layerConfig['munis-fill'].paint = {
            'fill-color': CANOPY_AREA_RATIO_INTERPOLATE,
            'fill-opacity': 0.8
        };
        this.layerConfig['munis-border'].paint = {
            'line-color': '#155b2e',
            'line-opacity': 0.4
        };
        this.layerConfig['trees'] = new LayerConfig(null, null, null);
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
            const x = 'sta' + 'rt';
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
                    },
                    marks: [
                        Plot.rectY(data[0], {
                            ...Plot.binX({y: 'count'}, {x: 'ratio', interval: 5}),
                            fill: '#204E37',
                        }),
                        Plot.ruleY([0]),
                        Plot.ruleX([0]),
                    ]
                })
            ));
        }
    }

}

export class TreeState extends State {
    constructor(id: string) {
        super('tree', id);
        this.sql = [`SELECT * FROM trees_processed WHERE "meta-tree-id" = '${this.id}'`];
        for (const id of ['trees', 'canopies']) {
            this.layerConfig[id] = new LayerConfig(null, null, null);
        }
        this.layerConfig['trees'].paint = {
            'circle-stroke-width': [
                'case',
                ['==', ['get', 'tree-id'], ['literal', this.id]],
                3, 0
            ]
        };
    }

    override handleData(data: any[][]) {
        this.geo = {
            zoom: 20,
            center: [data[0][0]['location-x'], data[0][0]['location-y']]
        };
    }
}

export class TreesState extends State {
    constructor() {
        super('trees');
        this.sql = [
            `SELECT count(1) as count FROM trees_processed`,
            `SELECT "meta-source" as name, count(1) as count FROM trees_processed GROUP BY 1 order by 2 desc`,
        ];
        for (const id of ['trees', 'canopies']) {
            this.layerConfig[id] = new LayerConfig(null, null, null);
        }
        const interpolate = [
            'case', ['get', 'certainty'],
            ['to-color', '#64B883'],
            ['to-color', '#204E37'],
        ];
        this.layerConfig['trees'].paint = {
            'circle-color': interpolate,
        };
    }
}

export class StatAreaState extends State {
    constructor(id: string) {
        super('stat-area', id);
        this.sql = [
            `SELECT * FROM stat_areas WHERE code = '${this.id}'`,
            `SELECT "meta-source" as name, count(1) as count FROM trees_processed WHERE "stat_area_code" = '${this.id}' GROUP BY 1 order by 2 desc`,
        ];
        for (const id of ['stat-areas-label', 'stat-areas-border', 'stat-areas-fill']) {
            this.layerConfig[id] = new LayerConfig([
                '==', ['get', 'code'], ['literal', this.id]
            ], null, null);
        }
        this.layerConfig['stat-areas-fill'].paint = {
            'fill-color': CANOPY_AREA_RATIO_INTERPOLATE,
            'fill-opacity': 0.8
        };
        this.layerConfig['stat-areas-border'].paint = {
            'line-color': '#ff871f',
            'line-opacity': 0.4
        };
        this.layerConfig['trees'] = new LayerConfig([
            '==', ['get', 'stat_area_code'], ['literal', this.id]
        ], null, null);
    }

    override handleData(data: any[][]) {
        console.log("STAT AREA DATA", this.sql, data)
        if (data[0].length && data[0][0]) {
            this.geo = {
                zoom: 14,
                center: data[0][0]['center']
            };    
        }
    }

}

export class StatAreasState extends State {
    constructor() {
        super('stat-areas');
        this.sql = [];
        for (const id of ['stat-areas-label', 'stat-areas-border', 'stat-areas-fill']) {
            this.layerConfig[id] = new LayerConfig([
                '>', ['get', 'canopy_area_ratio'], 0
            ], null, null);
        }
        this.layerConfig['stat-areas-fill'].paint = {
            'fill-color': CANOPY_AREA_RATIO_INTERPOLATE,
            'fill-opacity': 0.8
        };
        this.layerConfig['stat-areas-border'].paint = {
            'line-color': '#155b2e',
            'line-opacity': 0.4
        };
        this.layerConfig['trees'] = new LayerConfig(null, null, null);
    }
}