import axios from 'axios';

(async () => {
  const response = await axios.get('https://www.linkedin.com/jobs/search', {
    params: {
      keywords: 'Backend Development',
      location: 'Tel Aviv-Yafo, Tel Aviv District, Israel',
      locationId: '',
      geoId: '101570771',
      f_TPR: 'r604800',
      distance: '25',
    },
    headers: {
      cookie:
        'bcookie=""; bscookie="v=1&20230215094627340b9628-4571-4df8-8f05-f25003461b94AQH9_cOUjurpJ0k5BUZ3EWJU8QH5cHj7"; ',
      referer:
        'https://www.linkedin.com/jobs/search?keywords=Front-End%20Development&location=Tel%20Aviv-Yafo%2C%20Tel%20Aviv%20District%2C%20Israel&geoId=101570771&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0',
    },
  });
  console.log(response.data);
})();
