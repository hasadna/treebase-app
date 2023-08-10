export class FocusMode {
    constructor(public kind: string, public label: string, public code: string, public name?: string) {}

    toQueryParam(): string {
        const ret = `${this.kind}:${this.code}`;
        if (this.name) {
            return `${ret}:${this.name}`;
        } else {
            return ret;
        }
    }

    display(): string {
        return `<span class='kind'>${this.label ? this.label + ':' : ''}</span>&nbsp;<strong>${this.name || this.code}</strong>`;
    }

    boundsQuery(): string|null {
        return null;
    }

    treesQuery(): string|null {
        return null;
    }

    mapFilters(): {[key: string]: any[]} {
        return {};
    }

    polygonGeometry(): null | {type: string, coordinates: number[][][]} {
        return null;
    }

    static fromQueryParam(queryParam: string): FocusMode | null {
        const parts = queryParam.split(':');
        if (parts.length >= 2) {
            if (parts[0] === 'muni') {
                return new MuniFocusMode(parts[1], parts[2]);
            } else if (parts[0] === 'stat-area') {
                return new StatAreaFocusMode(parts[1]);
            } else if (parts[0] === 'parcel') {
                return new ParcelFocusMode(parts[1]);
            } else if (parts[0] === 'road') {
                return new RoadFocusMode(parts[1]);
            } else if (parts[0] === 'polygon') {
                return new PolygonFocusMode(parts[1]);
            }
        }
        return null;
    }
}

export class MuniFocusMode extends FocusMode {
    constructor(code: string, name: string) {
        super('muni', 'רשות מקומית', code, name);
    }

    override mapFilters(): { [key: string]: any[]; } {
        return {trees: ['==', ['to-string', ['get', 'muni']], ['literal', this.code]]};
    }

    override boundsQuery(): string|null {
        return `SELECT bounds FROM munis WHERE muni_code='${this.code}'`;
    }

    override treesQuery(): string|null {
        return `muni_code='${this.code}'`;
    }
}

export class StatAreaFocusMode extends FocusMode {
    constructor(code: string) {
        super('stat-area', 'אזור סטטיסטי', code);
    }

    override mapFilters(): { [key: string]: any[]; } {
        return {trees: ['==', ['to-string', ['get', 'stat_area']], ['literal', this.code]]};
    }

    override boundsQuery(): string|null {
        return `SELECT bounds FROM stat_areas WHERE code='${this.code}'`;
    }

    override treesQuery(): string|null {
        return `stat_area_code='${this.code}'`;
    }
}

export class ParcelFocusMode extends FocusMode {
    constructor(code: string) {
        super('parcel', 'גוש/חלקה', code);
    }

    override mapFilters(): { [key: string]: any[]; } {
        return {trees: ['==', ['to-string', ['get', 'cad']], ['literal', this.code]]};
    }

    override boundsQuery(): string|null {
        return `SELECT bounds FROM parcels WHERE code='${this.code}'`;
    }

    override treesQuery(): string|null {
        return `cad_code='${this.code}'`;
    }
}

export class RoadFocusMode extends FocusMode {
    constructor(code: string) {
        super('road', 'רחוב', code);
    }

    override mapFilters(): { [key: string]: any[]; } {
        return {
            trees: ['==', ['to-string', ['get', 'road']], ['literal', this.code]],
            'roads-border': ['==', ['to-string', ['get', 'road_id']], ['literal', this.code]]
        };
    }

    override boundsQuery(): string|null {
        return `SELECT bounds FROM roads WHERE road_id='${this.code}'`;
    }

    override treesQuery(): string|null {
        return `road_id='${this.code}'`;
    }
}


export class PolygonFocusMode extends FocusMode {
    geometry: { type: string; coordinates: number[][][]; };
    constructor(coordinates: string) {
        super('polygon', '', 'הפוליגון הנבחר');
        let coords = coordinates.split(';').map((p) => p.split(',').map((c) => parseFloat(c)));
        this.geometry = {
            type: 'Polygon',
            coordinates: [coords]
        };
    }

    override mapFilters(): { [key: string]: any[]; } {
        return {
            trees: ['within', this.geometry]
        };
    }

    override boundsQuery(): string|null {
        return null;
    }

    override treesQuery(): string|null {
        return `ST_Contains(
            ST_GeomFromGeoJSON('${JSON.stringify(this.geometry)}'),
            ST_SetSRID(ST_MakePoint("location-x", "location-y"), 4326)
        )`;
    }

    override polygonGeometry(): null | { type: string; coordinates: number[][][]; } {
        return this.geometry;
    }
}

