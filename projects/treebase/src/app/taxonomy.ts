export interface TaxonomyItem {
  description: string;
  name: string;
  title: string;
  type: string;
  unit?: string;
  options?: string[];
}

export const taxonomy: TaxonomyItem[] = [
  {
    "description": "שם היישוב בו מצוי העץ",
    "name": "location-city",
    "title": "שם יישוב",
    "type": "string"
  },
  {
    "description": "מזהה פנימי של העץ ברשות המקומית",
    "name": "meta-internal-id",
    "title": "מזהה פנימי",
    "type": "string"
  },
  {
    "description": "שם הרחוב הקרוב ביותר לעץ",
    "name": "location-street",
    "title": "שם רחוב",
    "type": "string"
  },
  {
    "description": "מספר הבית הקרוב ביותר לעץ",
    "name": "location-street-number",
    "title": "מספר בית",
    "type": "string"
  },
  {
    "description": "מידע נוסף הנוגע למיקום העץ",
    "name": "location-address",
    "title": "פרטי כתובת",
    "type": "string"
  },
  {
    "description": "מזהה הגוש בו מצוי העץ",
    "name": "location-block",
    "title": "גוש",
    "type": "string"
  },
  {
    "description": "מזהה החלקה בה מצוי העץ",
    "name": "location-plot",
    "title": "חלקה",
    "type": "string"
  },
  {
    "description": "גובה הקרקע מעל פני הים, במטרים",
    "name": "location-elevation",
    "title": "גובה מעל פני הים",
    "type": "number",
    "unit": "מ׳"
  },
  {
    "description": "תיאור המרחב המיידי של העץ",
    "name": "environment-type",
    "title": "מרחב העץ",
    "type": "string",
    "options": [
      "רחוב",
      "גינה/פארק ציבורי",
      "חורשה",
      "מוסד ציבורי",
      "מגרש פרטי"
    ]
  },
  {
    "description": "פרטים נוספים לגבי המרחב",
    "name": "environment-description",
    "title": "מרחב מפורט",
    "type": "string",
    "options": [
      "חצר פרטית – בלב השטח (4 מ' משטח ציבורי)",
      "חצר פרטית – צמוד דופן לשטח ציבורי (עד 4 מ' משטח ציבורי)",
      "מדרכה",
      "אי תנועה",
      "מתחת לקו מתח",
      "עץ בודד בשטח פתוח (מחוץ לישוב)",
      "עץ באזור מדברי/יבש בשטח פתוח (מחוץ לישוב)"
    ]
  },
  {
    "description": "בית הגידול של העץ",
    "name": "environment-habitat",
    "title": "בית הגידול",
    "type": "string",
    "options": [
      "ערוגה פתוחה",
      "גומת שתילה ברחוב",
      "בית גידול מוגבל (אספלט או חלוקי נחל וכו')",
      "מדשאה",
      "תעלת גידול",
      "מצע מנותק (מיכל)"
    ]
  },
  {
    "description": "נפח בית הגידול של העץ במ״ק",
    "name": "environment-habitat-volume",
    "title": "נפח בית הגידול",
    "type": "number",
    "unit": "מ״ק"
  },
  {
    "description": "האם העץ מושקה",
    "name": "environment-irrigated",
    "title": "השקיה פעילה",
    "type": "boolean"
  },
  {
    "description": "טיב המים המשקים את העץ",
    "name": "environment-irrigation-water-quality",
    "title": "איכות מי ההשקייה",
    "type": "string"
  },
  {
    "description": "האופן בו העץ מושקה",
    "name": "environment-irrigation-type",
    "title": "סוג ההשקיה",
    "type": "string",
    "options": [
      "קו ייחודי לעץ",
      "מושקה מהדשא",
      "מושקה מערוגה סמוכה"
    ]
  },
  {
    "description": "האם בסביבת העץ קיים איזור ישיבה",
    "name": "environment-sitting-area",
    "title": "איזור ישיבה",
    "type": "boolean"
  },
  {
    "description": "האם בסביבת העץ ישנה תאורה",
    "name": "environment-lighting",
    "title": "תאורה",
    "type": "boolean"
  },
  {
    "description": "האם בסביבת העץ קיימת מדשאה",
    "name": "environment-signage",
    "title": "שילוט",
    "type": "boolean"
  },
  {
    "description": "האם בסביבת העץ קיימת מדשאה",
    "name": "environment-grass",
    "title": "מדשאה",
    "type": "boolean"
  },
  {
    "description": "האם בסביבת העץ קיים ריצוף",
    "name": "environment-pavement",
    "title": "ריצוף",
    "type": "boolean"
  },
  {
    "description": "השנה בה ניטע העץ (או תאריך מדויק)",
    "name": "attributes-year-planted",
    "title": "מועד נטיעה",
    "type": "date"
  },
  {
    "description": "גיל העץ",
    "name": "attributes-age",
    "title": "גיל",
    "type": "number",
    "unit": "שנים"
  },
  {
    "description": "האם הגיל משוער או מדויק",
    "name": "attributes-age-estimated",
    "title": "גיל משוער?",
    "type": "boolean"
  },
  {
    "description": "סוג העץ",
    "name": "attributes-genus",
    "title": "סוג העץ",
    "type": "string"
  },
  {
    "description": "מין העץ",
    "name": "attributes-species",
    "title": "מין העץ",
    "type": "string"
  },
  {
    "description": "מספר הגזעים",
    "name": "attributes-num-barks",
    "title": "מספר גזעים",
    "type": "integer"
  },
  {
    "description": "קוטר הגזע, בס״מ",
    "name": "attributes-bark-diameter",
    "title": "קוטר הגזע",
    "type": "number",
    "unit": "ס״מ"
  },
  {
    "description": "היקף הגזע, בס״מ",
    "name": "attributes-bark-circumference",
    "title": "היקף הגזע",
    "type": "number",
    "unit": "ס״מ"
  },
  {
    "description": "גובה העץ, במטרים",
    "name": "attributes-height",
    "title": "גובה העץ",
    "type": "number",
    "unit": "מ׳"
  },
  {
    "description": "קוטר חופת הצמרת, במטרים",
    "name": "attributes-canopy-diameter",
    "title": "קוטר הצמרת",
    "type": "number",
    "unit": "מ׳"
  },
  {
    "description": "שטח הצמרת, במטרים רבועים",
    "name": "attributes-canopy-area",
    "title": "שטח הצמרת",
    "type": "number",
    "unit": "מ״ר"
  },
  {
    "description": "אבחנה גסה לגבי מצב ובריאות העץ",
    "name": "attributes-good-status",
    "title": "במצב טוב?",
    "type": "boolean"
  },
  {
    "description": "אבחנה יותר מדויקת לגבי בריאות העץ",
    "name": "attributes-health-score",
    "title": "בריאות העץ",
    "type": "integer",
    "options": ["1", "2", "3", "4", "5"]
  },
  {
    "description": "תיאור מילולי של מצב העץ",
    "name": "attributes-description",
    "title": "תיאור מילולי",
    "type": "string",
    "options": [
      "דלילות חופה",
      "התוונות ענפים בצמרת העץ",
      "ענפים שבורים בחופה",
      "שינויי צבע בעלוות העץ (הצהבות / החמות / כלורוזה...)",
      "מבנה לא תקין (כמו: ענפים בעלי זוויות חדות, קליפה כלואה)",
      "פציעות מכניות בגזע ובענפים",
      "סימני רקבון, צמג או שרף",
      "סימני גורמי מחלה (פטריות מדף, כתמי עלים וכו')",
      "סימני מזיקים (הימצאות מזיקים או סימניהם)",
      "חללים בגזע",
      "התרוממות שורשים",
      "רקבון צוואר שורש",
      "נטייה חדה במבנה העץ"
    ]
  },
  {
    "description": "האם לעץ יש חשיבות היסטורית, ומהי",
    "name": "importance-historic",
    "title": "חשיבות היסטורית",
    "type": "string"
  },
  {
    "description": "האם לעץ יש חשיבות סמלית, ומהי",
    "name": "importance-symbolic",
    "title": "חשיבות סמלית",
    "type": "string"
  },
  {
    "description": "האם לעץ יש חשיבות אסתטית, ומהי",
    "name": "importance-aesthetic",
    "title": "חשיבות אסתטית",
    "type": "string"
  },
  {
    "description": "האם לעץ יש חשיבות בוטנית, ומהי",
    "name": "importance-botanical",
    "title": "חשיבות בוטנית",
    "type": "string"
  },
  {
    "description": "האם לעץ יש חשיבות קהילתית, ומהי",
    "name": "importance-community",
    "title": "חשיבות קהילתית",
    "type": "string"
  },
  {
    "description": "תמונות כלליות / לא מקוטלגות של העץ",
    "name": "photos-general",
    "title": "תמונות כלליות",
    "type": "string"
  },
  {
    "description": "תמונות תקריב של גזע העץ",
    "name": "photos-bark",
    "title": "תמונות גזע",
    "type": "string"
  },
  {
    "description": "תמונות תקריב של עלי העץ",
    "name": "photos-leaf",
    "title": "תמונות עלה",
    "type": "string"
  },
  {
    "description": "תמונות תקריב של פרי העץ",
    "name": "photos-fruit",
    "title": "תמונות פרי",
    "type": "string"
  },
  {
    "description": "תמונות רחבות של העץ",
    "name": "photos-wide-view",
    "title": "תמונות מבט רחב",
    "type": "string"
  },
  {
    "description": "תמונות תקריב של תחתית הגזע של העץ",
    "name": "photos-ground",
    "title": "תמונות קרקע",
    "type": "string"
  },
  {
    "description": "תמונות של העץ במבט על",
    "name": "photos-top-view",
    "title": "תמונות אוויריות",
    "type": "string"
  }
];
