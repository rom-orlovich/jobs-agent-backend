import { BLACK_LIST_WORDS, WHITE_LIST_WORDS } from './LinkedinQueryOptions';

export interface QueryOptionsBaseProps {
  whiteList?: typeof WHITE_LIST_WORDS;
  blackList?: typeof BLACK_LIST_WORDS;
}

export class QueryOptionsBase implements QueryOptionsBaseProps {
  whiteList: typeof WHITE_LIST_WORDS;
  blackList: typeof BLACK_LIST_WORDS;
  constructor(queryOptions: QueryOptionsBaseProps) {
    this.whiteList = queryOptions.whiteList || [];
    this.blackList = queryOptions.blackList || [];
  }
  checkWordInWhiteList(word: string) {
    return (
      this.whiteList.length === 0 ||
      (this.whiteList?.length &&
        this.whiteList.some((bl) => {
          return word.toLowerCase().includes(bl.toLowerCase());
        }))
    );
  }

  checkWordInBlackList(word: string) {
    return (
      this.blackList?.length &&
      this.blackList?.some((bl) => {
        return word.toLowerCase().includes(bl.toLowerCase());
      })
    );
  }
}
