import { Profile } from './Profile';

export class RequirementsReader {
  private static getSentences = (text: string) => {
    const sentences = text
      .split(/[.!?\n]/)
      .filter((el) => el)
      .map((el) => el.trim().split(' '));

    return sentences;
  };

  private static checkNumberIsLowerTheRange(numCheck: number | undefined, range: RegExpMatchArray) {
    if (range[0][1] === '-') {
      const [min, max] = range[0].split('-');
      if (numCheck && Number(min) > numCheck) return true;
    }
  }

  private static checkDigitMatchIsBigger(numCheck: number | undefined, digitMatch: RegExpMatchArray) {
    const yearNum = Number(digitMatch[0]);
    if (numCheck && yearNum > numCheck) return true;
  }
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
    return wordNumberDict[word.toLowerCase()];
  }

  private static scanRequirements(sentences: string[][], profile: Profile) {
    let noneOfTechStackExist = false;
    if (sentences.length === 0) return { pass: false, reason: `No elements was found` };
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      let yearsIndex = -1;
      let digitMatch: RegExpMatchArray | null = null;
      let languageMatch;

      for (let j = 0; j < sentence.length; j++) {
        const convertToNum = this.convertWordToNumber(sentence[j]);
        const word = convertToNum ? convertToNum : sentence[j];

        // Check if the word is include in the excluded tech
        if (profile.getExcludeTech(word)) return { pass: false, reason: `${word} is not in your stack` };

        // Check a match of digit is already exist.
        if (!digitMatch) {
          digitMatch = word.match(/\d\d|\d-\d|\d/g);

          // Check if there is match.
          // If it does check if the next word contains the word 'year'.
          if (digitMatch && j < sentence.length - 1 && sentence[j + 1].match(/year/)) {
            // Check if the match is range.
            if (this.checkNumberIsLowerTheRange(profile.overallEx, digitMatch))
              return {
                pass: false,
                reason: `Your ${profile.overallEx}  years experience is lower than ${digitMatch}`,
              };
            // Check if the overallEx is smaller than digitMatch.
            if (this.checkDigitMatchIsBigger(profile.overallEx, digitMatch))
              return {
                pass: false,
                reason: `Your ${profile.overallEx} years experience is lower than ${digitMatch} years`,
              };
            yearsIndex = j;
            j = 0;
          }
        }

        const langEx = profile.getRequirement(word);
        if (langEx) {
          noneOfTechStackExist = true;
          languageMatch = langEx;
        }

        // Check if there is language  and digit were match.
        if (languageMatch && digitMatch) {
          if (this.checkNumberIsLowerTheRange(languageMatch.max, digitMatch))
            return {
              pass: false,
              reason: `Your ${languageMatch.max} years experience in ${word} is lower than ${digitMatch} range years.`,
            };

          if (this.checkDigitMatchIsBigger(languageMatch.max, digitMatch))
            return {
              pass: false,
              reason: `Your ${languageMatch.max} years experience in ${word} is lower than ${digitMatch} years.`,
            };
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

    if (!noneOfTechStackExist)
      return { pass: false, reason: 'This job is not contain any word from you tech stack' };
    return { pass: true };
  }

  static checkIsRequirementsMatch(html: string, profile: Profile) {
    const sentences = RequirementsReader.getSentences(html);
    const isRequirementsMatch = RequirementsReader.scanRequirements(sentences, profile);
    return isRequirementsMatch;
  }
}

export type checkIsRequirementsMatchRes = ReturnType<
  (typeof RequirementsReader)['checkIsRequirementsMatch']
>;
