import { State, LayerConfig} from "./base-state";
import { MUNI_FILTER_ITEMS, QP_REGION_COLORING, QP_REGION_COLORING_CAR, REGION_COLORING_INTERPOLATE, REGION_COLORING_LEGEND } from "./consts-regions";

export class MuniState extends State {
    constructor(id: string, filters: any) {
        super('muni', id, filters);
        this.sql = [
            `SELECT * FROM munis WHERE "muni_code" = '${this.id}'`,
            `SELECT "meta-source" as name, count(1) as count FROM trees_processed WHERE "muni_code" = '${this.id}' GROUP BY 1 order by 2 desc`,
            `SELECT count(1) as total_count FROM trees_compact WHERE "muni_code" = '${this.id}'`,
        ];
        for (const id of ['munis-label', 'munis-border', 'munis-fill']) {
            this.layerConfig[id] = new LayerConfig([
                '==', ['get', 'muni_code'], ['literal', this.id]
            ], null, null);
        }
        const coloring = this.filters[QP_REGION_COLORING] || QP_REGION_COLORING_CAR;
        this.legend = REGION_COLORING_LEGEND[coloring];
        this.layerConfig['munis-fill'].paint = {
            'fill-color': REGION_COLORING_INTERPOLATE[coloring],
            'fill-opacity': 0.8
        };
        this.layerConfig['munis-border'].paint = {
            'line-color': '#ff871f',
            'line-opacity': 0.4
        };
        this.layerConfig['trees'] = new LayerConfig([
            '==', ['get', 'muni'], ['literal', this.id]
        ], null, null);
        this.legend = REGION_COLORING_LEGEND[coloring];
        this.filterItems = MUNI_FILTER_ITEMS;
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

