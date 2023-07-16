import { State, LayerConfig } from "./base-state";
import { QP_REGION_COLORING, QP_REGION_COLORING_CAR, QP_REGION_COLORING_CPC, REGION_COLORING_INTERPOLATE, REGION_COLORING_LEGEND, STAT_AREA_FILTER_ITEMS } from "./consts-regions";

export class StatAreaState extends State {
    constructor(id: string, filters: any) {
        super('stat-area', id, filters);
        this.sql = [
            `SELECT * FROM stat_areas WHERE code = '${this.id}'`,
            `SELECT "meta-source" as name, count(1) as count FROM trees_processed WHERE "stat_area_code" = '${this.id}' GROUP BY 1 order by 2 desc`,
            `SELECT count(1) as total_count FROM trees_compact WHERE "stat_area_code" = '${this.id}'`,
        ];
        for (const id of ['stat-areas-label', 'stat-areas-border', 'stat-areas-fill']) {
            this.layerConfig[id] = new LayerConfig([
                '==', ['get', 'code'], ['literal', this.id]
            ], null, null);
        }
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
            'line-color': '#ff871f',
            'line-opacity': 0.4
        };
        this.layerConfig['trees'] = new LayerConfig([
            '==', ['get', 'stat_area_code'], ['literal', this.id]
        ], null, null);
        this.filterItems = STAT_AREA_FILTER_ITEMS;
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
