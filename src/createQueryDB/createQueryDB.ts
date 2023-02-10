import { ScanningFS } from '../../lib/ScanningFS';
import path from 'path';
import { GenericRecord, OmitKey } from '../../lib/types/types';
import axios from 'axios';

import { allJobCities } from './allJobCities';
import { hebrewPos } from './hePosWords';
import { englishPos } from './enPosWords';
import {
  AllJobCityData,
  AllJobsCats,
  DrushimCitiesData,
  GotFriendsPositions,
  PositionData,
  Result,
  Root,
} from './lib/sandbox';

const createPositionDB = async () => {
  const gotFriendsCatArr = await ScanningFS.readJSON<GenericRecord<string>[]>(
    path.join(__dirname, 'JSON', 'gotFriendsFilters.json')
  );
  if (!gotFriendsCatArr) return;
  const gotFriendsCat = gotFriendsCatArr[0];
  const gotFriendsPos: GenericRecord<GotFriendsPositions> = {};
  Object.entries(gotFriendsCat).map(([catKey, catValue], i) => {
    Object.entries(gotFriendsCatArr[i + 1]).map(([postKey, postValue]) => {
      gotFriendsPos[postKey] = {
        ['checkboxProfessions']: `checkboxProfessions-${postValue}`,
        [`radioAreas`]: `radioAreas-${catValue}`,
      };
    });
  });

  const posDict: GenericRecord<string> = {};
  hebrewPos.forEach((el, i) => {
    posDict[el] = englishPos[i];
  });

  const cats = await ScanningFS.readJSON<AllJobsCats[]>(
    path.join(__dirname, 'JSON', 'allJobsCategories.json')
  );
  if (!cats) return;
  const positionsData = {} as PositionData;
  for (const cat of cats) {
    cat.ChildCategories.forEach((el) => {
      const keywords = el.Keywords.split(',');
      keywords.forEach((el) => {
        const keyPos = el.trim() as keyof PositionData;
        positionsData[keyPos] = {
          he: keyPos,
          gotFriends: gotFriendsPos[keyPos],
          en: posDict[keyPos]?.toLowerCase(),
        };
      });
    });
  }

  await ScanningFS.writeJSON(positionsData, path.join(__dirname, 'JSON', 'posHeWords.json'));
};

const createCitiesDB = async () => {
  const res1 = await axios<any, { data: Result }, Root>(
    'https://www.drushim.co.il/offerSearchAutoSuggest/',
    {
      method: 'post',
      data: {
        application: 'drushim',
        country: 'il',
        environment: 'live',
        searchType: 'offerSearchAutoSuggest',
        queryItems: [],
        mainResultParameter: {
          max: 1000,
          offset: 0,
          sortings: [],
          parameters: [],
          options: [],
          infos: [],
        },
        resultParameters: {},
        cookies: [],
        httpRequestInfo: {},
        parameters: [
          {
            name: 'suggestPrefix',
            value: '',
          },
          {
            name: 'suggestTypes',

            value: 'geo_multiple_city_id~en',
          },
        ],
        options: [],
        infos: [],
      },
    }
  );
  const res2 = await axios<any, { data: Result }, Root>(
    'https://www.drushim.co.il/offerSearchAutoSuggest/',
    {
      method: 'post',
      data: {
        application: 'drushim',
        country: 'il',
        environment: 'live',
        searchType: 'offerSearchAutoSuggest',
        queryItems: [],
        mainResultParameter: {
          max: 1000,
          offset: 0,
          sortings: [],
          parameters: [],
          options: [],
          infos: [],
        },
        resultParameters: {},
        cookies: [],
        httpRequestInfo: {},
        parameters: [
          {
            name: 'suggestPrefix',
            value: '',
          },
          {
            name: 'suggestTypes',

            value: 'geo_multiple_city_id~he',
          },
        ],
        options: [],
        infos: [],
      },
    }
  );

  const drushimCitiesDict: GenericRecord<DrushimCitiesData> = {};
  res2.data.resultList.rows.forEach(
    (el: any) => (drushimCitiesDict[el[5]] = { he: el[0], geolexid: el[5] })
  );
  res1.data.resultList.rows.forEach(
    (el: any) => (drushimCitiesDict[el[5]] = { ...drushimCitiesDict[el[5]], en: el[0], geolexid: el[5] })
  );
  const drushimCities: GenericRecord<DrushimCitiesData> = {};
  Object.values(drushimCitiesDict).forEach((el) => (drushimCities[el.he] = el));

  const allJobCitiesNormalize: AllJobCityData[] = [];
  allJobCities.forEach((region) => {
    region.Cities.forEach((el) => {
      allJobCitiesNormalize.push({
        source: el.ID,
        allJobCityName: el.Name,
        checkboxRegions: region.checkboxRegions,
      });
    });
  });
  const allCitiesMap: GenericRecord<OmitKey<AllJobCityData, 'allJobCityName'> & DrushimCitiesData> = {};
  Object.values(drushimCities).forEach((drushimCityName) => {
    const allJobCity = allJobCitiesNormalize.find((el) => {
      return el?.allJobCityName.trim().startsWith(drushimCityName.he?.trim());
    });
    if (allJobCity)
      allCitiesMap[drushimCityName.he] = {
        ...drushimCityName,
        checkboxRegions: allJobCity.checkboxRegions,
        source: allJobCity.source,
      };
  });
  await ScanningFS.writeJSON(allCitiesMap, path.join(__dirname, 'JSON', 'citiesDB.json'));
};

(async () => {
  // await createPosDB();
  // await createCityDB();
})();
