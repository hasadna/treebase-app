import { Component, Input, OnChanges } from '@angular/core';
import { MapboxService } from '../mapbox.service';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.less']
})
export class ExportComponent {

  @Input() query: string;

  FIELDS = [
    'meta-tree-id',
    'meta-collection-type',
    'meta-date',
    'meta-internal-id',
    'meta-source',
    'meta-source-type',
    'location-x',
    'location-y',
    'location-x-il',
    'location-y-il',
    'location-elevation',
    'cad_gush',
    'cad_parcel',
    'muni_code',
    'muni_name',
    'muni_name_en',
    'muni_region',
    'road_id',
    'road_type',
    'stat_area_code',
    'location-accuracy',
    'location-address',
    'location-city',
    'location-street',
    'location-street-number',
    'attributes-genus',
    'attributes-species-clean-en',
    'attributes-species-clean-he',
    'attributes-age',
    'attributes-age-estimated',
    'attributes-year-planted',
    'attributes-height',
    'attributes-bark-circumference',
    'attributes-bark-diameter',
    'attributes-num-barks',
    'attributes-canopy-area',
    'attributes-canopy-diameter',
    'attributes-good-status',
    'attributes-health-score',
    'attributes-description',
    'environment-type',
    'environment-description',
    'environment-habitat',
    'environment-habitat-volume',
    'environment-irrigated',
    'environment-irrigation-type',
    'environment-irrigation-water-quality',
    'environment-grass',
    'environment-lighting',
    'environment-pavement',
    'environment-signage',
    'environment-sitting-area',
    'importance-aesthetic',
    'importance-botanical',
    'importance-community',
    'importance-historic',
    'importance-symbolic',    
  ];
  HEADERS: {[key: string]: string} = {
    'meta-tree-id': 'מזעץ',
    'meta-collection-type': 'אופן איסוף המידע',
    'meta-date': 'תאריך',
    'meta-internal-id': 'מזהה פנימי',
    'meta-source': 'מקור המידע',
    'meta-source-type': 'סוג מקור המידע',
    'location-x': 'קו אורך',
    'location-y': 'קו רוחב',
    'location-x-il': 'קו אורך ישראלי',
    'location-y-il': 'קו רוחב ישראלי',
    'location-elevation': 'גובה מעל פני הים',
    'cad_gush': 'גוש',
    'cad_parcel': 'חלקה',
    'muni_code': 'סמל הרשות',
    'muni_name': 'שם הרשות',
    'muni_name_en': 'שם הרשות באנגלית',
    'muni_region': 'אזור הרשות',
    'road_id': 'שם רחוב',
    'road_type': 'סוג רחוב',
    'stat_area_code': 'קוד אזור סטטיסטי',
    'location-accuracy': 'דיוק מיקום',
    'location-address': 'כתובת',
    'location-city': 'שם היישוב',
    'location-street': 'רחוב',
    'location-street-number': 'מספר בית',
    'attributes-genus': 'סוג',
    'attributes-species-clean-en': 'שם מדעי באנגלית',
    'attributes-species-clean-he': 'שם מדעי בעברית',
    'attributes-age': 'גיל',
    'attributes-age-estimated': 'גיל משוער',
    'attributes-year-planted': 'שנת נטיעה',
    'attributes-height': 'גובה',
    'attributes-bark-circumference': 'היקף גזע',
    'attributes-bark-diameter': 'קוטר גזע',
    'attributes-num-barks': 'מספר גזעים',
    'attributes-canopy-area': 'שטח חופה',
    'attributes-canopy-diameter': 'קוטר חופה',
    'attributes-good-status': 'מצב טוב',
    'attributes-health-score': 'ציון בריאות',
    'attributes-description': 'תיאור כללי',
    'environment-type': 'מרחב העץ',
    'environment-description': 'מרחב מפורט',
    'environment-habitat': 'בית הגידול',
    'environment-habitat-volume': 'נפח בית הגידול',
    'environment-irrigated': 'השקיה פעילה',
    'environment-irrigation-type': 'סוג השקיה',
    'environment-irrigation-water-quality': 'איכות מי השקיה',
    'environment-grass': 'מדשאה',
    'environment-lighting': 'תאורה',
    'environment-pavement': 'ריצוף',
    'environment-signage': 'שילוט',
    'environment-sitting-area': 'אזור ישיבה',
    'importance-aesthetic': 'חשיבות אסתטית',
    'importance-botanical': 'חשיבות בוטנית',
    'importance-community': 'חשיבות קהילתית',
    'importance-historic': 'חשיבות היסטורית',
    'importance-symbolic': 'חשיבות סמלית',
  };
  fields = '';
  headers = '';

  constructor(private mapbox: MapboxService, private api: ApiService) {
    this.fields = `"${this.FIELDS.join('","')}"`
    this.headers = this.FIELDS.map(f => `${this.HEADERS[f] || 'x'}<${f}`).join(';');
  }

  downloadQuery() {
    if (!this.mapbox.map) {
      return '';
    }
    const bounds = this.mapbox.map.getBounds();
    const boundsCondition = `"location-x" > ${bounds.getWest()} AND "location-x" < ${bounds.getEast()} AND "location-y" > ${bounds.getSouth()} AND "location-y" < ${bounds.getNorth()}`;
    let query = this.query.replace(/__fields__/g, this.fields);
    query = query.replace(/__geo__/g, boundsCondition);
    return query;
  }

  downloadUrl() {
    const filename = 'tree-base-download-' + (new Date().toISOString().slice(0, 10));
    return this.api.downloadUrl(filename);
  }

}
