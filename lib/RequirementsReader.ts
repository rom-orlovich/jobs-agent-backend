import { Cheerio, Element } from 'cheerio';
import { CheerioDom } from './CheerioDom';
import { Profile } from './Profile';

export class RequirementsReader {
  profile: Profile;
  constructor(profile: Profile) {
    this.profile = profile;
  }
  getSentences = (html: string, queryEl: string) => {
    const cheerioDom = new CheerioDom(html);
    const elements = cheerioDom.toArray(queryEl);
    const nodes = elements.filter((el) => {
      return el.text();
    });
    const sentences = nodes.map((el) =>
      el
        .text()
        .split(' ')
        .filter((el) => !!el)
    );

    console.log(sentences);
    return sentences;
  };
  private checkExcludeTech(word: string) {
    if (this.profile.getExcludeTech(word)) {
      return true;
    }
    return false;
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

  isJobValid(sentences: string[][]) {
    if (sentences.length === 0) return false;
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      let yearsIndex = -1;
      let digitMatch: RegExpMatchArray | null = null;
      let languageMatch;

      for (let j = 0; j < sentence.length; j++) {
        const word = sentence[j];

        // Check if the word is include in the excluded tech
        if (this.checkExcludeTech(word)) return false;

        // Check a match of digit is already exist.
        if (!digitMatch) {
          digitMatch = word.match(/\d\d|\d-\d|\d/g);

          // Check if there is match.
          // If it does check if the next word contains the word 'year'.
          if (digitMatch && j < sentence.length - 1 && sentence[j + 1].match(/year/)) {
            // Check if the match is range.
            if (this.checkNumberIsLowerTheRange(this.profile.overallEx, digitMatch)) return false;
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
    return true;
  }
}
