import { Page } from 'puppeteer';
import throat from 'throat';
import { Profile } from '../Profile/Profile';
import { PuppeteerSetup } from '../../lib/PuppeteerSetup';
import { RequirementsReader } from '../RequirementsReader/RequirementsReader';

import { untilSuccess } from '../../lib/utils';
import { GoogleTranslateQuery } from './googleTranslateScanner';
import { JobPost } from '../JobScan/jobScan';
import axios, { AxiosResponse } from 'axios';
import { GenericRecord } from '../../lib/types';
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

export class GoogleTranslate2 {
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

  //   getURL(text?: string): string {
  //     const { to, op } = this.queryOptions;
  //     if (!text) return '';
  //     const from: string = this.queryOptions.from || 'auto';
  //     if (op === 'translate') {
  //       if (text.length > 5000) return '';
  //       if (text.length === 0) return '';
  //     }
  //     return `https://translate.googleapis.com/translate_a/single?text=${encodeURIComponent(
  //       text
  //     )}&sl=${from}&tl=${to}&op=${op}`;
  //   }

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
