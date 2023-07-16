import { Observable, from, forkJoin, tap } from "rxjs";
import { ApiService } from "../api.service";
import { FocusMode } from "./focus-modes";

export type StateMode = 'about' | 'trees' | 'tree' | 'stat-areas' | 'stat-area' | 'munis' | 'muni' | 'empty';

export class LayerConfig {
    constructor(public filter: any | null, public paint: any | null, public layout: any | null) {
    }
}

export class Chart {
    constructor(public title: string, public chart: Node) {}
}

export class LegendItem {
    constructor(public color: string, public label: string, public separated=false, public scaled=false) {}
}

export class Legend {
    constructor(public title: string, public items: LegendItem[], public tooltip?: string) {}
}

export class FilterOption {
    constructor(public value: string, public label: any) {}
};

export class FilterItem {
    label: string;
    options: FilterOption[] = [];

    constructor(public id: string, public kind: string) {}
}

export class CheckFilterItem extends FilterItem {
    constructor(id: string, label: string) {
        super(id, 'check');
        this.label = label;
    }
}

export class SelectFilterItem extends FilterItem {
    constructor(id: string, label: string, options: FilterOption[]) {
        super(id, 'select');
        this.label = label;
        this.options = options;
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
    charts: Chart[] = [];
    legend: Legend | null = null;
    filterItems: FilterItem[] = [];
    focus: FocusMode|null = null;
    focusQuery: string;

    constructor(public mode: StateMode, public id?: string, public filters: any = {}) {
        if (this.filters.focus) {
            this.focus = FocusMode.fromQueryParam(this.filters.focus) || null;
        } else {
            this.focus = null;
        }
        this.focusQuery = this.focus?.treesQuery() || 'TRUE';
    }
    
    process(api: ApiService): Observable<any> {
        let ret: Observable<any> = from([true]);
        if (this.processed) {
            return ret;
        }
        if (this.sql.length) {
            ret = forkJoin(this.sql.map(sql => api.query(sql))).pipe(
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
