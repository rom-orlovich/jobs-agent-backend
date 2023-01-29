import { CheerioAPI, load, Element } from 'cheerio';

export class CheerioDom {
  $: CheerioAPI;
  constructor(html: string) {
    this.$ = load(html);
  }
  toArray(el: Element | string) {
    return this.$(el)
      .toArray()
      .map((el) => this.$(el));
  }
}
