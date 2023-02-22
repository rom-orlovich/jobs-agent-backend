// import { config } from 'dotenv';
// import { JobsDB } from '../lib/jobsDB';
// import { MongoDBClient } from '../lib/mongoClient';
// import { EXPIRE_AT, EXPIRE_AT_MONGO_DB } from '../src/jobsScanner/user/hashQuery';
// // const job = {
// //   link: 'https://www.gotfriends.co.il/jobslobby/software/full-stack-developer/141944/',
// //   title: 'Full-Stack Engineer בחברה בתחום ה- Fintech',
// //   jobID: '141944',
// //   location: 'ת"א והמרכז',
// //   company: '',
// //   from: 'gotFriends',
// //   text: 'Job requirements:\n- 5 years of experience in Full-Stack development - 2 years of experience in Node and React',
// //   createdAt: new Date(),
// //   hashQueries: ['d9763a7c9ebfd019ddd60b4f2bc04eb7c474943c'],
// // };

// // const job3 = {
// //   link: 'https://www.gotfriends.co.il/jobslobby/software/full-stack-developer/141944/',
// //   title: 'Full-Stack Engineer בחברה בתחום ה- Fintech',
// //   jobID: '141944',
// //   location: 'ת"א והמרכז',
// //   company: '',
// //   from: 'gotFriends',
// //   text: 'Job requirements:\n- 5 years of experience in Full-Stack development - 2 years of experience in Node and React',
// //   createdAt: new Date(),
// //   hashQueries: ['d9763a7c9ebfd019ddd60b4f2bc04eb7c474943c'],
// // };
// // const job2 = {
// //   link: 'https://www.gotfriends.co.il/jobslobby/software/full-stack-developer/141944/',
// //   title: 'Full-Stack Engineer בחברה בתחום ה- Fintech',
// //   jobID: '141944',
// //   location: 'ת"א והמרכז',
// //   company: '',
// //   from: 'gotFriends',
// //   text: 'Job requirements:\n- 5 years of experience in Full-Stack development - 2 years of experience in Node and React',
// //   createdAt: new Date(),
// //   hashQueries: ['d9763a7c9ebfd019ddd60b4f2bc04eb7c474943c'],
// // };
// // const job4 = {
// //   link: 'https://www.gotfriends.co.il/jobslobby/software/full-stack-developer/141944/',
// //   title: 'Full-Stack Engineer בחברה בתחום ה- Fintech',
// //   jobID: '141944',
// //   location: 'ת"א והמרכז',
// //   company: '',
// //   from: 'gotFriends',
// //   text: 'Job requirements:\n- 5 years of experience in Full-Stack development - 2 years of experience in Node and React',
// //   createdAt: new Date(),
// //   hashQueries: ['d9763a7c9ebfd019ddd60b4f2bc04eb7c474943c'],
// // };

// // (async () => {
// //   const mongodb = new MongoDBClient();
// //   await mongodb.connect();
// //   const jobDB = new JobsDB();
// //   const jobs1 = await jobDB.insertOne(job);
// //   const jobs2 = await jobDB.insertOne(job2);
// //   const jobs3 = await jobDB.insertOne(job3);
// //   const jobs4 = await jobDB.insertOne(job4);
// //   const res = await jobDB.jobsDB.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 });
// //   console.log(res);
// //   await mongodb.close();
// // })();
// config();
// (async () => {
//   const mongodb = new MongoDBClient();
//   await mongodb.connect();
//   const jobDB = new JobsDB();
//   // const jobs1 = await jobDB.jobsDB.find({}).toArray();
//   // jobDB.jobsDB.deleteMany({});
//   const now = new Date();
//   const cutoffTime = new Date(now.getTime() - 60 * 1000 * 20);
//   console.log(cutoffTime, EXPIRE_AT, new Date());

//   // Build the query to delete documents with createdAt more than 1 minute in the past
//   const query = { createdAt: { $lte: ['$createdAt', { $add: [60 * 1000] }] } };
//   const result = await jobDB.jobsDB
//     .aggregate([
//       {
//         $match: {
//           createdAt: { $lt: { $add: ['$createdAt', 20 * 60 * 1000] } },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//         },
//       },
//     ])
//     .toArray();
//   console.log(result);
//   // const res = await jobDB.jobsDB.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 });
//   // console.log(jobs1.filter((el) => !el?.createdAt));
//   console.log(result);
//   await mongodb.close();
// })();
