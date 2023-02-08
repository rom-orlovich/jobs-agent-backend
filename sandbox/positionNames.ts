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

(async () => {
  const gotFriendsCatArr = await ScanningFS.readJSON<GenericRecord<string>[]>(
    path.join(__dirname, '..', 'JSON', 'gotFriends.json')
  );
  if (!gotFriendsCatArr) return;

  const gotFriendsCat = gotFriendsCatArr[0];
  const gotFriendsPos: GenericRecord<{ checkboxProfessions: string; radioAreas: string }> = {};
  Object.entries(gotFriendsCat).map(([catKey, catValue], i) => {
    Object.entries(gotFriendsCatArr[i + 1]).map(([postKey, postValue]) => {
      gotFriendsPos[postKey] = {
        ['checkboxProfessions']: `checkboxProfessions-${postValue}`,
        [`radioAreas`]: `radioAreas-${catValue}`,
      };
    });
  });
  //   console.log(gotFriendsPos);
  const cats = await ScanningFS.readJSON<AllJobsCats[]>(path.join(__dirname, '..', 'JSON', 'cat.json'));
  if (!cats) return;
  const catAr: GenericRecord<any> = {};
  for (const cat of cats) {
    cat.ChildCategories.forEach((el) => {
      const keywords = el.Keywords.split(',');
      keywords.forEach((el) => {
        const keyPos = el.trim();
        catAr[keyPos] = {
          regularName: keyPos,
          gotFriends: gotFriendsPos[keyPos],
        };
      });
    });
  }
  //   console.log(catAr);
  //   console.log(catAr['מתכנת PHP']);
})();
