import { SelectFilterItem, FilterOption, Legend, LegendItem } from "./base-state";

export const QP_REGION_COLORING = 'rc';
export const QP_REGION_COLORING_CAR = 'car';
export const QP_REGION_COLORING_QUALITY = 'quality';
export const QP_REGION_COLORING_CPC = 'cpc';

// Region Colorings
export const MUNI_COLORING_OPTIONS = new SelectFilterItem(
    QP_REGION_COLORING, 'הצגה:', [
        new FilterOption(QP_REGION_COLORING_CAR, 'לפי כיסוי חופות העצים'),
        new FilterOption(QP_REGION_COLORING_QUALITY, 'לפי איכות המידע'),
        new FilterOption(QP_REGION_COLORING_CPC, 'לפי שטח חופות עצים לנפש'),
    ]
);
export const STAT_AREA_COLORING_OPTIONS = new SelectFilterItem(
    QP_REGION_COLORING, 'הצגה:', [
        new FilterOption(QP_REGION_COLORING_CAR, 'לפי כיסוי חופות העצים'),
        new FilterOption(QP_REGION_COLORING_QUALITY, 'לפי איכות המידע'),
    ]
);
export const REGION_COLORING_INTERPOLATE: {[key: string]: any[]} = {};
REGION_COLORING_INTERPOLATE[QP_REGION_COLORING_QUALITY] = [
    'match', ['coalesce', ['get', 'quality_score'], 0],
    0, ['to-color', '#cccccc'],
    1, ['to-color', '#FFC700'],
    2, ['to-color', '#FF7F00'],
    3, ['to-color', '#00D315'],
    ['to-color', '#00D315'],
];
REGION_COLORING_INTERPOLATE[QP_REGION_COLORING_CAR] = [
    'interpolate', ['exponential', 0.01], ['get', 'canopy_area_ratio'],
    0, ['to-color', '#ccc'],
    0.05, ['to-color', '#acecc2'],
    0.4, ['to-color', '#155b2e'],
];
REGION_COLORING_INTERPOLATE[QP_REGION_COLORING_CPC] = [
    'interpolate', ['exponential', 0.99], ['get', 'canopy_per_capita'],
    0, ['to-color', '#ccc'],
    10, ['to-color', '#acecc2'],
    150, ['to-color', '#155b2e'],
];

export const REGION_COLORING_LEGEND: {[key: string]: Legend} = {};
REGION_COLORING_LEGEND[QP_REGION_COLORING_QUALITY] = new Legend('מקרא איכות המידע', [
    new LegendItem('#00D315', '3 מקורות מידע ומעלה'),
    new LegendItem('#FF7F00', '2 מקורות מידע'),
    new LegendItem('#FFC700', 'מקור מידע אחד'),
    new LegendItem('#cccccc', 'אין מידע כלל'),
], 'ככל שיש יותר מקורות מידע ניתן להצליב ולטייב נתונים ולשפר את איכות המידע');
REGION_COLORING_LEGEND[QP_REGION_COLORING_CAR] = new Legend('מקרא כיסוי חופות העצים', [
    new LegendItem('#155b2e', 'כיסוי גבוה'),
    new LegendItem('#3b7f53', ''),
    new LegendItem('#60a478', '↑', false, true),
    new LegendItem('#86c89d', ''),
    new LegendItem('#acecc2', 'כיסוי נמוך'),
    new LegendItem('#ccc', 'אין מידע', true),
], 'לפי מיפוי חופות עצים של מפ״י');
REGION_COLORING_LEGEND[QP_REGION_COLORING_CPC] = new Legend('מקרא שטח חופות עצים לנפש', [
    new LegendItem('#155b2e', 'כיסוי גבוה'),
    new LegendItem('#3b7f53', ''),
    new LegendItem('#60a478', '↑', false, true),
    new LegendItem('#86c89d', ''),
    new LegendItem('#acecc2', 'כיסוי נמוך'),
    new LegendItem('#ccc', 'אין מידע', true),
], 'כיסוי הצומח מחושב לפי מיפוי חופות עצים של מפ״י, אוכלוסיה לפי נתוני למ״ס 2020');

// Muni filtering
export const QP_MUNI_FILTER_SEI = 'sei';
export const QP_MUNI_FILTER_SEI_LOW = 'low';
export const QP_MUNI_FILTER_SEI_MID = 'mid';
export const QP_MUNI_FILTER_SEI_HIGH = 'high';
export const QP_MUNI_FILTER_SEI_ALL = 'all';

export const QP_MUNI_FILTER_PD = 'pd';
export const QP_MUNI_FILTER_PD_LOW = 'low';
export const QP_MUNI_FILTER_PD_MID = 'mid';
export const QP_MUNI_FILTER_PD_HIGH = 'high';
export const QP_MUNI_FILTER_PD_ALL = 'all';

export const MUNIS_FILTER_ITEMS = [
    MUNI_COLORING_OPTIONS,
    new SelectFilterItem(
        QP_MUNI_FILTER_SEI, 'לפי אשכול חברתי-כלכלי:', [
            new FilterOption(QP_MUNI_FILTER_SEI_ALL, 'כל האשכולות'),
            new FilterOption(QP_MUNI_FILTER_SEI_LOW, 'אשכולות 1-3'),
            new FilterOption(QP_MUNI_FILTER_SEI_MID, 'אשכולות 4-7'),
            new FilterOption(QP_MUNI_FILTER_SEI_HIGH, 'אשכולות 8-10'),
        ]
    ),
    new SelectFilterItem(
        QP_MUNI_FILTER_PD, 'לפי צפיפות אוכלוסיה:', [
            new FilterOption(QP_MUNI_FILTER_PD_ALL, 'הכל'),
            new FilterOption(QP_MUNI_FILTER_PD_LOW, '<1000 נפשות לקמ״ר'),
            new FilterOption(QP_MUNI_FILTER_PD_MID, '1000-5000 נפשות לקמ״ר'),
            new FilterOption(QP_MUNI_FILTER_PD_HIGH, '>5000 נפשות לקמ״ר'),
        ]
    )
];

export const MUNI_FILTER_ITEMS = [
    MUNI_COLORING_OPTIONS
];

export const STAT_AREA_FILTER_ITEMS = [
    STAT_AREA_COLORING_OPTIONS
];