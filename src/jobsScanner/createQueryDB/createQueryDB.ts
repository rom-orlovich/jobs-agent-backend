import path from 'path';

import axios from 'axios';

import { allJobCities } from './allJobCities';
import { hebrewPos } from './hePosWords';
import { englishPos } from './enPosWords';
import { LOCATIONS_DICT_DB } from './locationDictDB';
import { POSITIONS_DICT_DB } from './positionDictDB';
import { MongoDBClient } from '../../../mongoDB/mongoClient';
import {
  AllJobCityData,
  AllJobsCats,
  DrushimCitiesData,
  GotFriendsPositions,
  PositionData,
  Result,
  Root,
} from './lib/createQueryDB';
import { GenericRecord, OmitKey } from '../../../lib/types';
import { ScanningFS } from '../../../lib/scanningFS';
import { config } from 'dotenv';

const createPositionDB = async () => {
  const gotFriendsCatArr = await ScanningFS.readJSON<GenericRecord<string>[]>(
    path.join(__dirname, 'JSON', 'gotFriends.json')
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

  await ScanningFS.writeJSON(positionsData, path.join(__dirname, 'JSON', 'positionDictDB.json'));
};

const createCitiesDB = async () => {
  const citiesEn = await axios<any, { data: Result }, Root>(
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
  const citiesHe = await axios<any, { data: Result }, Root>(
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
  citiesHe.data.resultList.rows.forEach(
    (el: any) => (drushimCitiesDict[el[5]] = { he: el[0], geolexid: el[5] })
  );

  citiesEn.data.resultList.rows.forEach(
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

  await ScanningFS.writeJSON(allCitiesMap, path.join(__dirname, 'JSON', 'locationDictDB.json'));
};

/**
 * This function creates positionDictDB.json and locationDictDB.json flies.
 */
export async function createQueryDB() {
  await createPositionDB();
  await createCitiesDB();
}

export async function insertLocationsDB() {
  config();
  const db = new MongoDBClient();
  const locations = db.createDBcollection('jobs-agent-db', 'locations');
  locations
    .insertMany(
      Object.keys(LOCATIONS_DICT_DB).map((el, i) => ({ locationID: el + i, locationName: el }))
    )
    .then((res) => {
      console.log(res);
    })
    .finally(async () => {
      await db.close();

      console.log('close');
    });
}

export async function insertPositionsDB() {
  config();

  const db = new MongoDBClient();
  const positions = db.createDBcollection('jobs-agent-db', 'positions');
  positions
    .insertMany(
      Object.keys(POSITIONS_DICT_DB).map((el, i) => ({ positionID: el + i, positionName: el }))
    )
    .then((el) => console.log(el))
    .finally(async () => {
      await db.close();

      console.log('close');
    });
}

/**
 * After create locationDictDB.json and  positionDictDB.json those files should be copy to .ts files
 * with the same name and assign their content to LOCATIONS_DICT_DB, POSITIONS_DICT_DB variables.
 */

export async function createPositionsLocationsInDB() {
  await insertLocationsDB();
  await insertPositionsDB();
}
