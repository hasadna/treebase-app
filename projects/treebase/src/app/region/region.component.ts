import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

type IconInfo = {
  field?: string;
  text: string;
  icon: string;
  value?: string | ((record: any) => string);
  units?: string | ((record: any) => string);
};

/*
שטח חופות (בא"ס בדונם, בעיר בקמ"ר)
שטח (בא"ס בדונם, בעיר בקמ"ר)
כיסוי חופות לפי שטח
במצב רשויות:
מס' תושבים
אשכול סוציואקונומי
צפיפות אוכלוסיה
מס' עצים לנפש
שטח חופות לנפש
מספר עצים בחלוקה למקור מידע + מקורות המידע
ניתוחים עתידיים (תלויי מידע שיתקבל, לא ימומשו בשלב ראשון)
ניתוח עדכניות מידע (היסטוגרמה של כמות עצים לפי מועד עדכון אחרון)
ניתוח נטיעות היסטורי (היסטוגרמה של כמות עצים לפי מועד עדכון ראשון)
מקורות המידע ומס' העצים שהופק מכל אחד מהם, כולל עדכניות
*/
const ICON_INFOS: IconInfo[] = [
  {
    text: 'כמות עצים',
    icon: 'tree-count',
    field: 'total_count',
    units: '',
  },
  {
    text: 'שטח חופות',
    icon: 'canopy-area',
    units: (row) => row.city_code ? 'דונם' : 'קמ"ר',
    value: (row) => (row.canopy_area / (row.city_code ? 1000 : 1000000)).toFixed(2),
  },
  {
    text: 'כיסוי חופות',
    icon: 'canopy-coverage',
    units: '',
    value: (row) => (row.canopy_area_ratio * 100).toFixed(0) + '%',
  },
  {
    text: 'שטח',
    icon: 'area',
    units: (row) => row.city_code ? 'דונם' : 'קמ"ר',
    value: (row) => (row.area / (row.city_code ? 1000 : 1000000)).toFixed(2),
  },
  {
    text: 'מס׳ תושבים',
    icon: 'population',
    field: 'population',
    units: '',
  },
  {
    text: 'מס׳ עצים לנפש',
    icon: 'trees-per-person',
    field: 'trees_per_person',
    units: '',
  },
  {
    text: 'שטח חופות לנפש',
    icon: 'canopies-per-person',
    field: 'canopy_area_per_person',
    units: 'קמ״ר',
  },
  {
    text: 'מדד סוציואקונומי',
    icon: 'socioeconomic-index',
    field: 'socioeconomic_index',
    units: '',
  },
  {
    text: 'צפיפות',
    icon: 'population-density',
    field: 'population_density',
    units: 'נפשות לקמ"ר',
  },
];

@Component({
  selector: 'app-region',
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.less']
})
export class RegionComponent implements OnChanges {
  @Input() record: any = null;
  @Input() sources: any[] = [];
  @Input() name: string = '';

  iconInfos: IconInfo[] = [];

  ngOnChanges(): void {
    if (this.record) {
      console.log('REGION RECORD', this.record);
      this.iconInfos = [];
      ICON_INFOS.forEach((iconInfo) => {
        let value: any | null = null;
        if (iconInfo.field) {
          value = this.record[iconInfo.field];
        } else if (typeof iconInfo.value === 'function') {
          value = iconInfo.value(this.record);
        }
        console.log('value 1', value);
        let units = iconInfo.units;
        if (typeof units === 'function') {
          units = units(this.record);
        }
        console.log('value 2', units);
        if (value !== null && value !== undefined && units !== null && units !== undefined) {
          if (typeof value === 'number') {
            value = value.toLocaleString();
          }
          this.iconInfos.push({
            text: iconInfo.text,
            icon: iconInfo.icon,
            value, units,
          });
        }
      });
      console.log('REGION ICON_INFOS', this.iconInfos);
    }
      
  }
}
