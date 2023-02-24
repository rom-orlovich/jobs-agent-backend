import { Job } from '../../../mongoDB/jobsDB/jobsDB.types';

import { ExperienceRange, UserEntity } from '../user/userEntity.types';

export class RequirementsReader {
  static WORDS_COUNT_KILL = 500;

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
  /**
   *
   * @param strRange {string} 'min-max'
   * @returns {Array} of numbers representing the range (e.g. min-max) as [min,max].
   * @description It checks that the string is in the correct format (i.e. that the second character is a hyphen) before splitting the string and mapping the resulting array to numbers.
   */
  private static getNumberRange(strRange: string) {
    if (strRange[1] !== '-') return;
    return strRange.split('-').map(Number);
  }

  private static getNumber(str: string) {
    const digit = str.match(/[\d]+/)?.[0];

    const num = Number(digit);

    return isFinite(num) ? [num] : undefined;
  }

  private static getPatternDigits(str: string) {
    const number = RequirementsReader.getNumber(str);
    if (number) return number;
    const range = RequirementsReader.getNumberRange(str);
    if (range) return range;
  }
  private static checkOverallExBiggerThanDigitMatch(digitsPattern: number[], overallEx?: number) {
    if (digitsPattern.length !== 1) return false;
    if (!overallEx) return false;
    if (overallEx < digitsPattern[0]) return true;
  }

  private static checkOverallExInRange(range: number[], overallEx?: number) {
    if (range.length !== 2) return false;
    if (!overallEx) return false;
    if (!(range[0] <= overallEx && overallEx <= range[1])) return true;
  }

  private static checkDigitMatchIsBetLangEx(langEx: ExperienceRange, digitsPattern: number[]) {
    if (digitsPattern.length !== 1) return false;
    if (!(langEx.min <= digitsPattern[0] && digitsPattern[0] <= langEx.max)) return true;
  }

  private static checkLangExInRange(langEx: ExperienceRange, range: number[]) {
    if (range.length !== 2) return false;
    if (!(langEx.min >= range[0] && langEx.max <= range[1])) return true;
  }

