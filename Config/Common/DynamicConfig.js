module.exports = {
    IPLimitedCount: 5,
    DailyLoginConfig: [
        {
            RechargeGoldRequired: 0,
            AwardList: [
                {
                    AwardID: 0,
                    DayCount: 'default',
                    GoldAward: 0,
                    IsBounding: false
                },
                {
                    AwardID: 1,
                    DayCount: 1,
                    GoldAward: 3000,
                    IsBounding: false
                },
                {
                    AwardID: 2,
                    DayCount: 2,
                    GoldAward: 1000,
                    IsBounding: false
                },
                {
                    AwardID: 3,
                    DayCount: 3,
                    GoldAward: 1000,
                    IsBounding: false
                },
                {
                    AwardID: 4,
                    DayCount: 4,
                    GoldAward: 1000,
                    IsBounding: false
                },
                {
                    AwardID: 5,
                    DayCount: 5,
                    GoldAward: 1000,
                    IsBounding: false
                },
                {
                    AwardID: 6,
                    DayCount: 6,
                    GoldAward: 1000,
                    IsBounding: false
                },
                {
                    AwardID: 7,
                    DayCount: 7,
                    GoldAward: 2000,
                    IsBounding: false
                }

            ]
        }
    ],
    OnlineAwardConfig: [
        {
            RechargeGoldRequired: 0,
            AwardList: [
                {
                    AwardID: 1,
                    OnlineTime: 180,
                    GoldAward: 500,
                    LimitedGold: 50000
                },
                {
                    AwardID: 2,
                    OnlineTime: 300,
                    GoldAward: 700,
                    LimitedGold: 50000
                },
                {
                    AwardID: 3,
                    OnlineTime: 600,
                    GoldAward: 1000,
                    LimitedGold: 50000
                },
                {
                    AwardID: 4,
                    OnlineTime: 900,
                    GoldAward: 1200,
                    LimitedGold: 50000
                },
                {
                    AwardID: 5,
                    OnlineTime: 1200,
                    GoldAward: 1600,
                    LimitedGold: 50000
                },
                {
                    AwardID: 6,
                    OnlineTime: 1500,
                    GoldAward: 2000,
                    LimitedGold: 50000
                },
                {
                    AwardID: 7,
                    OnlineTime: 1800,
                    GoldAward: 3000,
                    LimitedGold: 50000
                }
            ]
        }
    ],
    JackpotUpdateConfig: {
        NeedUpdate: [
            {
                GameID: 4,
                KindID: 401,
                DataKey: 'SLOTJP:401:*'
            },
            {
                GameID: 4,
                KindID: 402,
                DataKey: 'SLOTJP:402:*'
            }
        ]
    },
    FishVersion: 3,
    VPTypeConfig: [
        {
            TypeID: 1, // BC
            GameList: [1] // bc
        },
        {
            TypeID: 2, // Cược
            GameList: [2,5,6] //tx,bcr,xd
        },
        {
            TypeID: 3, // Slot
            GameList: [4]
        },
        {
            TypeID: 4, // Agent (nạp card)
            GameList: ['agent']
        }
    ],
    VPConfig : [
        {
            GameList: [2, 4, 6],
            Ratio: 1
        },
        {
            GameList: [1],
            Ratio: 1
        },
        {
            GameList: ['agent'],
            Ratio: 10
        }
    ],
    VPConfigDefault :  {
        Ratio: 0
    }
};
