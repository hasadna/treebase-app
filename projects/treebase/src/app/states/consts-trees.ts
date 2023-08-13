import { Legend, LegendItem, CheckFilterItem, SelectFilterItem, FilterOption } from "./base-state";

export const QP_CANOPIES = 'canopies';
export const QP_CADASTER = 'cadaster';

export const QP_TREE_STATUS = 'ts';
export const QP_TREE_STATUS_ALL = 'all';
export const QP_TREE_STATUS_CERTAIN = 'certain';
export const QP_TREE_STATUS_SUSPECTED = 'suspected';
export const QP_TREE_STATUS_UNREPORTED = 'unreported';

export const QP_TREE_STATUS_FILTER: any = {};
QP_TREE_STATUS_FILTER[QP_TREE_STATUS_CERTAIN] = ['==', ['get', 'certainty'], true];
QP_TREE_STATUS_FILTER[QP_TREE_STATUS_SUSPECTED] = ['==', ['get', 'certainty'], false];
QP_TREE_STATUS_FILTER[QP_TREE_STATUS_UNREPORTED] = ['==', ['get', 'unreported'], true];

export const QP_CANOPIES_ALL = '1';
export const QP_CANOPIES_MATCHED = 'matched';
export const QP_CANOPIES_LIKELY = 'likely';
export const QP_CANOPIES_MATCHED_LIKELY = 'matched+likely';
export const QP_CANOPIES_NONE = '0';

export const QP_BARK_DIAMETER = 'bd';
export const QP_BARK_DIAMETER_ALL = 'all';
export const QP_BARK_DIAMETER_0_10 = '0-10';
export const QP_BARK_DIAMETER_10_20 = '10-20';
export const QP_BARK_DIAMETER_20_30 = '20-30';
export const QP_BARK_DIAMETER_30_45 = '30-45';
export const QP_BARK_DIAMETER_45_60 = '45-60';
export const QP_BARK_DIAMETER_60 = '60';

export const QP_CANOPY_AREA = 'ca'; 
export const QP_CANOPY_AREA_ALL = 'all';
export const QP_CANOPY_AREA_0_4 = '0-4';
export const QP_CANOPY_AREA_4_8 = '4-8';
export const QP_CANOPY_AREA_8 = '8';

export const QP_TREE_HEIGHT = 'th';
export const QP_TREE_HEIGHT_ALL = 'all';
export const QP_TREE_HEIGHT_0_5 = '0-5';
export const QP_TREE_HEIGHT_5_12 = '5-12';
export const QP_TREE_HEIGHT_12_18 = '12-18';
export const QP_TREE_HEIGHT_18 = '18';

export const TREE_COLOR_INTERPOLATE = [
    'case', ['get', 'certainty'],
    ['to-color', '#204E37'],
    ['to-color', '#64B883'],
];
export const TREE_COLOR_LEGEND = new Legend('מקרא וודאות זיהוי', [
    new LegendItem('#204E37', 'עץ מזוהה'),
    new LegendItem('#64B883', 'חשד לעץ'),
]);

