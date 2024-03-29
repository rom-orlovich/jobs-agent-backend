import { User } from '../user';

describe('Tests invalidateCurUserQueries', () => {
  // const user = new User(EXAMPLE_USER_FROM_DB);
  test('Tests invalidate old user queries', () => {
    const resultQueries = User._loadQueriesAsUserQueryEntity([
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Full Stack Developer',
        scope: '1,2',
        updatedAt: new Date(2023, 1, 27, 9, 4),
        hash: '976e65081216b0613fdd3b762a2e7687ee78dac7',
      },
      {
        distance: '1',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Frontend Developer',
        scope: '1,2',
        updatedAt: new Date(2023, 1, 27, 9, 3),
        hash: '4e27b44817ea8c06b8580e38f389bb8c1a988673',
      },
    ]);
    const resultFilter = User._filterQueriesAsUserQueryEntity(resultQueries);
    expect(resultFilter).toEqual([]);
  });
  test('Tests invalidate new user queries', () => {
    const resultQueries = User._loadQueriesAsUserQueryEntity([
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Full Stack Developer',
        scope: '1,2',
        updatedAt: new Date(),
        hash: '976e65081216b0613fdd3b762a2e7687ee78dac7',
      },
      {
        distance: '1',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Frontend Developer',
        scope: '1,2',
        updatedAt: new Date(),
        hash: '4e27b44817ea8c06b8580e38f389bb8c1a988673',
      },
    ]);
    const resultFilter = User._filterQueriesAsUserQueryEntity(resultQueries);

    expect(resultFilter).toEqual(resultQueries);
  });
  test('Tests invalidate user queries from DB', () => {
    const resultQueries = User._loadQueriesAsUserQueryEntity([
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Full Stack Developer',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '976e65081216b0613fdd3b762a2e7687ee78dac7',
      },
      {
        distance: '1',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Frontend Developer',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '4e27b44817ea8c06b8580e38f389bb8c1a988673',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Full Stack',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '0c2503853e5ed200a535fce540380309be78e86c',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Full Stack Developers',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '4e909b4e1a12cb8be7482df3048d33b213d12107',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Full Stack Developers',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '4e909b4e1a12cb8be7482df3048d33b213d12107',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Frontend',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '14d5a2bbaf7493e896ba039a4116a63dd9b17ac8',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Frontend',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '14d5a2bbaf7493e896ba039a4116a63dd9b17ac8',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Full Stack Developer',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '976e65081216b0613fdd3b762a2e7687ee78dac7',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Full Stack Developer',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '976e65081216b0613fdd3b762a2e7687ee78dac7',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'frontend',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '7f9fcc3ea53065f06fadea738507a1eaff9246df',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'frontend',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '7f9fcc3ea53065f06fadea738507a1eaff9246df',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'frontend',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '7f9fcc3ea53065f06fadea738507a1eaff9246df',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'frontend',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '7f9fcc3ea53065f06fadea738507a1eaff9246df',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'frontend',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '7f9fcc3ea53065f06fadea738507a1eaff9246df',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Full Stack Developer',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '976e65081216b0613fdd3b762a2e7687ee78dac7',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Full Stack Developer',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '976e65081216b0613fdd3b762a2e7687ee78dac7',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Frontend',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '14d5a2bbaf7493e896ba039a4116a63dd9b17ac8',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Frontend',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '14d5a2bbaf7493e896ba039a4116a63dd9b17ac8',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Frontend',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '14d5a2bbaf7493e896ba039a4116a63dd9b17ac8',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Full Stack Programmer',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '10e30b768a07c3bd9da483e09fc44633b4ad6ac2',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Full Stack Programmer',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '10e30b768a07c3bd9da483e09fc44633b4ad6ac2',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'React',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: 'e987aaa9c2fba9381024203682f0c4cdab3e50b1',
      },
      {
        distance: '2',
        experience: '1,2',
        jobType: '1,2,3',
        location: 'קריית אונו',
        position: 'Full Stack Developer',
        scope: '1,2',
        updatedAt: new Date(`2023-02-27T05:47:04.953Z`),
        hash: '976e65081216b0613fdd3b762a2e7687ee78dac7',
      },
    ]);

    const result = User._filterQueriesAsUserQueryEntity(resultQueries);
    expect(result).toEqual([]);
  });
});
