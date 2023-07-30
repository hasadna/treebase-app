import { Legend, LegendItem, CheckFilterItem, SelectFilterItem, FilterOption } from "./base-state";

export const QP_CANOPIES = 'canopies';
export const QP_CADASTER = 'cadaster';

export const QP_CERTAINTY = 'certainty';
export const QP_CERTAINTY_ALL = 'all';
export const QP_CERTAINTY_CERTAIN = 'certain';
export const QP_CERTAINTY_SUSPECTED = 'suspected';

export const QP_CANOPIES_ALL = '1';
export const QP_CANOPIES_MATCHED = 'matched';
export const QP_CANOPIES_LIKELY = 'likely';
export const QP_CANOPIES_MATCHED_LIKELY = 'matched+likely';
export const QP_CANOPIES_NONE = '0';

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
    new SelectFilterItem(QP_CANOPIES, 'הצגת חופות:', [
        new FilterOption(QP_CANOPIES_ALL, 'הצגת כל החופות'),
        new FilterOption(QP_CANOPIES_MATCHED, 'הצגת רק חופות שהותאמו לעץ מזוהה'),
        new FilterOption(QP_CANOPIES_LIKELY, 'הצגת רק החופות החשודות כעץ'),
        new FilterOption(QP_CANOPIES_MATCHED_LIKELY, 'הצגת רק חופות שהותאמו לעץ כלשהו'),
        new FilterOption(QP_CANOPIES_NONE, 'הסתרת כל החופות'),
    ]),
    new CheckFilterItem(QP_CADASTER, 'הצגת גוש/חלקה'),
    new SelectFilterItem(QP_CERTAINTY, 'הצגת עצים:', [
        new FilterOption(QP_CERTAINTY_ALL, 'כל העצים'),
        new FilterOption(QP_CERTAINTY_CERTAIN, 'רק עצים מזוהים'),
        new FilterOption(QP_CERTAINTY_SUSPECTED, 'רק עצים חשודים'),
    ]),
];