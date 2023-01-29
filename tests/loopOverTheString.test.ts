import { Profile } from '../lib/Profile';
import { ExperienceRange } from '../lib/types/profile';
import { GenericRecord } from '../lib/types/types';
import { loopOverTheString } from '../src/linkedin.scanner';

describe('test loopOverTheString function', () => {
  const REQUIREMENTS: GenericRecord<ExperienceRange> = {
    javascript: { min: 0, max: 3 },
    react: { min: 0, max: 3 },
    typescript: { min: 0, max: 3 },
    ts: { min: 0, max: 3 },
    js: { min: 0, max: 3 },
    'node.js': { min: 0, max: 3 },
    git: { min: 0, max: 3 },
    NoSQL: { min: 0, max: 3 },
    DB: { min: 0, max: 3 },
  };
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
    const profile = new Profile({
      overallEx: 1,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'C#.NET': false },
    });

    const sentences = [
      ['C#.NET', 'Core', '–', '3+', 'years', 'of', 'experience'],
    ];
    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });

  test(`Test one sentence when the language program years experience is bigger than the profile' experience`, () => {
    const sentences = [['javascript', '14+', 'years', 'of', 'experience']];
    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });
  test(`Test one sentence when the language program before the years experience and the years experience are ok `, () => {
    const sentences = [['javascript', '1+', 'years', 'of', 'experience']];
    expect(loopOverTheString(profile, sentences)).toBeTruthy();
  });
  test(`Test one sentence when the language program before the years experience and the years experience are range and they are ok `, () => {
    const sentences = [['javascript', '0-2', 'years', 'of', 'experience']];
    expect(loopOverTheString(profile, sentences)).toBeTruthy();
  });

  test(`Test one sentence when the language program before the years experience and the years experience are range and they aren't ok by overall experience `, () => {
    const sentences = [['javascript', '3-5', 'years', 'of', 'experience']];
    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });
  test(`Test one sentence when the language program before the years experience and the years experience are range and they aren't ok by language experience`, () => {
    const profile = new Profile({
      overallEx: 5,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'C#.NET': false },
    });
    const sentences = [['javascript', '4-5', 'years', 'of', 'experience']];
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

  test(`Test one sentence when the language program is after the years experience and the years experience are not ok by language experience only`, () => {
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
      excludeTechs: { 'C#.NET': false },
    });

    const sentences = [['5+', 'years', 'of', 'experience', 'in', 'javascript']];

    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });

  test(`Test one sentence when the language program is after the years experience and the years experience are range and the overallEx is lower`, () => {
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
      excludeTechs: { 'C#.NET': false },
    });

    const sentences = [
      ['3-5', 'years', 'of', 'experience', 'in', 'javascript'],
    ];

    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });
  test(`Test one sentence when the language program is after the years experience and the years experience are range and the overallEx is ok but the language experience is not`, () => {
    const sentences = [
      ['0-2', 'years', 'of', 'experience', 'javascript', 'all'],
    ];

    expect(loopOverTheString(profile, sentences)).toBeTruthy();
  });

  test(`Test one sentence when there are many language programs and the overallEx is not ok`, () => {
    const sentences = [
      [
        '0-2',
        'years',
        'of',
        'experience',
        'javascript',
        'and',
        '2',
        'years',
        'of',
        'node.js',
      ],
    ];

    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });
  test(`Test one sentence when there are many language programs and the overallEx is ok `, () => {
    const sentences = [
      [
        '1',
        'years',
        'of',
        'experience',
        'javascript',
        'and',
        '1',
        'years',
        'of',
        'node.js',
      ],
    ];

    expect(loopOverTheString(profile, sentences)).toBeTruthy();
  });
  test(`Test one sentence when there are many language programs and the user ex is not ok `, () => {
    const profile = new Profile({
      overallEx: 2,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'C#.NET': true },
    });
    const sentences = [
      [
        '0-2',
        'years',
        'of',
        'experience',
        'javascript',
        'and',
        '3',
        'years',
        'of',
        'node.js',
      ],
    ];

    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });
  test(`Test one sentence when there are many language programs and one of them is excluded tech`, () => {
    const profile = new Profile({
      overallEx: 15,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'C#.NET': true },
    });
    const sentences = [
      [
        '0-2',
        'years',
        'of',
        'experience',
        'C#.NET',
        'and',
        '3',
        'years',
        'of',
        'node.js',
      ],
    ];

    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });
  test(`Test one sentence when there are many language programs and one of them is excluded tech that its ok`, () => {
    const profile = new Profile({
      overallEx: 15,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: { 'C#.NET': false },
    });
    const sentences = [
      [
        '0-2',
        'years',
        'of',
        'experience',
        'C#.NET',
        'and',
        '3',
        'years',
        'of',
        'node.js',
      ],
    ];

    expect(loopOverTheString(profile, sentences)).toBeTruthy();
  });
  test(`Test many sentence from real text that its not match the user experince-ex`, () => {
    const profile = new Profile({
      overallEx: 1,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: {},
    });
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
  test(`Test many sentence from real text that its match the user experience-ex1`, () => {
    const profile = new Profile({
      // overallEx: 1,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: {},
    });
    const sentences = [
      ['typescript', 'Core', '–', '2', 'years', 'of', 'experience'],
      ['javascript', '14+', '-', '2+', 'years', 'of', 'experience'],
      ['Any', 'NoSQL', 'DB', '–', '3+', 'years', 'of', 'experience'],
      ['Experience', 'with', 'Rest', 'API', 'development'],
      ['Performance', 'and', 'security-first', 'thinking'],
      ['Team', 'player'],
    ];

    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });
  test(`Test many sentence from real text that not match the user experience-ex2`, () => {
    const profile = new Profile({
      overallEx: 1,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: {},
    });
    const sentences = [
      [
        '8+',
        'years',
        'working',
        'experience',
        'with',
        'Java',
        '(minimum',
        '70%\n',
        'backend)',
        '–',
        'Must',
      ],
      [
        '4+',
        'years',
        'working',
        'experience',
        'with',
        'different',
        'Spring\n',
        'projects',
        '(for',
        'example',
        'Framework,',
        'Security,\n',
        'Integration)',
        '–',
        'Must',
      ],
      [
        'Experience',
        'with',
        'microservices',
        'and',
        'related',
        'technologies\n',
        '(AWS,',
        'Docker,',
        'K8s)',
        '–',
        'Must',
      ],
      ['Experience', 'with', 'messaging', '–', 'Must'],
      ['Experience', 'with', 'SQL', '–', 'Must'],
      [
        'Experience',
        'in',
        'leading',
        'feature',
        'development',
        'end-to-end,\n',
        'working',
        'with',
        'all',
        'stakeholders',
        'and',
        'guiding',
        'other\n',
        'developers',
        '–',
        'Must',
      ],
      [
        'Understanding',
        'of',
        'web',
        'fundamentals:',
        'JavaScript,\n',
        'TypeScript,',
        'HTML5,',
        'CSS3,',
        'Responsive',
        'Design,',
        'etc.',
        '–\n',
        'Must',
      ],
      ['Experience', 'with', 'React', '–', 'Must'],
      ['Experience', 'with', 'ORM', '–', 'Advantage'],
      [
        'B.Sc.',
        'Degree',
        'in',
        'Computer',
        'Science,',
        'Engineering,',
        'or\n',
        'related',
        'field',
        '–',
        'Advantage',
      ],
      [
        'Design',
        '&',
        'develop',
        'new',
        'features',
        'in',
        'an',
        'agile\n',
        'software',
        'methodology.',
      ],
      [
        'Own',
        'your',
        'deliveries',
        'from',
        'design,',
        'all',
        'the',
        'way',
        'to\n',
        'production.',
      ],
      [
        'Communicate',
        'with',
        'all',
        'stakeholders',
        '(Product,',
        'QA,\n',
        'Architect,',
        'Support,',
        'Integrators,',
        'etc.)',
      ],
    ];

    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });
  test(`Test many sentence from real text that match the user experience-ex3`, () => {
    const profile = new Profile({
      overallEx: 2,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: {},
    });
    const sentences = [
      [
        'Manage',
        'and',
        'optimize',
        'scalable',
        'distributed',
        'systems',
        'on\n',
        'the',
        'cloud',
        '(storage,',
        'servers,',
        'API).',
      ],
      ['Design', 'robust', 'APIs.'],
      ['Write', 'scripting', 'for', 'the', 'products', 'backend', 'pipeline.'],
      [
        'Deploy',
        'AI',
        'models',
        'delivered',
        'by',
        'the',
        'team',
        'into',
        'the\n',
        'product',
        'pipeline.',
      ],
      [
        'Optimization',
        'of',
        'applications',
        'for',
        'scalability',
        'and\n',
        'performance.',
      ],
      [
        'At',
        'least',
        '1',
        'year',
        'of',
        'experience',
        'in',
        'Backend,',
        'Big',
        'Data,\n',
        'and',
        'Data',
        'engineering',
        'development.',
        'Python',
        'scripting\n',
        'languages-',
        'Must.',
      ],
      ['Experience', 'designing', 'RESTful', 'APIs.'],
      [
        'Experience',
        'working',
        'with',
        'SQL',
        'or',
        'other',
        'data',
        'storage\n',
        'systems,',
        'like',
        'ORM,',
        'NoSQL,',
        'or',
        'others.',
      ],
      [
        'Team',
        'player,',
        'someone',
        'we’d',
        'love',
        'to',
        'work',
        'with,',
        'and\n',
        'independent.',
      ],
    ];

    expect(loopOverTheString(profile, sentences)).toBeTruthy();
  });
  test(`Test many sentence from real text that match the user experience-ex4`, () => {
    const profile = new Profile({
      overallEx: 2,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: {},
    });
    const sentences = [
      [
        'Build',
        '&',
        'maintain',
        'our',
        'eCommerce',
        'web',
        'application\n',
        'with',
        'a',
        'focus',
        'on',
        'the',
        'UX',
        '&',
        'UI.',
      ],
      [
        'Design',
        'and',
        'develop',
        'the',
        'overall',
        'architecture',
        'of',
        'the',
        'web\n',
        'application.',
      ],
      [
        'Collaborate',
        'with',
        'the',
        'rest',
        'of',
        'the',
        'engineering',
        'team',
        'to\n',
        'design',
        'and',
        'launch',
        'new',
        'features.',
      ],
      [
        'Use',
        'and',
        'create',
        'integrations',
        'with',
        'multiple',
        'tools',
        '&\n',
        'services.',
      ],
      [
        'Strong',
        'experience',
        'and',
        'understanding',
        'of',
        'Javascript,',
        'CSS\n',
        '&',
        'HTML5.',
      ],
      [
        'Passionate',
        'about',
        'building',
        'beautiful',
        'and\n',
        'well-structured',
        'products.',
      ],
      ['Problem-solving', 'attitude.'],
      ['Excellent', 'English', 'skills.'],
      [
        'Great',
        'communication',
        'skills',
        'and',
        'a',
        'team-player\n',
        'attitude.',
      ],
      ['Familiarity', 'with', 'Microsoft', 'tools.'],
      [
        'Past',
        'experience',
        'relating',
        'to',
        'working',
        'with',
        'Content\n',
        'Management',
        'Systems',
        '(CMS).',
      ],
      ['Experience', 'working', 'with', 'Azure', '-', 'an', 'advantage.'],
      [
        'Experience',
        '/',
        'basic',
        'knowledge',
        'in',
        'C#',
        '-',
        'an',
        'advantage.',
      ],
      [
        'B.sc',
        'in',
        'Computer',
        'Science/Software',
        'Engineering',
        'or\n',
        'related',
        'field',
        '-',
        'an',
        'advantage.',
      ],
      [
        'Knowledge',
        'and',
        'skills',
        'in',
        'user',
        'experience',
        '(UX)',
        'design',
        '-\n',
        'an',
        'advantage.',
      ],
    ];

    expect(loopOverTheString(profile, sentences)).toBeTruthy();
  });
  test(`Test many sentence from real text that match the user experience-ex5`, () => {
    const profile = new Profile({
      overallEx: 2,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: {},
    });
    const sentences = [
      [
        'You',
        'will',
        'develop,',
        'debug,',
        'deliver',
        'and',
        'maintain',
        'a\n',
        'highly-complex',
        'system,',
        'that',
        'is',
        'the',
        'core',
        'of',
        'our\n',
        "company's",
        'growth.',
      ],
      [
        'You',
        'will',
        'work',
        'in',
        'an',
        'agile',
        'development',
        'environment.',
      ],
      [
        'You',
        'will',
        'deliver',
        'high',
        'quality',
        'and',
        'well-structured',
        'code',
      ],
      [
        '4+',
        'years',
        'of',
        'experience',
        'as',
        'a',
        'software',
        'developer',
        'with\n',
        'front-end',
        'and',
        'back-end',
        'development.',
      ],
      ['Experience', 'with', 'Node.js.'],
      [
        'Excellent',
        'JavaScript',
        '(including',
        'ES6),',
        'HTML',
        'and',
        'CSS\n',
        'skills.',
      ],
      [
        'Exposure',
        'to',
        'front',
        'end,',
        'single',
        'page',
        'application\n',
        'oriented',
        'frameworks',
        'such',
        'as',
        'Angular,',
        'ReactJS,',
        'etc.',
      ],
      [
        'Working',
        'with',
        'web',
        'services',
        '(e.g.',
        'REST',
        'services)',
        'and\n',
        'good',
        'understanding',
        'of',
        'network',
        'concepts',
        '(e.g.',
        'HTTP\n',
        'protocol,',
        'sockets',
        'etc.).',
      ],
      [
        'knowledge',
        'of',
        'browser',
        'troubleshooting',
        'and',
        'debugging\n',
        'practices',
        'and',
        'techniques.',
      ],
    ];

    expect(loopOverTheString(profile, sentences)).toBeFalsy();
  });
});
