import { State, LayerConfig } from "./base-state";
import { TREE_COLOR_INTERPOLATE, TREE_COLOR_LEGEND, TREE_FILTER_ITEMS } from "./consts-trees";

export class TreeState extends State {
    constructor(id: string, filters: any) {
        super('tree', id, filters);
        this.sql = [`SELECT * FROM trees_processed WHERE "meta-tree-id" = '${this.id}'`];
        for (const id of ['trees', 'canopies']) {
            this.layerConfig[id] = new LayerConfig(null, null, null);
        }
        this.layerConfig['trees'].paint = {
            'circle-color': TREE_COLOR_INTERPOLATE,
            'circle-stroke-color': '#ff871f',
            'circle-stroke-width': [
                'case',
                ['==', ['get', 'tree-id'], ['literal', this.id]],
                3, 0
            ]
        };
        if (this.filters.certainty !== 'all') {
            this.layerConfig['trees'].filter = [
                'any', 
                ['==', ['get', 'certainty'], this.filters.certainty === 'certain'],
                ['==', ['get', 'tree-id'], ['literal', this.id]],
            ]
        }
        this.legend = TREE_COLOR_LEGEND;
        this.filterItems = TREE_FILTER_ITEMS;
    }

    override handleData(data: any[][]) {
        this.geo = {
            zoom: 20,
            center: [data[0][0]['location-x'], data[0][0]['location-y']]
        };
    }
}
