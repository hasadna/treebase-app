import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

type IconInfo = {
  field?: string;
  text: string;
  icon: string;
  tooltip?: string;
  value?: string | ((record: any) => string | null);
  units?: string | ((record: any) => string);
};

const ICON_INFOS: IconInfo[] = [
  {
    text: 'מספר עצים',
    icon: 'tree-count',
    field: 'total_count',
    units: '',
  },
  {
    text: 'שטח חופות',
    icon: 'canopy-area',
    units: (row) => row.city_code ? 'דונם' : 'קמ"ר',
    value: (row) => (row.canopy_area / (row.city_code ? 1000 : 1000000)).toFixed(1),
  },
  {
    text: 'כיסוי חופות',
    icon: 'canopy-coverage',
    tooltip: 'סך החופות מסך שטח הרשות',
    units: '',
    value: (row) => (row.canopy_area_ratio * 100).toFixed(0) + '%',
  },
  {
    text: 'שטח',
    icon: 'area',
    units: (row) => row.city_code ? 'דונם' : 'קמ"ר',
    value: (row) => (row.area / (row.city_code ? 1000 : 1000000)).toFixed(1),
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
    units: '',
    value: (row) => (row.total_count && row.population) ? (row.total_count/row.population).toLocaleString(undefined, {maximumFractionDigits: 2}) : null,
  },
  {
    text: 'שטח חופות לנפש',
    icon: 'canopies-per-person',
    units: 'מ״ר',
    value: (row) => (row.canopy_area && row.population) ? (row.canopy_area/row.population).toFixed(2) : null,
  },
  {
    text: 'אשכול חברתי/כלכלי',
    icon: 'socioeconomic-index',
    tooltip: 'לפי נתוני למ״ס 2020',
    units: '',
    value: (row) => row.socioeconomic_index ? `${row.socioeconomic_index.toFixed(0)}/10` : null,
  },
  {
    text: 'צפיפות',
    icon: 'population-density',
    units: 'נפשות לקמ"ר',
    value: (row) => row.population_density?.toFixed(1),
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
  @Input() focus: string = '';
  @Input() focusLink: string = '';

  iconInfos: IconInfo[] = [];
  focusParams: any = {};

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
        let units = iconInfo.units;
        if (typeof units === 'function') {
          units = units(this.record);
        }
        if (value !== null && value !== undefined && units !== null && units !== undefined) {
          if (typeof value === 'number') {
            value = value.toLocaleString();
          }
          this.iconInfos.push({
            text: iconInfo.text,
            icon: iconInfo.icon,
            tooltip: iconInfo.tooltip,
            value, units,
          });
        }
      });
      console.log('REGION ICON_INFOS', this.iconInfos);
      this.focusParams = {
        focus: this.focus,
      };
    }
      
  }
}
