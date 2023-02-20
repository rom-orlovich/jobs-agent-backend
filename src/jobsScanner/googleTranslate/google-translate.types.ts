export type lang =
  | 'af'
  | 'sq'
  | 'am'
  | 'ar'
  | 'hy'
  | 'az'
  | 'eu'
  | 'be'
  | 'bn'
  | 'bs'
  | 'bg'
  | 'ca'
  | 'ceb'
  | 'zh-CN'
  | 'zh'
  | 'zh-TW'
  | 'co'
  | 'hr'
  | 'cs'
  | 'da'
  | 'nl'
  | 'en'
  | 'eo'
  | 'et'
  | 'fi'
  | 'fr'
  | 'fy'
  | 'gl'
  | 'ka'
  | 'de'
  | 'el'
  | 'gu'
  | 'ht'
  | 'ha'
  | 'haw'
  | 'he'
  | 'iw'
  | 'hi'
  | 'hmn'
  | 'hu'
  | 'is'
  | 'ig'
  | 'id'
  | 'ga'
  | 'it'
  | 'ja'
  | 'jv'
  | 'kn'
  | 'kk'
  | 'km'
  | 'rw'
  | 'ko'
  | 'ku'
  | 'ky'
  | 'lo'
  | 'la'
  | 'lv'
  | 'lt'
  | 'lb'
  | 'mk'
  | 'mg'
  | 'ms'
  | 'ml'
  | 'mt'
  | 'mi'
  | 'mr'
  | 'mn'
  | 'my'
  | 'ne'
  | 'no'
  | 'ny'
  | 'or'
  | 'ps'
  | 'fa'
  | 'pl'
  | 'pt'
  | 'pa'
  | 'ro'
  | 'ru'
  | 'sm'
  | 'gd'
  | 'sr'
  | 'st'
  | 'sn'
  | 'sd'
  | 'si'
  | 'sk'
  | 'sl'
  | 'so'
  | 'es'
  | 'su'
  | 'sw'
  | 'sv'
  | 'tl'
  | 'tg'
  | 'ta'
  | 'tt'
  | 'te'
  | 'th'
  | 'tr'
  | 'tk'
  | 'uk'
  | 'ur'
  | 'ug'
  | 'uz'
  | 'vi'
  | 'cy'
  | 'xh'
  | 'yi'
  | 'yo'
  | 'zu'
  | 'la';

export interface GoogleTranslateAPI {
  sentences: Sentence[];
  dict: Dict[];
  src: string;
  spell: any;
}

export interface Sentence {
  trans: string;
  orig: string;
  backend: number;
}

export interface Dict {
  pos: string;
  terms: string[];
  entry: Entry[];
  base_form: string;
  pos_enum: number;
}

export interface Entry {
  word: string;
  reverse_translation: string[];
  score?: number;
}
export interface GoogleTranslateQuery {
  op: 'translate' | 'docs';
  text?: string;
  from?: lang | 'auto';
  to: lang;
}
