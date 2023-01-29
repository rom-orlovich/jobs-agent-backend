import { Profile, REQUIREMENTS } from '../lib/Profile';
import { loopOverTheString } from '../src/linkedin.scanner';

export const profile = new Profile({
  overallEx: 1,
  RequirementsOptions: {
    requirements: REQUIREMENTS,
    excludeTech: { 'C#.NET': false },
  },
});

describe('test loopOverTheString function', () => {
  test('test one line ', () => {
    const sentences = [
      ['C#.NET', 'Core', '–', '3+', 'years', 'of', 'experience'],
    ];

    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });
  test.skip('Test multiple lines ', () => {
    const sentences = [
      ['C#.NET', 'Core', '–', '3+', 'years', 'of', 'experience'],
      ['javascript', '14+', '-', '2+', 'years', 'of', 'experience'],
      ['Any', 'NoSQL', 'DB', '–', '3+', 'years', 'of', 'experience'],
      ['Experience', 'with', 'Rest', 'API', 'development'],
      ['Performance', 'and', 'security-first', 'thinking'],
      ['Team', 'player'],
    ];

    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });
});
