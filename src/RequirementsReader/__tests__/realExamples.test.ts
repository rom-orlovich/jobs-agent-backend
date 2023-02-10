import { ExperienceRange } from '../../../lib/types/profile';
import { GenericRecord } from '../../../lib/types/types';
import { Profile } from '../../Profile';
import { RequirementsReader } from '../RequirementsReader';

describe('Testss real examples of checkIsRequirementsMatch function', () => {
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
    overallEx: 1,
    requirementsOptions: REQUIREMENTS,
    excludeTechs: {},
  });
  test(`Tests many sentences from real text that its not match the user experience-ex`, () => {
    const sentences = [
      ['C#.NET', 'Core', '–', '3+', 'years', 'of', 'experience'],
      ['javascript', '14+', '-', '2+', 'years', 'of', 'experience'],
      ['Any', 'NoSQL', 'DB', '–', '3+', 'years', 'of', 'experience'],
      ['Experience', 'with', 'Rest', 'API', 'development'],
      ['Performance', 'and', 'security-first', 'thinking'],
      ['Team', 'player'],
    ];

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });
  test(`Tests many sentences from real text that its match the user experience-ex1`, () => {
    const profile = new Profile({
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

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeTruthy();
  });
  test(`Tests many sentences from real text that not match the user experience-ex2`, () => {
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
      ['Design', '&', 'develop', 'new', 'features', 'in', 'an', 'agile\n', 'software', 'methodology.'],
      ['Own', 'your', 'deliveries', 'from', 'design,', 'all', 'the', 'way', 'to\n', 'production.'],
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

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });
  test(`Tests many sentences from real text that match the user experience-ex3`, () => {
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
      ['Optimization', 'of', 'applications', 'for', 'scalability', 'and\n', 'performance.'],
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
      ['Team', 'player,', 'someone', 'we’d', 'love', 'to', 'work', 'with,', 'and\n', 'independent.'],
    ];

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeTruthy();
  });
  test(`Tests many sentences from real text that match the user experience-ex4`, () => {
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
      ['Use', 'and', 'create', 'integrations', 'with', 'multiple', 'tools', '&\n', 'services.'],
      ['Strong', 'experience', 'and', 'understanding', 'of', 'Javascript,', 'CSS\n', '&', 'HTML5.'],
      ['Passionate', 'about', 'building', 'beautiful', 'and\n', 'well-structured', 'products.'],
      ['Problem-solving', 'attitude.'],
      ['Excellent', 'English', 'skills.'],
      ['Great', 'communication', 'skills', 'and', 'a', 'team-player\n', 'attitude.'],
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
      ['Experience', '/', 'basic', 'knowledge', 'in', 'C#', '-', 'an', 'advantage.'],
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

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeTruthy();
  });
  test(`Tests many sentences from real text that match the user experience-ex5`, () => {
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
      ['You', 'will', 'work', 'in', 'an', 'agile', 'development', 'environment.'],
      ['You', 'will', 'deliver', 'high', 'quality', 'and', 'well-structured', 'code'],
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
      ['Excellent', 'JavaScript', '(including', 'ES6),', 'HTML', 'and', 'CSS\n', 'skills.'],
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

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass).toBeFalsy();
  });

  test('Tests many sentences from real text that match the user experience-ex6', () => {
    const sentences = RequirementsReader.getSentences(
      `Lookout for an experienced Full Stack Developer who has a passion for design & technology, and a strong drive to get things done -the right way.The acquisition by MasterCard has expanded DY’s horizons, opening up new verticals, including the financial industry.This is a huge opportunity for us and one of the company's biggest growth engines.Our goal is to bring personalization to the world of banking and finance. Your work, together with the team’s contribution,will impact millions of consumers through node.js  React's sophisticated backend and fancy UI.The Task-at-Hand:Build a highly complex web application based on React & Node.js from the ground up.Ownership of technical design of new features.Lead feature development and turn beautiful mockups into rich, fully functional interfaces.Stay updated and lead technological advances related to user experience.Requirements:  Optimal Skills for Success:At least 3 years of experience with React.At least 3 years of JavaScript experience.At least 3 years of experience building backend systems with NodeJS.Object Oriented Programming.SQL/NoSQL database experience (MySQL, Redis) a plus.A degree in Computer Science or a related discipline.Excellent verbal and written communication skills in English. המשרה מיועדת לנשים ולגברים כאחד.`
    );
    const res = RequirementsReader.checkIsRequirementsMatch(sentences, profile).pass;

    expect(res).toBeFalsy();
  });
  test('Tests many sentences from real text that may cause to infinite loop-ex7', () => {
    const profile = new Profile({
      overallEx: 2,
      requirementsOptions: REQUIREMENTS,
      excludeTechs: {},
    });

    const sentences = RequirementsReader.getSentences(
      `A large medical organization in Jerusalem, Netanya and the tender is looking for a Share Point developer.
          Join the team specializing in Share Point based portals in the Digital and Data Department in the Information Systems Division, at the organization's headquarters.
          As part of the position: regular communication with the team leader, other system analysts in the team, programmers, users and managers.
          The position includes E2E development on 2 main platforms - ON PREM and 365.
          Requirements:
          - Appropriate education (degree in information systems/ computer science/ other relevant studies)
          - At least two years of experience in SharePoint implementation and development
          - At least one year of experience as a Server side developer including working with NET.
          - At least one year of experience as a Client side developer including working with HTML, CSS, XML, XSL, JS
          - Experience working with databases - SQL The position is intended for both women and men.`
    );

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, profile);
    console.log(res.reason);
    expect(res.count).toBeLessThan(RequirementsReader.WORDS_COUNT_KILL);
    expect(res.pass).toBeTruthy();
  });
  test.only('Tests many sentences from real text that may cause to infinite loop-ex8', () => {
    const sentences = RequirementsReader.getSentences(
      `Were looking for a Full Stack developer to join our development team and be responsible for building a SaaS back-office platform that will integrate with our core technology and systems.
          If youre interested in creating a user-friendly platform by writing clean code and moving forward in your career, then this job is for you. We expect you to be a tech-savvy professional, who is curious about new digital technologies and aspires to combine usability with visual design.
          The role will allow getting in on the ground floor, laying down the foundations of the technology, and being a vital member of the team that constantly grows.
          Requirements:
          The role requires creativity, a can-do approach, and knowledge and experience in multiple platforms and technologies:
          Proficient understanding of web foundations: HTML, CSS, JavaScript, HTTP, web browsers
          Proficiency with front-end technologies and frameworks, such as React, Vue.js, Webpack
          Proficiency with Node.js and back-end technologies and frameworks, such as NestJS, Express (AdonisJS advantage)
          Experience with TypeScript
          Experience with SQL, MongoDB, and other relational and non-relational databases
          Good understanding of design patterns
          Good understanding of source code management tools, such as Git
          Experience working with GNU/Linux and the command line
          Experience with AWS (advantage)
          Experience with CI/CD pipelines (advantage)
          Experience writing automated tests (advantage).
          המשרה מיועדת לנשים ולגברים כאחד.`
    );

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, profile);
    expect(res.count).toBeLessThan(RequirementsReader.WORDS_COUNT_KILL);
    expect(res.pass).toBeTruthy();
  });
  test('Tests many sentences from real text that may cause to infinite loop-ex9', () => {
    const sentences = RequirementsReader.getSentences(
      `Lookout for an experienced Full Stack Developer who has a passion for design & technology, and a strong drive to get things done - the right way.The acquisition by MasterCard has expanded DYs horizons, opening up new verticals, including the financial industry.This is a huge opportunity for us and one of the company's biggest growth engines.Our goal is to bring personalization to the world of banking and finance. Your work, together with the teams contribution,will impact millions of consumers through node.js  React's sophisticated backend and fancy UI.The Task-at-Hand:Build a highly complex web application based on React & Node.js from the ground up.Ownership of technical design of new features.Lead feature development and turn beautiful mockups into rich, fully functional interfaces.Stay updated and lead technological advances related to user experience.Requirements:  Optimal Skills for Success:At least 3 years of experience with React.At least 3 years of JavaScript experience.At least 3 years of experience building backend systems with NodeJS.Object Oriented Programming.SQL/NoSQL database experience (MySQL, Redis) a plus.A degree in Computer Science or a related discipline.Excellent verbal and written communication skills in English. המשרה מיועדת לנשים ולגברים כאחד.`
    );
    console.log(sentences);
    const res = RequirementsReader.checkIsRequirementsMatch(sentences, profile);
    expect(res.count).toBeLessThan(RequirementsReader.WORDS_COUNT_KILL);
    expect(res.pass).toBeFalsy();
  });

  test('Tests many sentences from real text that not match to any word in my stack but it does-ex10', () => {
    const sentences = RequirementsReader.getSentences(
      `Softwave company needs a FS developer
          Job definition: work against specific characterizations and business requirements.
          Understanding and connection to the company's business activity for efficient and targeted development.
          Fault and availability support.
          Regular maintenance of the system and troubleshooting.
          Requirements:
          * Two or more years of development experience in the C#, ASP.NET, .NET environment - mandatory
          * Entity Framework 6 - mandatory
          * Experience in Umbraco
          * Bootstrap, JAVASCRIPT, experience in the ReactJS or Angular 2 environment. The position is intended for both women and men.`
    );
    console.log(sentences);
    const res = RequirementsReader.checkIsRequirementsMatch(sentences, profile);
    console.log(res.reason);
    expect(res.pass).toBeTruthy();
  });
  test('Tests many sentences from real text that the overall experience is bigger than mine.-ex11', () => {
    const sentences = RequirementsReader.getSentences(
      `5 years of experience in .Net technologies - ASP.Net and Net Core.
          Development in MSSQL or Oracle
          Experience with GIT configuration management tools
          Knowledge and experience in Javascript, Json, HTML 5, CSS 3
          Knowledge and experience with frameworks such as React, Vue, Angular - an advantage
          Knowledge and experience in infrastructure development.Net - Knowledge and experience in Java development - an advantage The position is intended for both women and men.`
    );
    console.log(sentences);
    const res = RequirementsReader.checkIsRequirementsMatch(sentences, profile);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
  });

  test('Tests many sentences from real text where the some technologies fit my stack but other are not but still the job pass-ex12', () => {
    const sentences = RequirementsReader.getSentences(
      `This is a company that has developed a product that optimizes and shortens the sales processes of insurance for businesses, specifically in the field of cyber insurance. This is a long and complicated process that they know how to optimize with a few clicks of a button (saving a few business days and serious savings in insurance prices). It is a SaaS platform that is very easy to operate and the product is B2B2C, with an increasing number of customers every quarter and so are the revenues. The main customers are small and large companies in the USA on the one hand, and the huge insurance companies on the other. They are located in Tel Aviv with a train line and incorporate a hybrid work model. There are 65 employees.
          The essence of the position - joining the development team, reporting to the team leader. The backend is written in Python, the frontend in React. The role includes end-to-end development with a tendency towards Frontend (up to 80%, 50/50 is also possible). Work on AWS, Microservices, NoSQL.
          Job requirements:
          - 3 years of experience in Full Stack/Frontend development
          - Experience in React
          - Experience in Python/NodeJS/Go
          - Cloud experience
          - Experience from start-up/high-tech/SaaS companies`
    );
    console.log(sentences);
    const res = RequirementsReader.checkIsRequirementsMatch(sentences, profile);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
  });
  test('Tests many sentences from real text where the job in allJobs is not fit by overall experience -ex13', () => {
    const sentences = RequirementsReader.getSentences(
      `An exciting company in the field of gaming in Tel Aviv needs Fullstack development people to work in a young environment, with advanced technologies! Requirements: 6 years of experience in Fullstack development - mandatory experience in one of the languages - Java / Python / GO / Node.js The actual development will be done in Node .js and React The job is intended for both women and men.`
    );
    console.log(sentences);
    const res = RequirementsReader.checkIsRequirementsMatch(sentences, profile);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
  });
  test('Tests many sentences from real text where the jobs in allJobs is not fit by stack -ex14', () => {
    const sentences = RequirementsReader.getSentences(
      `Requirements:
          - At least two years of experience in Net development.
          - At least two years of experience in Angular development
          - Working with ETL processes
          - Experience in WebApi, Restful services The position is intended for both women and men.`
    );
    console.log(sentences);
    const res = RequirementsReader.checkIsRequirementsMatch(sentences, profile);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
  });
});
