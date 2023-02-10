import axios from 'axios';

const params = new URLSearchParams();
params.append('client', 'gtx');
params.append('sl', 'iw');
params.append('tl', 'en');
params.append('hl', 'en-US');
params.append('dt', 't');
params.append('dt', 'bd');
params.append('dj', '1');
params.append('source', 'bubble');
params.append('tk', '322062.322062');
params.append(
  'q',
  `מדובר בחברה הפיתחה מוצר שמייעל ומקצר תהליכי מכירה של ביטוחים לעסקים, ספציפית בתחום של ביטוח סייבר. זהו תהליך ארוך ומסובך שהם יודעים לייעל בכמה לחיצות כפתור (חיסכון של כמה ימי עסקים וחיסכון רציני במחירי הביטוח). מדובר בפלטפורמת SaaS קלה מאוד לתפעול והמוצר הוא B2B2C, עם כמות לקוחות שהולכת וגדלה בכל רבעון וכך גם ההכנסות. הלקוחות העיקריים הם חברות קטנות וגדולות בארה"ב מצד אחד, וחברות הביטוח הענקיות מהצד השני. ממוקמים בתל אביב קו רכבת ומשלבים מודל עבודה היברידי. מונים 65 עובדים.
  מהות התפקיד- כניסה לצוות פיתוח, דיווח לראש צוות. ה-Backend כתוב ב-Python, ה-Frontend ב-React. התפקיד כולל פיתוח מקצה לקצה עם נטייה ל-Frontend (עד 80%, אפשר גם 50/50). עבודה על AWS, Microservices, NoSQL.`
);

const response = axios
  .get('https://translate.googleapis.com/translate_a/single', {
    params: params,
    headers: {
      authority: 'translate.googleapis.com',
      //   accept: '*/*',
      //   'accept-language': 'en-US,en;q=0.6',
      //   origin: 'https://www.drushim.co.il',
      //   referer: 'https://www.drushim.co.il/',
      //   'sec-fetch-dest': 'empty',
      //   'sec-fetch-mode': 'cors',
      //   'sec-fetch-site': 'cross-site',
      //   'sec-gpc': '1',
      //   'user-agent':
      //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    },
  })
  .then((data) => console.log(data.data.sentences.map((el: any) => el.trans)));
