import { Observable, forkJoin, from, tap } from "rxjs";
import { ApiService } from "./api.service";

export type StateMode = 'about' | 'trees' | 'tree' | 'stat-areas' | 'stat-area' | 'munis' | 'muni';

export class LayerConfig {
    constructor(public filter: any | null, public paint: any | null, public layout: any | null) {
    }
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
}

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
        const interpolate = [
            'interpolate', ['exponential', 0.01], ['get', 'canopy_area_ratio'],
            0, ['to-color', '#acecc2'],
            0.4, ['to-color', '#155b2e'],
        ];
        this.layerConfig['munis-fill'].paint = {
            'fill-color': interpolate,
            'fill-opacity': 0.8
        };
        this.layerConfig['munis-border'].paint = {
            'line-color': '#ff871f',
            'line-opacity': 0.4
        };
    }

    override process(api: ApiService): Observable<any> {
        return super.process(api).pipe(
            tap((data: any[][]) => {
                console.log("MUNI DATA", this.sql, data)
                if (data[0].length && data[0][0]) {
                    this.geo = {
                        zoom: 13,
                        center: data[0][0]['center']
                    };    
                }
            })
        );
    }

}

export class MunisState extends State {
    constructor() {
        super('munis');
        this.sql = [];
        for (const id of ['munis-label', 'munis-border', 'munis-fill']) {
            this.layerConfig[id] = new LayerConfig([
                '>', ['get', 'canopy_area_ratio'], 0
            ], null, null);
        }
        const interpolate = [
            'interpolate', ['exponential', 0.01], ['get', 'canopy_area_ratio'],
            0, ['to-color', '#acecc2'],
            0.4, ['to-color', '#155b2e'],
        ];
        this.layerConfig['munis-fill'].paint = {
            'fill-color': interpolate,
            'fill-opacity': 0.8
        };
        this.layerConfig['munis-border'].paint = {
            'line-color': '#155b2e',
            'line-opacity': 0.4
        };
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

    override process(api: ApiService): Observable<any> {
        return super.process(api).pipe(
            tap((data: any[][]) => {
                this.geo = {
                    zoom: 20,
                    center: [data[0][0]['location-x'], data[0][0]['location-y']]
                };
            })
        );
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
            'case', ['get', 'canopy_area_ratio'],
            0, ['to-color', '#acecc2'],
            0.4, ['to-color', '#155b2e'],
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
        const interpolate = [
            'interpolate', ['exponential', 0.01], ['get', 'canopy_area_ratio'],
            0, ['to-color', '#acecc2'],
            0.4, ['to-color', '#155b2e'],
        ];
        this.layerConfig['stat-areas-fill'].paint = {
            'fill-color': interpolate,
            'fill-opacity': 0.8
        };
        this.layerConfig['stat-areas-border'].paint = {
            'line-color': '#ff871f',
            'line-opacity': 0.4
        };
    }

    override process(api: ApiService): Observable<any> {
        return super.process(api).pipe(
            tap((data: any[][]) => {
                console.log("STAT AREA DATA", this.sql, data)
                if (data[0].length && data[0][0]) {
                    this.geo = {
                        zoom: 14,
                        center: data[0][0]['center']
                    };    
                }
            })
        );
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
        const interpolate = [
            'interpolate', ['exponential', 0.01], ['get', 'canopy_area_ratio'],
            0, ['to-color', '#acecc2'],
            0.4, ['to-color', '#155b2e'],
        ];
        this.layerConfig['stat-areas-fill'].paint = {
            'fill-color': interpolate,
            'fill-opacity': 0.8
        };
        this.layerConfig['stat-areas-border'].paint = {
            'line-color': '#155b2e',
            'line-opacity': 0.4
        };
    }
}