import { GenericRecord } from '../../../lib/types';
import { ExperienceRange } from '../../Profile/profile';
import { Profile } from '../../Profile/Profile';
import { RequirementsReader } from '../RequirementsReader';

describe.skip('Tests simple examples of checkIsRequirementsMatch function', () => {
  // Note: All the keys in the requirementsOptions map and excludeTechs should be lowercase!
  const REQUIREMENTS: GenericRecord<ExperienceRange> = {
    javascript: { min: 0, max: 3 },
    react: { min: 0, max: 3 },
    typescript: { min: 0, max: 3 },
    ts: { min: 0, max: 3 },
    js: { min: 0, max: 3 },
    'node.js': { min: 0, max: 3 },
    git: { min: 0, max: 3 },
    nosql: { min: 0, max: 3 },
    db: { min: 0, max: 3 },
  };
  const profile = new Profile({
    overallEx: 2,
    requirementsOptions: REQUIREMENTS,
    excludeTechs: { 'c#.net': true, angular: true, 'c#': true, java: true, php: true },
  });

  test('Tests one sentence when the language is found in the excludeTechs obj ', () => {
    const sentences = [['C#.NET', 'Core', '–', '3+', 'years', 'of', 'experience']];

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });

  test('Tests one sentence when the language included in the excludeTechs its ok for the position and the years  experience are ok but no other language from my tech stack', () => {
    const profile = new Profile({
      overallEx: 1,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'c#.net': false },
    });

    const sentences = [['C#.NET', 'Core', '–', '1+', 'years', 'of', 'experience']];

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });

  test('Tests one sentence when the language included in the excludeTechs obj but is ok for the position but the years experience are not', () => {
    const profile = new Profile({
      overallEx: 1,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'c#.net': false },
    });

    const sentences = [['C#.NET', 'Core', '–', '3+', 'years', 'of', 'experience']];
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });

  test(`Tests one sentence when the language program years experience is bigger than the profile' experience`, () => {
    const sentences = [['javascript', '14+', 'years', 'of', 'experience']];
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });
  test(`Tests one sentence when the language program before the years experience and the years experience are ok `, () => {
    const sentences = [['javascript', '1+', 'years', 'of', 'experience']];
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeTruthy();
  });
  test(`Tests one sentence when the language program before the years experience and the years experience are range and they are ok `, () => {
    const sentences = [['javascript', '0-2', 'years', 'of', 'experience']];
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeTruthy();
  });

  test(`Tests one sentence when the language program before the years experience and the years experience are range and they aren't ok by overall experience `, () => {
    const sentences = [['javascript', '3-5', 'years', 'of', 'experience']];
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });
  test(`Tests one sentence when the language program before the years experience and the years experience are range and they aren't ok by language experience`, () => {
    const profile = new Profile({
      overallEx: 5,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'c#.net': false },
    });

    const sentences = [['javascript', '4-5', 'years', 'of', 'experience']];
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });

  test(`Tests one sentence when the language program is after the years experience and the years experience are ok`, () => {
    const sentences = [['1+', 'years', 'of', 'experience', 'in', 'javascript']];
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeTruthy();
  });

  test(`Tests one sentence when the language program is after the years experience and the years experience are not ok by overall experience`, () => {
    const sentences = [['5+', 'years', 'of', 'experience', 'in', 'javascript']];
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });

  test(`Tests one sentence when the language program is after the years experience and the years experience are not ok by language experience only`, () => {
    const REQUIREMENTS: GenericRecord<ExperienceRange> = {
      javascript: { min: 0, max: 2 },
      react: { min: 0, max: 3 },
      typescript: { min: 0, max: 3 },
      ts: { min: 0, max: 3 },
      js: { min: 0, max: 3 },
      'node.js': { min: 0, max: 3 },
      git: { min: 0, max: 3 },
    };
    const profile = new Profile({
      overallEx: 6,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'c#.net': false },
    });

    const sentences = [['5+', 'years', 'of', 'experience', 'in', 'javascript']];

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });

  test(`Tests one sentence when the language program is after the years experience and the years experience are range and the overallEx is lower`, () => {
    const REQUIREMENTS: GenericRecord<ExperienceRange> = {
      javascript: { min: 0, max: 2 },
      react: { min: 0, max: 3 },
      typescript: { min: 0, max: 3 },
      ts: { min: 0, max: 3 },
      js: { min: 0, max: 3 },
      'node.js': { min: 0, max: 3 },
      git: { min: 0, max: 3 },
    };
    const profile = new Profile({
      overallEx: 2,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'c#.net': false },
    });

    const sentences = [['3-5', 'years', 'of', 'experience', 'in', 'javascript']];

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });
  test(`Tests one sentence when the language program is after the years experience and the years experience are range and the overallEx is ok but the language experience is not`, () => {
    const sentences = [['0-2', 'years', 'of', 'experience', 'javascript', 'all']];

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeTruthy();
  });

  test(`Tests one sentence when there are many language programs and the overallEx is not ok`, () => {
    const profile = new Profile({
      overallEx: 1,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'c#.net': true, angular: true, 'c#': true, java: true, php: true },
    });
    const sentences = [
      ['0-2', 'years', 'of', 'experience', 'javascript', 'and', '2', 'years', 'of', 'node.js'],
    ];

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });
  test(`Tests one sentence when there are many language programs and the overallEx is ok `, () => {
    const sentences = [
      ['1', 'years', 'of', 'experience', 'javascript', 'and', '1', 'years', 'of', 'node.js'],
    ];

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeTruthy();
  });
  test(`Tests one sentence when there are many language programs and the user ex is not ok `, () => {
    const profile = new Profile({
      overallEx: 2,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'c#.net': true },
    });

    const sentences = [
      ['0-2', 'years', 'of', 'experience', 'javascript', 'and', '3', 'years', 'of', 'node.js'],
    ];

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });
  test(`Tests one sentence when there are many language programs and one of them is excluded tech`, () => {
    const profile = new Profile({
      overallEx: 15,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'c#.net': true },
    });

    const sentences = [
      ['0-2', 'years', 'of', 'experience', 'C#.NET', 'and', '3', 'years', 'of', 'node.js'],
    ];

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });
  test(`Tests one sentence when there are many language programs and one of them is excluded tech that its ok`, () => {
    const profile = new Profile({
      overallEx: 15,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'c#.net': false },
    });

    const sentences = [
      ['0-2', 'years', 'of', 'experience', 'C#.NET', 'and', '3', 'years', 'of', 'node.js'],
    ];

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeTruthy();
  });
  test('Tests one sentence when there are many language program', () => {
    const profile = new Profile({
      overallEx: 15,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'c#.net': false },
    });
    const sentences = [
      [
        '*',
        'Bootstrap,',
        'JAVASCRIPT,',
        'experience',
        'in',
        'the',
        'ReactJS',
        'or',
        'Angular',
        '2',
        'environment',
      ],
    ];
    const res = RequirementsReader.checkIsRequirementsMatch(sentences, profile);

    expect(res.pass).toBeTruthy();
  });
});
