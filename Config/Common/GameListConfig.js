var RoomKindConfig = require('./RoomKindConfig');
module.exports = {
    Fish: {
        GameID: 1,
        GameName: "Fish",
        Config: [
            {
                KindID: RoomKindConfig.FishFree,
                LevelRequire: 0,
                MoneyRequire: 10,
                Enable: true
            },
            {
                KindID: RoomKindConfig.FishVip,
                LevelRequire: 0,
                MoneyRequire: 1000000,
                Enable: true
            },
            {
                KindID: RoomKindConfig.FishTrial,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            }
        ]
    },
    TaiXiu: {
        GameID: 2,
        GameName: "TaiXiu",
        Config: [
            {
                KindID: RoomKindConfig.TaiXiuFree,
                LevelRequire: 0,
                MoneyRequire: 20000,
                Enable: true
            }
        ]
    },
    Poker: {
        GameID: 3,
        GameName: "Poker",
        Config: [
            {
                KindID: RoomKindConfig.PokerFree,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            }
        ]
    },
    SlotTuLongThan: {
        GameID: 4,
        GameName: "Slot",
        Config: [
            {
                KindID: RoomKindConfig.SlotTuLongThan,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            },
            {
                KindID: RoomKindConfig.SlotHoaQua,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            },
            {
                KindID: RoomKindConfig.SlotHawaii,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            }
        ]
    },
    Baccarat: {
        GameID: 5,
        GameName: "Baccarat",
        Config: [
            {
                KindID: RoomKindConfig.BaccaratFree,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            }
        ]
    },
    XocDia: {
        GameID: 6,
        GameName: "Xoc Dia",
        Config: [
            {
                KindID: RoomKindConfig.XocDiaFree,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            }
        ]
    },
    TLMN: {
        GameID: 7,
        GameName: "Tien Len Mien Nam",
        Config: [
            {
                KindID: RoomKindConfig.TLMNFree,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            }
        ]
    },
    Bingo: {
        GameID: 8,
        GameName: "Bingo",
        Config: [
            {
                KindID: RoomKindConfig.BingoLobby,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            },
            {
                KindID: RoomKindConfig.BingoClassical,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            },
            {
                KindID: RoomKindConfig.BingoEasy,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            }
        ]
    },
    Bird: {
        GameID: 9,
        GameName: "Bingo",
        Config: [
            {
                KindID: RoomKindConfig.BirdFree,
                LevelRequire: 0,
                MoneyRequire: 10000,
                Enable: true
            }
        ]
    },
    VQMM: {
        GameID: 100,
        GameName: "Vong Quay May Man",
        Config: [
            {
                KindID: 100001,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            }
        ]
	},
    TaiXiuMini: {
        GameID: 101,
        GameName: "Tai Xiu Mini",
		Config: [
            {
                KindID: 101001,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            }
        ]
    },
    PokerMini: {
        GameID: 102,
        GameName: "PokerMini",
        Config: [
            {
                KindID: 102001,
                LevelRequire: 0,
                MoneyRequire: 0,
                Enable: true
            }
        ]
    }
};