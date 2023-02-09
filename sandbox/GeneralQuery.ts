import { GeneralQuery } from '../lib/GeneralQuery';

const exampleQuery = {
  location: 'telaviv',
  postition: 'fullstack',
  distance: 10, // 10,25,50,75,

  type: '1,2"', // 1 hybrid, 2:home ,3:onsite
  scope: '1,2', // 1 full, 2:part
  experience: '1,2', //without -1 ,between 1-2,
  blackList: [],
};

const generalQuery = new GeneralQuery(exampleQuery);
