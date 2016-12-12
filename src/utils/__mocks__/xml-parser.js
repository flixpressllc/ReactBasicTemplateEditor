'use strict';
const xmlParser = jest.genMockFromModule('../confirm');


let fakeGetAudioDone = jest.fn(cb => {
  cb(fakeAudioObject);
})

let thenable = Promise.resolve(fakeAudioObject);
let doneable = {done: function (cb) {
  thenable.then(cb)
}};

xmlParser.getAudioOptions = jest.fn(() => doneable );

const fakeAudioObject = {
    categories: {
        Inspirational: {
            id: 5,
            songs: [
                {
                    Id: 40,
                    Name: "Driving Mentality",
                    Keywords: "Driving Mentality",
                    Length: 5,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 44,
                    Name: "Inspiring Piano",
                    Keywords: "Inspiring Piano",
                    Length: 5,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 46,
                    Name: "Morning Shine",
                    Keywords: "Morning Shine",
                    Length: 5,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 49,
                    Name: "Winning Circle",
                    Keywords: "Winning Circle",
                    Length: 5,
                    LicensedAudioAccessTypeId: 2
                }
            ]
        },
        Promo: {
            id: 6,
            songs: [
                {
                    Id: 50,
                    Name: "Above All",
                    Keywords: "Above All",
                    Length: 6,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 52,
                    Name: "Ashes 2 Ashes",
                    Keywords: "Ashes 2 Ashes",
                    Length: 6,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 54,
                    Name: "Dance With Me",
                    Keywords: "Dance With Me",
                    Length: 6,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 63,
                    Name: "True Lies",
                    Keywords: "True Lies",
                    Length: 6,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 64,
                    Name: "Western Sun",
                    Keywords: "Western Sun",
                    Length: 6,
                    LicensedAudioAccessTypeId: 2
                }
            ]
        },
        'High-Energy': {
            id: 4,
            songs: [
                {
                    Id: 1,
                    Name: "5th Symphony",
                    Keywords: "5th Symphony",
                    Length: 4,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 26,
                    Name: "Breakdown",
                    Keywords: "Breakdown",
                    Length: 4,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 27,
                    Name: "Breakthrough",
                    Keywords: "Breakthrough",
                    Length: 4,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 31,
                    Name: "Forward Drive",
                    Keywords: "Forward Drive",
                    Length: 4,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 33,
                    Name: "My Choice",
                    Keywords: "My Choice",
                    Length: 4,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 37,
                    Name: "Tech Revolution",
                    Keywords: "Tech Revolution",
                    Length: 4,
                    LicensedAudioAccessTypeId: 2
                }
            ]
        },
        'Cute-Lite': {
            id: 3,
            songs: [
                {
                    Id: 14,
                    Name: "Everyday Life",
                    Keywords: "Everyday Life",
                    Length: 3,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 15,
                    Name: "Fairy Toes",
                    Keywords: "Fairy Toes",
                    Length: 3,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 16,
                    Name: "Happy Product",
                    Keywords: "Happy Product",
                    Length: 3,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 18,
                    Name: "Hi Tech Evo",
                    Keywords: "Hi Tech Evo",
                    Length: 3,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 23,
                    Name: "Sunshine",
                    Keywords: "Sunshine",
                    Length: 3,
                    LicensedAudioAccessTypeId: 2
                }
            ]
        },
        Classical: {
            id: 2,
            songs: [
                {
                    Id: 2,
                    Name: "Anitra",
                    Keywords: "Anitra",
                    Length: 2,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 3,
                    Name: "Bumblebee",
                    Keywords: "Bumblebee",
                    Length: 2,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 4,
                    Name: "Danube",
                    Keywords: "Danube",
                    Length: 2,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 7,
                    Name: "Morning",
                    Keywords: "Morning",
                    Length: 2,
                    LicensedAudioAccessTypeId: 2
                },
                {
                    Id: 8,
                    Name: "Moutain King",
                    Keywords: "Moutain King",
                    Length: 2,
                    LicensedAudioAccessTypeId: 2
                }
            ]
        },
        Various: {
            id: 8,
            songs: [
                {
                    Id: 73,
                    Name: "Crossing Over",
                    Keywords: "Crossing Over",
                    Length: 8,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 74,
                    Name: "Dancey",
                    Keywords: "Dancey",
                    Length: 8,
                    LicensedAudioAccessTypeId: 2
                }
            ]
        },
        'Short-Intro': {
            id: 7,
            songs: [
                {
                    Id: 65,
                    Name: "Intro 1",
                    Keywords: "Intro 1",
                    Length: 7,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 66,
                    Name: "Intro 2",
                    Keywords: "Intro 2",
                    Length: 7,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 67,
                    Name: "Intro 3",
                    Keywords: "Intro 3",
                    Length: 7,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 68,
                    Name: "Intro 4",
                    Keywords: "Intro 4",
                    Length: 7,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 69,
                    Name: "Intro 5",
                    Keywords: "Intro 5",
                    Length: 7,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 70,
                    Name: "Intro 6",
                    Keywords: "Intro 6",
                    Length: 7,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 71,
                    Name: "Intro 7",
                    Keywords: "Intro 7",
                    Length: 7,
                    LicensedAudioAccessTypeId: 1
                },
                {
                    Id: 72,
                    Name: "Intro 8",
                    Keywords: "Intro 8",
                    Length: 7,
                    LicensedAudioAccessTypeId: 1
                }
            ]
        }
    },
    customAudio: [
        {
            Id: 1152,
            UserId: 1075982,
            Filename: 1152,
            Name: "My Audio",
            Length: 186331
        },
        {
            Id: 3442,
            UserId: 1075982,
            Filename: 3442,
            Name: "test voice",
            Length: 2351
        }
    ]
}

export default xmlParser;
