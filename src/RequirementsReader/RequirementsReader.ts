import { GenericRecord } from '../../lib/types';

import { DataWithText } from '../JobsScanner/jobsScanner';
import { ExperienceRange } from '../Profile/profile';
import { Profile } from '../Profile/Profile';

export class RequirementsReader {
  static WORDS_COUNT_KILL = 500;

  static getSentences = (text: string) => {
    const sentences = text
      .split(/[.\n]+[^\w]/g) //split sentences.
      .filter((el) => el) //filter empty string.
      .map(
        (el) =>
          el
            .toLowerCase()
            .split(/,|\/| /g) // split ','| '/' and spaces between words.
            .filter((el) => el) // filter empty words.
      );

    return sentences;
  };
  private static convertWordToNumber(word: string) {
    const wordNumberDict: Record<string, string> = {
      zero: '0',
      one: '1',
      two: '2',
      three: '3',
      four: '4',
      five: '5',
      six: '6',
      seven: '7',
      eight: '8',
      eleven: '9',
      ten: '10',
    };
    return wordNumberDict[word];
  }
  private static getNumberRange(strRange: string) {
    if (strRange[1] !== '-') return;
    return strRange.split('-').map(Number);
  }

  private static getNumber(str: string) {
    const digit = str.match(/[\d]+/)?.[0];
    // console.log(digit);
    const num = Number(digit);

    return isFinite(num) ? [num] : undefined;
  }

  private static getPatternDigits(str: string) {
    const number = RequirementsReader.getNumber(str);
    if (number) return number;
    const range = RequirementsReader.getNumberRange(str);
    if (range) return range;
  }
  private static checkOverallExBiggerThanDigitMatch(digitMatch: number[], overallEx?: number) {
    if (digitMatch.length !== 1) return false;
    if (!overallEx) return false;
    if (overallEx < digitMatch[0]) return true;
  }

  private static checkOverallExInRange(range: number[], overallEx?: number) {
    if (range.length !== 2) return false;
    if (!overallEx) return false;
    if (!(range[0] <= overallEx && overallEx <= range[1])) return true;
  }

  private static checkDigitMatchIsBetLangEx(langEx: ExperienceRange, digitMatch: number[]) {
    if (digitMatch.length !== 1) return false;
    if (!(langEx.min <= digitMatch[0] && digitMatch[0] <= langEx.max)) return true;
  }

  private static checkLangExInRange(langEx: ExperienceRange, range: number[]) {
    if (range.length !== 2) return false;
    if (!(langEx.min >= range[0] && langEx.max <= range[1])) return true;
  }

  private static scanRequirements(sentences: string[][], profile: Profile) {
    let noneOfTechStackExist = false;
    let k = 0;
    if (sentences.length === 0) return { pass: false, reason: `No elements was found`, count: k };
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      let yearsIndex = -1;
      let digitMatch: number[] | undefined = undefined;
      let langEx;
      let startSearchLang = false;

      for (let j = 0; j < sentence.length; j++) {
        k++;
        // console.log(j, i, k);
        if (k === RequirementsReader.WORDS_COUNT_KILL) {
          console.log(
            `Cannot complete the evaluation of these requirements. Stop in word ${sentence[j]} number ${j} in line ${i},
            count ${k} words`
          );
          return {
            pass: false,
            reason: `Cannot complete the evaluation of these requirements. Stop in word ${sentence[j]} number ${j} in line ${i}, count ${k} words`,
            count: k,
          };
        }

        const convertToNum = RequirementsReader.convertWordToNumber(sentence[j]);
        const word = convertToNum ? convertToNum : sentence[j];

        const excludeTech = profile.getExcludeTech(word);
        // console.log(word, excludeTech);
        if (excludeTech) return { pass: false, reason: `${word} is not in your stack`, count: k };

        langEx = profile.getRequirement(word);

        if (langEx) noneOfTechStackExist = true;

        if (!digitMatch)
          if (j < sentence.length - 1 && sentence[j + 1].includes('year'))
            digitMatch = RequirementsReader.getPatternDigits(word);

        if (digitMatch) {
          if (this.checkOverallExInRange(digitMatch, profile.overallEx))
            return {
              pass: false,
              reason: `Your ${profile.overallEx} years experience is not in the range ${digitMatch[0]}-${digitMatch[1]}`,
              count: k,
            };

          if (this.checkOverallExBiggerThanDigitMatch(digitMatch, profile.overallEx))
            return {
              pass: false,
              reason: `Your ${profile.overallEx} years experience is lower than ${digitMatch[0]} years`,
              count: k,
            };

          if (!startSearchLang) {
            yearsIndex = j; // save the last time index when digit of years was display.
            j = -1;
            startSearchLang = true;
          }

          if (langEx) {
            if (this.checkLangExInRange(langEx, digitMatch))
              return {
                pass: false,
                reason: `Your ${langEx.min}-${langEx.max} years experience in ${word} is not in the range between ${digitMatch[0]}-${digitMatch[1]} years.`,
                count: k,
              };
            if (this.checkDigitMatchIsBetLangEx(langEx, digitMatch))
              return {
                pass: false,
                reason: `Your ${langEx.min}-${langEx.max} years experience in ${word} is not match to ${digitMatch[0]} years experience.`,
                count: k,
              };
            langEx = undefined;
            digitMatch = undefined;
            j = yearsIndex + 1; // move to the next word after the last position match with the years experience.
            yearsIndex = -1;
            startSearchLang = false;
          }
        }
      }
      digitMatch = undefined;
      langEx = undefined;
      yearsIndex = -1;
      startSearchLang = false;
    }

    if (!noneOfTechStackExist)
      return { pass: false, reason: 'This job is not contain any word from you tech stack', count: k };
    console.log('finish scanRequirements');
    return { pass: true, count: k };
  }

  static checkIsRequirementsMatch(html: string | string[][], profile: Profile) {
    const sentences = typeof html === 'string' ? RequirementsReader.getSentences(html) : html;
    const isRequirementsMatch = RequirementsReader.scanRequirements(sentences, profile);
    return isRequirementsMatch;
  }
  static checkRequirementMatchForArray<T extends GenericRecord<any>>(
    data: DataWithText<T>[],
    profile: Profile
  ) {
    return data.map((el) => {
      const reason = RequirementsReader.checkIsRequirementsMatch(el.text, profile).reason;

      return {
        ...el,
        reason,
      };
    });
  }
}

export type checkIsRequirementsMatchRes = ReturnType<
  (typeof RequirementsReader)['checkIsRequirementsMatch']
>;
