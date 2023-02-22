"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCANNER_QUERY_OPTIONS = void 0;
const locationDB_1 = require("../createQueryDB/locationDB");
const positionDictDB_1 = require("../createQueryDB/positionDictDB");
exports.SCANNER_QUERY_OPTIONS = {
    experience: {
        linkedin: {
            f_e: {
                '1': '1',
                '2': '2',
                '3': '3',
                '4': '4',
                '5': '5',
                // '6': '6',
            },
        },
        gotFriends: undefined,
        allJobs: undefined,
        drushim: { experience: { '1': '1', '2': '2', '3': '3', '4': '4', '5': '5' } },
    },
    scope: {
        linkedin: { f_JT: { '1': 'F', '2': 'P' } },
        gotFriends: undefined,
        allJobs: { type: { '1': '4', '2': '5' } },
        drushim: { scope: { '1': '1', '2': '2' } },
    },
    jobType: {
        linkedin: { f_WT: { '1': '3', '2': '2', '3': '1' } },
        gotFriends: undefined,
        allJobs: { type: { '1': '37', '2': { region: '11' }, '3': '' } },
        drushim: { scope: { '2': '5' } },
    },
    distance: {
        linkedin: { distance: { '1': '10', '2': '25', '3': '50' } },
        gotFriends: undefined,
        allJobs: { durations: { '1': '10', '2': '25', '3': '50' } },
        drushim: { range: { '1': '2', '2': '3', '3': '4' } },
    },
    positions: positionDictDB_1.POSITIONS_DICT_DB,
    locations: locationDB_1.LOCATIONS_DICT_DB,
};
//# sourceMappingURL=scannerQueryOptions.js.map