export const TREE_FILTER_ITEMS = [
    new SelectFilterItem(QP_TREE_STATUS, 'הצגת עצים:', [
        new FilterOption(QP_TREE_STATUS_ALL, 'כל העצים'),
        new FilterOption(QP_TREE_STATUS_CERTAIN, 'רק עצים מזוהים'),
        new FilterOption(QP_TREE_STATUS_SUSPECTED, 'רק עצים חשודים'),
        new FilterOption(QP_TREE_STATUS_UNREPORTED, 'רק עצים שלא דווחו לרשות המים'),
    ]),
    new SelectFilterItem(QP_CANOPIES, 'הצגת חופות:', [
        new FilterOption(QP_CANOPIES_ALL, 'הצגת כל החופות'),
        new FilterOption(QP_CANOPIES_MATCHED, 'הצגת רק חופות שהותאמו לעץ מזוהה'),
        new FilterOption(QP_CANOPIES_LIKELY, 'הצגת רק החופות החשודות כעץ'),
        new FilterOption(QP_CANOPIES_MATCHED_LIKELY, 'הצגת רק חופות שהותאמו לעץ כלשהו'),
        new FilterOption(QP_CANOPIES_NONE, 'הסתרת כל החופות'),
    ]),
    new SelectFilterItem(QP_BARK_DIAMETER, 'קוטר גזע:', [
        new FilterOption(QP_BARK_DIAMETER_ALL, 'הכל'),
        new FilterOption(QP_BARK_DIAMETER_0_10, '0-10 ס"מ'),
        new FilterOption(QP_BARK_DIAMETER_10_20, '10-20 ס"מ'),
        new FilterOption(QP_BARK_DIAMETER_20_30, '20-30 ס"מ'),
        new FilterOption(QP_BARK_DIAMETER_30_45, '30-45 ס"מ'),
        new FilterOption(QP_BARK_DIAMETER_45_60, '45-60 ס"מ'),
        new FilterOption(QP_BARK_DIAMETER_60, 'מעל 60 ס"מ'),
    ]),
    new SelectFilterItem(QP_CANOPY_AREA, 'שטח חופת העץ:', [
        new FilterOption(QP_CANOPY_AREA_ALL, 'הכל'),
        new FilterOption(QP_CANOPY_AREA_0_4, 'עד 4 מ"ר'),
        new FilterOption(QP_CANOPY_AREA_4_8, '4-8 מ"ר'),
        new FilterOption(QP_CANOPY_AREA_8, 'מעל 8 מ"ר'),
    ]),
    new SelectFilterItem(QP_TREE_HEIGHT, 'גובה העץ:', [
        new FilterOption(QP_TREE_HEIGHT_ALL, 'הכל'),
        new FilterOption(QP_TREE_HEIGHT_0_5, 'עד 5 מ"ר'),
        new FilterOption(QP_TREE_HEIGHT_5_12, '5-12 מ"ר'),
        new FilterOption(QP_TREE_HEIGHT_12_18, '12-18 מ"ר'),
        new FilterOption(QP_TREE_HEIGHT_18, 'מעל 18 מ"ר'),
    ]),
    new CheckFilterItem(QP_CADASTER, 'הצגת גוש/חלקה'),
];

export const QP_BARK_DIAMETER_FILTERS: any = {};
QP_BARK_DIAMETER_FILTERS[QP_BARK_DIAMETER_0_10] = ['all', ['>', ['to-number', ['get', 'bark_diameter']], 0], ['<=', ['to-number', ['get', 'bark_diameter']], 10]];
QP_BARK_DIAMETER_FILTERS[QP_BARK_DIAMETER_10_20] = ['all', ['>', ['to-number', ['get', 'bark_diameter']], 10], ['<=', ['to-number', ['get', 'bark_diameter']], 20]];
QP_BARK_DIAMETER_FILTERS[QP_BARK_DIAMETER_20_30] = ['all', ['>', ['to-number', ['get', 'bark_diameter']], 20], ['<=', ['to-number', ['get', 'bark_diameter']], 30]];
QP_BARK_DIAMETER_FILTERS[QP_BARK_DIAMETER_30_45] = ['all', ['>', ['to-number', ['get', 'bark_diameter']], 30], ['<=', ['to-number', ['get', 'bark_diameter']], 45]];
QP_BARK_DIAMETER_FILTERS[QP_BARK_DIAMETER_45_60] = ['all', ['>', ['to-number', ['get', 'bark_diameter']], 45], ['<=', ['to-number', ['get', 'bark_diameter']], 60]];
QP_BARK_DIAMETER_FILTERS[QP_BARK_DIAMETER_60] = ['>', ['to-number', ['get', 'bark_diameter']], 60];

