// import { RequirementsReader } from '../RequirementsReader';

import { UserQuery } from '../../generalQuery/query';
import { User } from '../../user/user';
import { RequirementsReader } from '../requirementsReader';

describe.only('Testss real examples of checkIsRequirementsMatch function', () => {
  // Note: next time that I will run the tests they probably will be failed because I change the the constants.

  const REQUIREMENTS = {
    javascript: { min: 0, max: 3 },
    react: { min: 0, max: 3 },
    reactjs: { min: 0, max: 3 },
    typescript: { min: 0, max: 3 },
    ts: { min: 0, max: 3 },
    js: { min: 0, max: 3 },
    node: { min: 0, max: 2 },
    nextjs: { min: 0, max: 3 },
    git: { min: 0, max: 3 },
    github: { min: 0, max: 3 },
    html: { min: 0, max: 3 },
    css: { min: 0, max: 3 },
    scss: { min: 0, max: 3 },
    tailwinds: { min: 0, max: 3 },
    mui: { min: 0, max: 3 },
    express: { min: 0, max: 3 },
    fullstack: { min: 0, max: 3 },
    frontend: { min: 0, max: 3 },
    sql: { min: 0, max: 3 },
    python: { min: 0, max: 2 },
    mongo: { min: 0, max: 3 },
    nosql: { min: 0, max: 3 },
    noSQL: { min: 0, max: 3 },
  };

  const EXAMPLE_QUERY: UserQuery = {
    location: 'תל אביב',
    position: 'Frontend',
    distance: '1', // 10,25,50,75,
    jobType: '1,2,3', // 1 hybrid, 2:home ,3:onsite
    scope: '1,2', // 1 full, 2:part
    experience: '1,2', //without -1 ,between 1-2,
    active: true,
  };

  const EXAMPLE_USER = new User({
    overallEx: 2,
    requirementsOptions: REQUIREMENTS,
    excludeRequirements: {
      'c#.net': true,
      php: true,
      c: true,
      'c#': true,
      java: true,
      'system administration': true,
      embedded: true,
      go: true,
      ruby: true,
      angular: true,
      net: true,
      qa: true,
    },
    blackList: [
      // 'senior',
      // 'lead',
      // 'angular',
      // 'devops',
      // 'cloud',
      // 'wordpress',
      // 'devops',
      // 'data analyst',
      // 'data',
      // 'ux',
      // 'ui',
      // 'quality assurance',
      // 'qa',
      // 'csv',
      // 'php',
      // 'communications',
      // 'embedded',
      // 'power supply',
      // 'java',
      // 'ruby',
      // 'go',
      // 'etl',
      // 'technical solution',
      // 'tax',
      // 'eae',
      // 'associate embedded systems engineer',
      // 'ese',
      // 'system test',
      // 'Tier 2 Support Agent',
      // 'Sales Manager',
    ],
    _id: '1',
    hashQueries: [],
    userQuery: EXAMPLE_QUERY,
  });

  test(`Tests many sentences from real text that its not match the user experience-ex`, () => {
    const sentences = `  c#.net core – 3+ years of experience javascript 14+ - 2+ years of experience any nosql db – 3+ years of experience experience with rest api development performance and security-first thinking team player`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
    expect(res.reason).toBe(`c#.net is not in your stack`);
  });
  test(`Tests many sentences from real text that its match the user experience-ex1`, () => {
    const EXAMPLE_USER = new User({
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: {},
      _id: '1',
      userQuery: EXAMPLE_QUERY,
      hashQueries: [],
      blackList: [],
    });

    const sentences = `typescript core – 2 years of experience javascript 14+ - 2+ years of experience any nosql db – 3+ years of experience experience with rest api development performance and security-first thinking team player`;

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeTruthy();
  });
  test(`Tests many sentences from real text that not match the user experience-ex2`, () => {
    const EXAMPLE_USER = new User({
      overallEx: 1,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: {},
      _id: '1',
      userQuery: EXAMPLE_QUERY,
      hashQueries: [],
      blackList: [],
    });

    const sentences = `8+ years working experience with java (minimum 70%
      backend) – must 4+ years working experience with different spring
      projects (for example framework, security,
      integration) – must experience with microservices and related technologies
      (aws, docker, k8s) – must experience with messaging – must experience with sql – must experience in leading feature development end-to-end,
      working with all stakeholders and guiding other
      developers – must understanding of web fundamentals: javascript,
      typescript, html5, css3, responsive design, etc. –
      must experience with react – must experience with orm – advantage b.sc. degree in computer science, engineering, or
      related field – advantage design & develop new features in an agile
      software methodology. own your deliveries from design, all the way to
      production. communicate with all stakeholders (product, qa,
      architect, support, integrators, etc.`;

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });
  test(`Tests many sentences from real text that match the user experience-ex3`, () => {
    const EXAMPLE_USER = new User({
      overallEx: 2,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: {},
      _id: '1',
      userQuery: EXAMPLE_QUERY,
      hashQueries: [],
      blackList: [],
    });

    const sentences = `manage and optimize scalable distributed systems on
    the cloud (storage, servers, api). design robust apis. write scripting for the products backend pipeline. deploy ai models delivered by the team into the
    product pipeline. optimization of applications for scalability and
    performance. at least 1 year of experience in backend, big data,
    and data engineering development. python scripting
    languages- must. experience designing restful apis. experience working with sql or other data storage
    systems, like orm, nosql, or others. team player, someone we’d love to work with, and
    independent.`;

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeTruthy();
  });
  test(`Tests many sentences from real text that match the user experience-ex4`, () => {
    const EXAMPLE_USER = new User({
      overallEx: 2,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: {},
      _id: '1',
      userQuery: EXAMPLE_QUERY,
      hashQueries: [],
      blackList: [],
    });

    const sentences = ` build & maintain our ecommerce web application
    with a focus on the ux & ui. design and develop the overall architecture of the web
    application. collaborate with the rest of the engineering team to
    design and launch new features. use and create integrations with multiple tools &
    services. strong experience and understanding of javascript, css
    & html5. passionate about building beautiful and
    well-structured products. problem-solving attitude. excellent english skills. great communication skills and a team-player
    attitude. familiarity with microsoft tools. past experience relating to working with content
    management systems (cms). experience working with azure - an advantage. experience / basic knowledge in c# - an advantage. b.sc in computer science/software engineering or
    related field - an advantage. knowledge and skills in user experience (ux) design -
    an advantage.`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    // expect(res.pass).toBeFalsy();

    expect(res.pass).toBeTruthy();
  });
  test(`Tests many sentences from real text that match the user experience-ex5`, () => {
    const EXAMPLE_USER = new User({
      overallEx: 2,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: {},
      _id: '1',
      userQuery: EXAMPLE_QUERY,
      hashQueries: [],
      blackList: [],
    });

    const sentences = `you will develop, debug, deliver and maintain a
    highly-complex system, that is the core of our
    company's growth. you will work in an agile development environment. you will deliver high quality and well-structured code 4+ years of experience as a software developer with
    front-end and back-end development. experience with node.js. excellent javascript (including es6), html and css
    skills. exposure to front end, single page application
    oriented frameworks such as angular, reactjs, etc. working with web services (e.g. rest services) and
    good understanding of network concepts (e.g. http
    protocol, sockets etc.). knowledge of browser troubleshooting and debugging
    practices and techniques.`;

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });

  test('Tests many sentences from real text that match the user experience-ex6', () => {
    const sentences = `Lookout for an experienced Full Stack Developer who has a passion for design & technology, and a strong drive to get things done -the right way.The acquisition by MasterCard has expanded DY’s horizons, opening up new verticals, including the financial industry.This is a huge opportunity for us and one of the company's biggest growth engines.Our goal is to bring personalization to the world of banking and finance. Your work, together with the team’s contribution,will impact millions of consumers through node.js  React's sophisticated backend and fancy UI.The Task-at-Hand:Build a highly complex web application based on React & Node.js from the ground up.Ownership of technical design of new features.Lead feature development and turn beautiful mockups into rich, fully functional interfaces.Stay updated and lead technological advances related to user experience.Requirements:  Optimal Skills for Success:At least 3 years of experience with React.At least 3 years of JavaScript experience.At least 3 years of experience building backend systems with NodeJS.Object Oriented Programming.SQL/NoSQL database experience (MySQL, Redis) a plus.A degree in Computer Science or a related discipline.Excellent verbal and written communication skills in English. המשרה מיועדת לנשים ולגברים כאחד.`;
    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass;

    expect(res).toBeFalsy();
  });
  test('Tests many sentences from real text that may cause to infinite loop-ex7', () => {
    const EXAMPLE_USER = new User({
      overallEx: 2,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: {},
      _id: '1',
      userQuery: EXAMPLE_QUERY,
      hashQueries: [],
      blackList: [],
    });

    const sentences = `A large medical organization in Jerusalem, Netanya and the tender is looking for a Share Point developer.
          Join the team specializing in Share Point based portals in the Digital and Data Department in the Information Systems Division, at the organization's headquarters.
          As part of the position: regular communication with the team leader, other system analysts in the team, programmers, users and managers.
          The position includes E2E development on 2 main platforms - ON PREM and 365.
          Requirements:
          - Appropriate education (degree in information systems/ computer science/ other relevant studies)
          - At least two years of experience in SharePoint implementation and development
          - At least one year of experience as a Server side developer including working with NET.
          - At least one year of experience as a Client side developer including working with HTML, CSS, XML, XSL, JS
          - Experience working with databases - SQL The position is intended for both women and men.`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.count).toBeLessThan(RequirementsReader.WORDS_COUNT_KILL);
    expect(res.pass).toBeTruthy();
  });
  test('Tests many sentences from real text that may cause to infinite loop-ex8', () => {
    const sentences = `Were looking for a Full Stack developer to join our development team and be responsible for building a SaaS back-office platform that will integrate with our core technology and systems.
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
          המשרה מיועדת לנשים ולגברים כאחד.`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    expect(res.count).toBeLessThan(RequirementsReader.WORDS_COUNT_KILL);
    expect(res.pass).toBeTruthy();
  });
  test('Tests many sentences from real text that may cause to infinite loop-ex9', () => {
    const sentences = `Lookout for an experienced Full Stack Developer who has a passion for design & technology, and a strong drive to get things done - the right way.The acquisition by MasterCard has expanded DYs horizons, opening up new verticals, including the financial industry.This is a huge opportunity for us and one of the company's biggest growth engines.Our goal is to bring personalization to the world of banking and finance. Your work, together with the teams contribution,will impact millions of consumers through node.js  React's sophisticated backend and fancy UI.The Task-at-Hand:Build a highly complex web application based on React & Node.js from the ground up.Ownership of technical design of new features.Lead feature development and turn beautiful mockups into rich, fully functional interfaces.Stay updated and lead technological advances related to user experience.Requirements:  Optimal Skills for Success:At least 3 years of experience with React.At least 3 years of JavaScript experience.At least 3 years of experience building backend systems with NodeJS.Object Oriented Programming.SQL/NoSQL database experience (MySQL, Redis) a plus.A degree in Computer Science or a related discipline.Excellent verbal and written communication skills in English. המשרה מיועדת לנשים ולגברים כאחד.`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    expect(res.count).toBeLessThan(RequirementsReader.WORDS_COUNT_KILL);
    expect(res.pass).toBeFalsy();
  });

  test('Tests many sentences from real text that not match to any word in my stack but it does-ex10', () => {
    const sentences = `Softwave company needs a FS developer
          Job definition: work against specific characterizations and business requirements.
          Understanding and connection to the company's business activity for efficient and targeted development.
          Fault and availability support.
          Regular maintenance of the system and troubleshooting.
          Requirements:
          * Two or more years of development experience in the C#, ASP.NET, .NET environment - mandatory
          * Entity Framework 6 - mandatory
          * Experience in Umbraco
          * Bootstrap, JAVASCRIPT, experience in the ReactJS or Angular 2 environment. The position is intended for both women and men.`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
    expect(res.reason).toBe(`c# is not in your stack`);
  });
  test('Tests many sentences from real text that the overall experience is bigger than mine.-ex11', () => {
    const sentences = `5 years of experience in .Net technologies - ASP.Net and Net Core.
          Development in MSSQL or Oracle
          Experience with GIT configuration management tools
          Knowledge and experience in Javascript, Json, HTML 5, CSS 3
          Knowledge and experience with frameworks such as React, Vue, Angular - an advantage
          Knowledge and experience in infrastructure development.Net - Knowledge and experience in Java development - an advantage The position is intended for both women and men.`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
  });

  test('Tests many sentences from real text where the some technologies fit my stack but other are not but still the job pass-ex12', () => {
    const sentences = `This is a company that has developed a product that optimizes and shortens the sales processes of insurance for businesses, specifically in the field of cyber insurance. This is a long and complicated process that they know how to optimize with a few clicks of a button (saving a few business days and serious savings in insurance prices). It is a SaaS platform that is very easy to operate and the product is B2B2C, with an increasing number of customers every quarter and so are the revenues. The main customers are small and large companies in the USA on the one hand, and the huge insurance companies on the other. They are located in Tel Aviv with a train line and incorporate a hybrid work model. There are 65 employees.
          The essence of the position - joining the development team, reporting to the team leader. The backend is written in Python, the frontend in React. The role includes end-to-end development with a tendency towards Frontend (up to 80%, 50/50 is also possible). Work on AWS, Microservices, NoSQL.
          Job requirements:
          - 3 years of experience in Full Stack/Frontend development
          - Experience in React
          - Experience in Python/NodeJS/Go
          - Cloud experience
          - Experience from start-up/high-tech/SaaS companies`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
  });
  test('Tests many sentences from real text where the job in allJobs is not fit by overall experience -ex13', () => {
    const sentences = `An exciting company in the field of gaming in Tel Aviv needs Fullstack development people to work in a young environment, with advanced technologies! Requirements: 6 years of experience in Fullstack development - mandatory experience in one of the languages - Java / Python / GO / Node.js The actual development will be done in Node .js and React The job is intended for both women and men.`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
  });
  test('Tests many sentences from real text where the jobs in allJobs is not fit by stack -ex14', () => {
    const sentences = `Requirements:
          - At least two years of experience in Net development.
          - At least two years of experience in Angular development
          - Working with ETL processes
          - Experience in WebApi, Restful services The position is intended for both women and men.`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
  });
  test('Tests many sentences from real text where the jobs in drushim is not fit by overall experience and still pass -ex15', () => {
    const sentences = `Requirements:
      At least 4+ years of development experience
      Working experience in Node.js and React is a must
      Proficiency in written and spoken English
      Bonus Points
      Knowledge of dev-lest methodologies.
      Expertise in functional programming
      Experience in developing SaaS products`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
  });
  test('Tests many sentences from real text where the job from linkedin should pass -ex16', () => {
    const sentences = `What will you do?

      Deliver state-of-the-art user interfaces by collaborating with product, design teams, and other functions to build a user experience that matters.
      You are a versatile, passionate problem-solver developer with a track record of contributing to multiple aspects of a company and successful projects.
      End-to-end contribution to each step of the product development process, from ideation to implementation and release;
      You strive to take a key role in influencing the success and growth of products.
      Our technologies: Javascript, Typescript, HTML, CSS, ReactJS, Python, GCP
      What you bring to the table?
      
      Minimum 2-4 years of experience in building web applications.
      Experience in Javascript/Typescript, HTML CSS, and ReactJS.
      Familiarity with Python, GCP, Docker, and K8s.
      Nice to have: Experience in building a VSCode Extension
      You bring an independent and entrepreneurial attitude and are excited about working in a fast-paced, uncertain, and big-vision environment. Evidence of previous projects with extensions is a major plus`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeTruthy();
  });
  test('Tests many sentences from real text where the job from linkedin should pass -ex17', () => {
    const sentences = `B.Sc in computer science or equivalent.
      At least 2-3 years of previous experience as a Backend / Full Stack developer, Server side - .net, C#.
      At least 2 years of experience in JavaScript.
      knowledge in HTML & CSS.
      Experience in SQL server databases (or equivalent).
      Knowledge or experience in web frameworks & libraries: Angular/React – an advantage.
      Experience in APIs (REST, SOAP)
      
      Nice-to-haves:
      
      Experience working with AWS services
      Experience in NoSQL databases
      Experience in Columnar databases
      Soft Skils:
      
      Excellent self-learning ability.
      Independent and reliable.
      Strong analytical and problem-solving skills.
      Strong interpersonal skills, with excellent verbal, and written communication skills (English & Hebrew).
      Ability to work under pressure and meet deliveries.
      Flexible and able to adapt in a changing and growing company.
      `;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
    expect(res.reason).toBe(`.net is not in your stack`);
  });
  test('Tests many sentences from real text where the job from linkedin should pass -ex18', () => {
    const sentences = `Minimum 2-4 years of experience in building web applications.
      Experience in Javascript/Typescript, HTML CSS, and ReactJS.
      Familiarity with Python, GCP, Docker, and K8s.
      Nice to have: Experience in building a VSCode Extension
      You bring an independent and entrepreneurial attitude and are excited about working in a fast-paced, uncertain, and big-vision environment. Evidence of previous projects with extensions is a major plus `;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeTruthy();
  });
  test.skip(`Tests many sentences from real text where the job from drushim shouldn't pass but with the right reason -ex19`, () => {
    const sentences = `Appropriate education (degree in information systems/ computer science/ other relevant studies)
      - At least two years of experience in SharePoint implementation and development
      - At least one year of experience as a Server side developer including working with NET.
      - At least one year of experience as a Client side developer including working with HTML, CSS, XML, XSL, JS
      - Experience working with SQL databases `;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
    expect(res.reason).toBe(`net. is not in your stack`);
  });
  test(`Tests many sentences from real text where the job from gotFriend shouldn't pass  because stacks that is in excluded stack-ex20`, () => {
    const sentences = `2 years of experience in Full Stack/Frontend development
      - Experience in React
      - Experience in Python/NodeJS/Go
      - Cloud experience
      - Experience from start-up/high-tech/SaaS companies`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
    expect(res.reason).toBe(`go is not in your stack`);
  });
  test(`Tests many sentences from real text where the job from gotFriend shouldn't pass  because the overall experience is bigger-ex21`, () => {
    const sentences = `4 years of experience in Node.js
      - 4 years of experience in Angular/Vue.js/React
      - high level English`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
    expect(res.reason).toBe(`Your ${EXAMPLE_USER.overallEx} years experience is lower than 4 years`);
  });
  test(`Tests many sentences from real text where the job from gotFriend shouldn't pass because the overall experience is bigger-ex22`, () => {
    const sentences = `4 years of development experience
      - Net Web experience
      - Client experience
      - A technological degree or graduate of a technological unit`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
    expect(res.reason).toBe(`Your ${EXAMPLE_USER.overallEx} years experience is lower than 4 years`);
  });
  test(`Tests many sentences from real text where the job from gotFriend shouldn't pass because the overall experience is bigger-ex23`, () => {
    const sentences = ` 5 years of development experience
      - Experience in Node
      - Experience in React
      - Experience in AWS
      - Experience from start-up companies`;

    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);
    console.log(res.reason);
    expect(res.pass).toBeFalsy();
    expect(res.reason).toBe(`Your ${EXAMPLE_USER.overallEx} years experience is lower than 5 years`);
  });
});
