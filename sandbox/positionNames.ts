import { ScanningFS } from '../lib/ScanningFS';
import path from 'path';
import { GenericRecord } from '../lib/types/types';
export interface ChildCategory {
  ID: number;
  ParentID: number;
  Name: string;
  JobCount: number;
  Keywords: string;
  JobCategoryNameMultiGender: string;
}
export interface AllJobsCats {
  ID: number;
  Name: string;
  JobCount: number;
  ChildCategories: ChildCategory[];
}
export interface GotFriendsPositions {
  checkboxProfessions: string;
  radioAreas: string;
}
export interface AllPositionName {
  regularName: string;
  gotFriends: GotFriendsPositions;
}

(async () => {
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

  // hebrewWords.forEach((el, i) => {
  //   dictPositions[el] = { en: englishWords[i].trim(), he: el.trim() };
  // });

  //   console.log(gotFriendsPos);
  const cats = await ScanningFS.readJSON<AllJobsCats[]>(path.join(__dirname, 'JSON', 'cat.json'));
  if (!cats) return;
  const positionsData: GenericRecord<{
    he: string;
    gotFriends: GotFriendsPositions;
  }> = {};
  for (const cat of cats) {
    cat.ChildCategories.forEach((el) => {
      const keywords = el.Keywords.split(',');

      keywords.forEach((el) => {
        const keyPos = el.trim();
        positionsData[keyPos] = {
          he: keyPos,
          gotFriends: gotFriendsPos[keyPos],
        };
      });
    });
  }

  await ScanningFS.writeJSON(positionsData, path.join(__dirname, 'JSON', 'positionHeNames.json'));

  // console.log(catAr['מנהל איכות']);
})();
