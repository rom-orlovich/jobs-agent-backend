import { Profile } from '../lib/Profile';
import { ExperienceRange } from '../lib/types/profile';
import { GenericRecord } from '../lib/types/types';
import { loopOverTheString } from '../src/linkedin.scanner';

export const REQUIREMENTS: GenericRecord<ExperienceRange> = {
  javascript: { min: 0, max: 3 },
  react: { min: 0, max: 3 },
  typescript: { min: 0, max: 3 },
  ts: { min: 0, max: 3 },
  js: { min: 0, max: 3 },
  'node.js': { min: 0, max: 3 },
  git: { min: 0, max: 3 },
};

describe('test loopOverTheString function', () => {
  const profile = new Profile({
    overallEx: 1,
    requirementsOptions: REQUIREMENTS,
    excludeTechs: { 'C#.NET': true },
  });

  test('Test one sentence when the language is found in the excludeTechs obj ', () => {
    const sentences = [
      ['C#.NET', 'Core', '–', '3+', 'years', 'of', 'experience'],
    ];

    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });

  test('Test one sentence when the language included in the excludeTechs obj but its ok for the position and the years experience are ok', () => {
    const profile = new Profile({
      overallEx: 1,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'C#.NET': false },
    });

    const sentences = [
      ['C#.NET', 'Core', '–', '1+', 'years', 'of', 'experience'],
    ];
    expect(loopOverTheString(profile, sentences)).toBeTruthy();
  });

  test('Test one sentence when the language included in the excludeTechs obj but is ok for the position but the years experience are not', () => {
    const sentences = [
      ['C#.NET', 'Core', '–', '3+', 'years', 'of', 'experience'],
    ];
    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });

  test(`Test one sentence when the language program year experience is bigger than the profile' experience`, () => {
    const sentences = [['javascript', '14+', 'years', 'of', 'experience']];
    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });

  test(`Test one sentence when the language program is after the years experience and the years experience are ok`, () => {
    const sentences = [['1+', 'years', 'of', 'experience', 'in', 'javascript']];
    expect(loopOverTheString(profile, sentences)).toBeTruthy();
  });

  test(`Test one sentence when the language program is after the years experience and the years experience are not ok by overall experience`, () => {
    const sentences = [['5+', 'years', 'of', 'experience', 'in', 'javascript']];

    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });
  test(`Test one sentence when the language program is after the years experience and the years experience are not ok by language experience`, () => {
    const REQUIREMENTS: GenericRecord<ExperienceRange> = {
      javascript: { min: 0, max: 3 },
      react: { min: 0, max: 3 },
      typescript: { min: 0, max: 3 },
      ts: { min: 0, max: 3 },
      js: { min: 0, max: 3 },
      'node.js': { min: 0, max: 3 },
      git: { min: 0, max: 3 },
    };
    const profile = new Profile({
      overallEx: 5,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'C#.NET': false },
    });

    const sentences = [['5+', 'years', 'of', 'experience', 'in', 'javascript']];

    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });
});