export const QP_BARK_DIAMETER_WHERE: any = {};
QP_BARK_DIAMETER_WHERE[QP_BARK_DIAMETER_0_10] = '"attributes-bark-diameter" > 0 AND "attributes-bark-diameter" <= 10';
QP_BARK_DIAMETER_WHERE[QP_BARK_DIAMETER_10_20] = '"attributes-bark-diameter" > 10 AND "attributes-bark-diameter" <= 20';
QP_BARK_DIAMETER_WHERE[QP_BARK_DIAMETER_20_30] = '"attributes-bark-diameter" > 20 AND "attributes-bark-diameter" <= 30';
QP_BARK_DIAMETER_WHERE[QP_BARK_DIAMETER_30_45] = '"attributes-bark-diameter" > 30 AND "attributes-bark-diameter" <= 45';
QP_BARK_DIAMETER_WHERE[QP_BARK_DIAMETER_45_60] = '"attributes-bark-diameter" > 45 AND "attributes-bark-diameter" <= 60';
QP_BARK_DIAMETER_WHERE[QP_BARK_DIAMETER_60] = '"attributes-bark-diameter" > 60';

export const QP_CANOPY_AREA_FILTERS: any = {};
QP_CANOPY_AREA_FILTERS[QP_CANOPY_AREA_0_4] = ['all', ['>', ['to-number', ['get', 'canopy_area']], 0], ['<=', ['to-number', ['get', 'canopy_area']], 4]];
QP_CANOPY_AREA_FILTERS[QP_CANOPY_AREA_4_8] = ['all', ['>', ['to-number', ['get', 'canopy_area']], 4], ['<=', ['to-number', ['get', 'canopy_area']], 8]];
QP_CANOPY_AREA_FILTERS[QP_CANOPY_AREA_8] = ['>', ['to-number', ['get', 'canopy_area']], 8];

export const QP_CANOPY_AREA_WHERE: any = {};
QP_CANOPY_AREA_WHERE[QP_CANOPY_AREA_0_4] = '"attributes-canopy-area" > 0 AND "attributes-canopy-area" <= 4';
QP_CANOPY_AREA_WHERE[QP_CANOPY_AREA_4_8] = '"attributes-canopy-area" > 4 AND "attributes-canopy-area" <= 8';
QP_CANOPY_AREA_WHERE[QP_CANOPY_AREA_8] = '"attributes-canopy-area" > 8';

export const QP_TREE_HEIGHT_FILTERS: any = {};
QP_TREE_HEIGHT_FILTERS[QP_TREE_HEIGHT_0_5] = ['all', ['>', ['to-number', ['get', 'height']], 0], ['<=', ['to-number', ['get', 'height']], 5]];
QP_TREE_HEIGHT_FILTERS[QP_TREE_HEIGHT_5_12] = ['all', ['>', ['to-number', ['get', 'height']], 5], ['<=', ['to-number', ['get', 'height']], 12]];
QP_TREE_HEIGHT_FILTERS[QP_TREE_HEIGHT_12_18] = ['all', ['>', ['to-number', ['get', 'height']], 12], ['<=', ['to-number', ['get', 'height']], 18]];
QP_TREE_HEIGHT_FILTERS[QP_TREE_HEIGHT_18] = ['>', ['to-number', ['get', 'height']], 18];

export const QP_TREE_HEIGHT_WHERE: any = {};
QP_TREE_HEIGHT_WHERE[QP_TREE_HEIGHT_0_5] = '"attributes-height" > 0 AND "attributes-height" <= 5'
QP_TREE_HEIGHT_WHERE[QP_TREE_HEIGHT_5_12] = '"attributes-height" > 5 AND "attributes-height" <= 12'
QP_TREE_HEIGHT_WHERE[QP_TREE_HEIGHT_12_18] = '"attributes-height" > 12 AND "attributes-height" <= 18'
QP_TREE_HEIGHT_WHERE[QP_TREE_HEIGHT_18] = '"attributes-height" > 18'