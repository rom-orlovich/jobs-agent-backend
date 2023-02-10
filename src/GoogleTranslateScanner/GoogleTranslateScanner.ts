import throat from 'throat';

import { untilSuccess } from '../../lib/utils';
import { GoogleTranslateAPI, GoogleTranslateQuery } from './googleTranslateScanner';

import axios, { AxiosResponse } from 'axios';
import { GenericRecord } from '../../lib/types';

export class GoogleTranslate {
  queryOptions: GoogleTranslateQuery;
  //   profile: Profile;
  constructor(queryOptions: GoogleTranslateQuery) {
    this.queryOptions = queryOptions;
    // this.profile = profile;
  }

  getURL(text: string) {
    const { op, to, from } = this.queryOptions;
    const params = new URLSearchParams();
    params.append('client', 'gtx');
    params.append('sl', from || 'auto');
    params.append('tl', to);
    params.append('hl', 'en-US');
    params.append('dt', 't');
    params.append('dt', 'bd');
    params.append('dj', '1');
    params.append('source', 'bubble');
    params.append('tk', '322062.322062');
    params.append('q', text);

    return { params, url: 'https://translate.googleapis.com/translate_a/single' };
  }

  private transformToText(res: AxiosResponse<GoogleTranslateAPI>) {
    const data = res.data;
    const translateText = data.sentences.map((el) => el.trans).join('');
    return translateText;
  }

  async getTranslate(text: string): Promise<string> {
    const { params, url } = this.getURL(text);
    let res: undefined | AxiosResponse<GoogleTranslateAPI>;
    await untilSuccess(async () => {
      res = await axios<any, AxiosResponse<GoogleTranslateAPI>>(url, {
        params,
        headers: { authority: 'translate.googleapis.com' },
      });
    });
    if (!res) return '';

    return this.transformToText(res);
  }

  async translateArrayText<T extends GenericRecord<any>>(
    data: (T & { text: string })[],
    // profile: Profile
    throatNum = 5
  ) {
    // const { browser } = await PuppeteerSetup.lunchInstance({ args: ['--no-sandbox'], headless: true });
    const promises = data.map(
      throat(throatNum, async ({ text, ...rest }) => {
        // const newPage = await browser.newPage();
        const translateText = await this.getTranslate(text);
        // await newPage.close();
        const newJob = {
          ...rest,
          // reason: RequirementsReader.checkIsRequirementsMatch(translateText, profile).reason,
          text: translateText,
        };
        console.log(newJob);
        return newJob;
      })
    );

    const response = await Promise.all(promises);

    return response;
  }
}
