import { Legend, LegendItem, CheckFilterItem, SelectFilterItem, FilterOption } from "./base-state";

export const QP_CANOPIES = 'canopies';
export const QP_CADASTER = 'cadaster';

export const QP_CERTAINTY = 'certainty';
export const QP_CERTAINTY_ALL = 'all';
export const QP_CERTAINTY_CERTAIN = 'certain';
export const QP_CERTAINTY_SUSPECTED = 'suspected';

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
    new CheckFilterItem(QP_CANOPIES, 'הצגת חופות'),
    new CheckFilterItem(QP_CADASTER, 'הצגת גוש/חלקה'),
    new SelectFilterItem(QP_CERTAINTY, 'הצגת עצים:', [
        new FilterOption(QP_CERTAINTY_ALL, 'כל העצים'),
        new FilterOption(QP_CERTAINTY_CERTAIN, 'רק עצים מזוהים'),
        new FilterOption(QP_CERTAINTY_SUSPECTED, 'רק עצים חשודים'),
    ]),
];