  /**
   *
   * @param {string[][]} sentences - Array of strings (sentences) of text.
   * @param {Profile} profile - Profile of the user.
   * @returns {{pass:boolean, reason:string|undefined,count:number}} Object If the text matches to the provided profile.
   * @description This code is scanning through a 2D array of strings (sentences) and a profile object.
   * It checks if the text matches to the provided profile.
   */
  private static scanRequirements(
    sentences: string[][],
    user: UserEntity
  ): { pass: boolean; reason?: string; count: number } {
    let noneOfTechStackExist = false;
    let k = 0;
    if (sentences.length === 0) return { pass: false, reason: `No elements was found`, count: k };
    // Loop over sentences
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      let yearsIndex = -1;
      let digitsPattern: number[] | undefined = undefined;
      let langEx;
      let startSearchLang = false;

      // Loop over words.
      for (let j = 0; j < sentence.length; j++) {
        k++;
        // If the number of words scanned reaches a certain limit (RequirementsReader.WORDS_COUNT_KILL), the code will return false and a reason for why it stopped scanning
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

        // Check if the tech is in excludedTech and return if it does.
        const excludeTech = user.getExcludedRequirement(word);
        if (excludeTech) return { pass: false, reason: `${word} is not in your stack`, count: k };

        // Check if the there are any words from profile's requirements in the text.
        langEx = user.getRequirement(word);
        if (langEx) noneOfTechStackExist = true;

        // Set new digit patterns which represent years experience.
        // digitsPattern represents range min-max or simple number.
        if (!digitsPattern)
          if (j < sentence.length - 1 && sentence[j + 1].includes('year'))
            digitsPattern = RequirementsReader.getPatternDigits(word);

        //Check if there is digitsPattern.
        if (digitsPattern) {
          //Check profile overallEx is in the range of the  years patterns.
          if (this.checkOverallExInRange(digitsPattern, user.overallEx))
            return {
              pass: false,
              reason: `Your ${user.overallEx} years experience is not in the range ${digitsPattern[0]}-${digitsPattern[1]}`,
              count: k,
            };
          //Check profile overallEx is in bigger than  of the simple number of years.
          if (this.checkOverallExBiggerThanDigitMatch(digitsPattern, user.overallEx))
            return {
              pass: false,
              reason: `Your ${user.overallEx} years experience is lower than ${digitsPattern[0]} years`,
              count: k,
            };

          // If the function is still running and there is digitsPatterns which was found,
          // the search reset to the beginning of the sentence, and save the last index where the digitsPatterns was found.
          if (!startSearchLang) {
            yearsIndex = j; // save the last time index when digit of years was display.
            j = -1;
            startSearchLang = true;
          }
          // Check If langEx from profile's requirement was found.
          if (langEx) {
            // Check If langEx of the language from profile's requirement is in the range of the digitsPatterns.
            if (this.checkLangExInRange(langEx, digitsPattern))
              return {
                pass: false,
                reason: `Your ${langEx.min}-${langEx.max} years experience in ${word} is not in the range between ${digitsPattern[0]}-${digitsPattern[1]} years.`,
                count: k,
              };
            // Check If digitsPatterns is in the range of the  langEx of the language from profile's requirement.
            if (this.checkDigitMatchIsBetLangEx(langEx, digitsPattern))
              return {
                pass: false,
                reason: `Your ${langEx.min}-${langEx.max} years experience in ${word} is not match to ${digitsPattern[0]} years experience.`,
                count: k,
              };

            //If the function is still running and there is match of langEx and digits patterns, the j index continue from the last position where the digitsPattern was found and the function indicators are reset.
            //This behavior is for checking other matches of langEx and digitsPatterns.
            langEx = undefined;
            digitsPattern = undefined;
            j = yearsIndex + 1;
            yearsIndex = -1;
            startSearchLang = false;
          }
        }
      }
      //After each sentence the indicator are reset.
      digitsPattern = undefined;
      langEx = undefined;
      yearsIndex = -1;
      startSearchLang = false;
    }
    //If there is not match of langEx from profile requirements in the text, the function will return: 'This job is not contain any word from you tech stack'
    if (!noneOfTechStackExist)
      return { pass: false, reason: 'This job is not contain any word from you tech stack', count: k };

    return { pass: true, count: k };
  }

  /**
   * @param {string} text - The text.
   * @returns {string[][]} The array of sentences that contains array of words.
   * @description  splits it into sentences, then splits each sentence into words and filters out any empty strings. Finally, it returns an array of sentences, each containing an array of words.
   *  */
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

  /**
   * @param {string}title The title of job/
   * @return {string } If the title contains words in excludedRequirement.
   */
  static checkJobTitleIsValid(title: string, user: UserEntity): string {
    if (!title) return `The title is empty`;
    const words = title.toLowerCase().split(/,| /g);
    // const titleIsMatch = !words.some((word) => this.user.getExcludedRequirement(word));
    let i = 0;
    let j = words.length - 1;
    const createMessage = (word: string) => `The title contains the word '${word}'`;
    while (i < j) {
      if (user.getExcludedRequirement(words[i])) return createMessage(words[i]);
      if (user.getExcludedRequirement(words[j])) return createMessage(words[j]);
      i++;
      j--;
    }
    return '';
  }

  static checkIsRequirementsMatch(html: string, user: UserEntity) {
    const sentences = RequirementsReader.getSentences(html);
    const isRequirementsMatch = RequirementsReader.scanRequirements(sentences, user);
    return isRequirementsMatch;
  }
  static checkRequirementMatchForArray(data: Job[], user: UserEntity) {
    return data.map((el) => {
      let reason;
      // Read the title. If the title is valid and there the reason is empty so continue to the requirements.
      reason = RequirementsReader.checkJobTitleIsValid(el.title, user);
      if (reason) return { ...el, reason };

      // Read the requirements.
      reason = RequirementsReader.checkIsRequirementsMatch(el.text, user).reason;
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
