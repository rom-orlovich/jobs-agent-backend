import { Cheerio, Element } from 'cheerio';
import { CheerioDom } from './CheerioDom';
import { Profile } from './Profile';

class RequirementsReader {
  cheerioDom: CheerioDom;
  elements: Cheerio<Element>[];
  profile: Profile;
  constructor(profile: Profile, html: string, queryEl: string) {
    this.cheerioDom = new CheerioDom(html);
    this.elements = this.cheerioDom.toArray(queryEl);
    this.profile = profile;
  }
  private getSentences = () => {
    const nodes = this.elements.filter((el) => {
      return el.text();
    });
    const sentences = nodes.map((el) =>
      el
        .text()
        .split(' ')
        .filter((el) => !!el)
    );
    return sentences;
  };
  private checkExcludeTech(word: string) {
    if (this.profile.getExcludeTech(word)) {
      return false;
    }
    return true;
  }

  private checkNumberIsLowerTheRange(numCheck: number | undefined, range: RegExpMatchArray) {
    if (range[0][1] === '-') {
      const [min, max] = range[0].split('-');
      if (numCheck && Number(min) > numCheck) return true;
    }
  }

  private checkDigitMatchIsBigger(numCheck: number | undefined, digitMatch: RegExpMatchArray) {
    const yearNum = Number(digitMatch[0]);
    if (numCheck && yearNum > numCheck) return true;
  }

  isJobValid() {
    const sentences = this.getSentences();
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      let yearsIndex = -1;
      let digitMatch: RegExpMatchArray | null = null;
      let languageMatch;
      for (let j = 0; j < sentence.length; j++) {
        const word = sentence[j];
        // Check if the word is include in the excluded tech

        this.checkExcludeTech(word);
        // Check a match of digit is already exist.
        if (!digitMatch) {
          digitMatch = word.match(/\d\d|\d-\d|\d/g);

          // Check if there is match.
          // If it does check if the next word contains the word 'year'.
          if (digitMatch && j < sentence.length - 1 && sentence[j + 1].match(/year/)) {
            // Check if the match is range.
            // if (digitMatch[0][1] === '-') {
            //   const [min, max] = digitMatch[0].split('-');
            //   if (
            //     this.profile.overallEx &&
            //     Number(min) > this.profile.overallEx
            //   )
            //     return false;
            // }
            if (this.checkNumberIsLowerTheRange(this.profile.overallEx, digitMatch)) return false;
            // if (
            //   this.profile.overallEx &&
            //   Number(digitMatch[0]) > this.profile.overallEx
            // )
            //   return false;
            // Check if the overallEx is smaller than digitMatch.
            if (this.checkDigitMatchIsBigger(this.profile.overallEx, digitMatch)) return false;
            yearsIndex = j;
            j = 0;
          }
        }

        const langEx = this.profile.getRequirement(word);
        if (langEx) languageMatch = langEx;

        // Check if there is language  and digit were match.
        if (languageMatch && digitMatch) {
          if (this.checkNumberIsLowerTheRange(languageMatch.max, digitMatch)) return false;
          //   if (digitMatch[0][1] === '-') {
          //     const [min, max] = digitMatch[0].split('-');
          //     if (Number(min) > memo.max) return false;
          //   }
          //   const yearNum = Number(digitMatch[0]);

          //   if (yearNum > memo.max) {
          //     return false;
          // }
          if (this.checkDigitMatchIsBigger(languageMatch.max, digitMatch)) return false;
          else {
            j = yearsIndex + 1;
            yearsIndex = -1;
          }
          digitMatch = null;
        }
      }
      digitMatch = null;
      languageMatch = undefined;
    }
  }
}
