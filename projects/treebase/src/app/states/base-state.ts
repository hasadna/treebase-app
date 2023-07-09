import { Observable, from, forkJoin, tap } from "rxjs";
import { ApiService } from "../api.service";

export type StateMode = 'about' | 'trees' | 'tree' | 'stat-areas' | 'stat-area' | 'munis' | 'muni' | 'empty';

export class LayerConfig {
    constructor(public filter: any | null, public paint: any | null, public layout: any | null) {
    }
}

export class Chart {
    constructor(public title: string, public chart: Node) {}
}

export class LegendItem {
    constructor(public color: string, public label: string) {}
}

export class Legend {
    constructor(public title: string, public items: LegendItem[]) {}
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

    constructor(public mode: StateMode, public id?: string, public filters: any = {}) {}
    
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

// CONSTANTS

export const TREE_COLOR_INTERPOLATE = [
    'case', ['get', 'certainty'],
    ['to-color', '#64B883'],
    ['to-color', '#204E37'],
];
export const TREE_COLOR_LEGEND = new Legend('מקרא וודאות זיהוי', [
    new LegendItem('#64B883', 'עץ מזוהה'),
    new LegendItem('#204E37', 'חשד לעץ'),
]);

export const TREE_FILTER_ITEMS = [
    new CheckFilterItem('canopies', 'הצגת חופות'),
    new CheckFilterItem('cadaster', 'הצגת גוש/חלקה'),
];

export const REGION_COLORING_PARAM = 'rc';
export const REGION_COLORING_OPTIONS = new SelectFilterItem(
    REGION_COLORING_PARAM, 'תצוגת איזורים:', [
        new FilterOption('car', 'לפי כיסוי חופות העצים'),
        new FilterOption('quality', ' לפי איכות המידע'),
    ]
);
export const REGION_COLORING_INTERPOLATE: {[key: string]: any[]} = {
    'quality': [
        'match', ['coalesce', ['get', 'quality_score'], 0],
        0, ['to-color', '#cccccc'],
        1, ['to-color', '#FFC700'],
        2, ['to-color', '#FF7F00'],
        3, ['to-color', '#00D315'],
        ['to-color', '#00D315'],
    ],
    'car': [
        'interpolate', ['exponential', 0.01], ['get', 'canopy_area_ratio'],
        0, ['to-color', '#ccc'],
        0.05, ['to-color', '#acecc2'],
        0.4, ['to-color', '#155b2e'],
    ]
}
export const REGION_COLORING_LEGEND: {[key: string]: Legend} = {
    'quality': new Legend('מקרא איכות המידע', [
        new LegendItem('#00D315', '3 מקורות מידע ומעלה'),
        new LegendItem('#FF7F00', '2 מקורות מידע'),
        new LegendItem('#FFC700', 'מקור מידע אחד'),
        new LegendItem('#cccccc', 'אין מידע כלל'),
    ]),
    'car': new Legend('מקרא כיסוי חופות העצים', [
        new LegendItem('#155b2e', 'כיסוי גבוה'),
        new LegendItem('#3b7f53', ''),
        new LegendItem('#60a478', 'כיסוי בינוני'),
        new LegendItem('#86c89d', ''),
        new LegendItem('#acecc2', 'כיסוי נמוך'),
        new LegendItem('#ccc', 'אין מידע'),
    ])
}