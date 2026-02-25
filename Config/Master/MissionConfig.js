/**
 * Created by ngocnpt on 26-May-17.
 */

var MissionConfig = {
    MinDifficult: 10,
    MaxDifficult: 20,
    Detail: [
        {
            Difficult: 0,
            MissionList: [
                {
                    MissionID:0,
                    TypeID: 1,
                    Title: {
                        userMsg: 'Tiền Thôi Mà',
                        userMsgEn: 'No Money No problem',
                        userMsgRu: '[RU] No Money No problem'
                    },
                    Desc: {
                        userMsg: 'Tiêu %s gold trong Game Cược ',
                        userMsgEn: 'Spend %s gold in Betting Game',
                        userMsgRu: '[RU] Spend %s gold in Betting Game'
                    },
                    Condition: {
                        GameList: [2, 5, 6, 8],
                        Start: 1000,
                        End: 10000
                    },
                    Reward: {
                        GoldValue: 1000
                    }
                },
                {
                    MissionID:1,
                    TypeID: 1,
                    Title: {
                        userMsg: 'Tiền Thôi Mà',
                        userMsgEn: 'No Money No problem',
                        userMsgRu: '[RU] No Money No problem'
                    },
                    Desc: {
                        userMsg: 'Tiêu %s gold trong Minigame',
                        userMsgEn: 'Spend %s gold in Minigame',
                        userMsgRu: '[RU] Spend %s gold in Minigame'
                    },
                    Condition: {
                        GameList: [100, 101],
                        Start: 1000,
                        End: 10000
                    },
                    Reward: {
                        GoldValue: 1000
                    }
                },
                {
                    MissionID:2,
                    TypeID: 1,
                    Title: {
                        userMsg: 'Tiền Thôi Mà',
                        userMsgEn: 'No Money No problem',
                        userMsgRu: '[RU] No Money No problem'
                    },
                    Desc: {
                        userMsg: 'Tiêu %s gold trong bắn chim ',
                        userMsgEn: 'Spend %s gold in Bird Hunting',
                        userMsgRu: '[RU] Spend %s gold in Bird Hunting'
                    },
                    Condition: {
                        GameList: [9],
                        Start: 1000,
                        End: 10000
                    },
                    Reward: {
                        GoldValue: 1000
                    }
                },
                {
                    MissionID:3,
                    TypeID: 1,
                    Title: {
                        userMsg: 'Tiền Thôi Mà',
                        userMsgEn: 'No Money No problem',
                        userMsgRu: '[RU] No Money No problem'
                    },
                    Desc: {
                        userMsg: 'Tiêu %s gold trong game Slot',
                        userMsgEn: 'Spend %s gold in Slot',
                        userMsgRu: '[RU] Spend %s gold in Slot'
                    },
                    Condition: {
                        GameList: [4],
                        Start: 1000,
                        End: 10000
                    },
                    Reward: {
                        GoldValue: 1000
                    }
                }
            ]
        },
        {
            Difficult: 1,
            MissionList: [
                {
                    MissionID:10,
                    TypeID: 2,
                    Title: {
                        userMsg: 'Xuống Xác',
                        userMsgEn: 'All In',
                        userMsgRu: '[RU] All In'
                    },
                    Desc: {
                        userMsg: 'Chơi %s ván Game Cược',
                        userMsgEn: 'Play %s match Betting Game',
                        userMsgRu: '[RU] Play %s match Betting Game'
                    },
                    Condition: {
                        GameList: [2, 5, 6, 8],
                        Start: 5,
                        End: 10
                    },
                    Reward: {
                        GoldValue: 1000
                    }
                },
                {
                    MissionID:11,
                    TypeID: 3,
                    Title: {
                        userMsg: 'Xuống Xác',
                        userMsgEn: 'All In',
                        userMsgRu: '[RU] All In'
                    },
                    Desc: {
                        userMsg: 'Chơi %s phút Bắn Chim',
                        userMsgEn: 'Play %s minutes Bird Hunting',
                        userMsgRu: '[RU] Play %s minutes Bird Hunting'
                    },
                    Condition: {
                        GameList: [9],
                        Start: 5,
                        End: 10
                    },
                    Reward: {
                        GoldValue: 1000
                    }
                },
                {
                    MissionID:12,
                    TypeID: 2,
                    Title: {
                        userMsg: 'Xuống Xác',
                        userMsgEn: 'All In',
                        userMsgRu: '[RU] All In'
                    },
                    Desc: {
                        userMsg: 'Quay %s lượt quay Slot',
                        userMsgEn: 'Spin %s round Slot',
                        userMsgRu: '[RU] Spin %s round Slot'
                    },
                    Condition: {
                        GameList: [4],
                        Start: 10,
                        End: 50
                    },
                    Reward: {
                        GoldValue: 1000
                    }
                }

            ]
        },
        {

            Difficult: 2,
            MissionList: [
                {
                    MissionID:20,
                    TypeID: 4,
                    Title: {
                        userMsg: 'Đỗ Thánh',
                        userMsgEn: 'God Of Gamblers',
                        userMsgRu: '[RU] God Of Gamblers'
                    },
                    Desc: {
                        userMsg: 'Thắng %s gold từ Game Cược',
                        userMsgEn: 'Win %s gold in Betting Game',
                        userMsgRu: '[RU] Win %s gold in Betting Game'
                    },
                    Condition: {
                        GameList: [2, 5, 6, 8],
                        Start: 10000,
                        End: 20000
                    },
                    Reward: {
                        GoldValue: 1000
                    }
                },
                {
                    MissionID:21,
                    TypeID: 4,
                    Title: {
                        userMsg: 'Đỗ Thánh',
                        userMsgEn: 'God Of Gamblers',
                        userMsgRu: '[RU] God Of Gamblers'
                    },
                    Desc: {
                        userMsg: 'Thắng %s gold từ Bắn Chim',
                        userMsgEn: 'Win %s gold in Bird Hunting',
                        userMsgRu: '[RU] Win %s gold in Bird Hunting'
                    },
                    Condition: {
                        GameList: [9],
                        Start: 10000,
                        End: 20000
                    },
                    Reward: {
                        GoldValue: 1000
                    }
                },
                {
                    MissionID:22,
                    TypeID: 4,
                    Title: {
                        userMsg: 'Đỗ Thánh',
                        userMsgEn: 'God Of Gamblers',
                        userMsgRu: '[RU] God Of Gamblers'
                    },
                    Desc: {
                        userMsg: 'Thắng %s gold từ Slot',
                        userMsgEn: 'Win %s gold in Slot',
                        userMsgRu: '[RU] Win %s gold in Slot'
                    },
                    Condition: {
                        GameList: [4],
                        Start: 10000,
                        End: 20000
                    },
                    Reward: {
                        GoldValue: 1000
                    }
                }

            ]
        },
        {
            Difficult: 9,
            MissionList: [
                {
                    MissionID:90,
                    TypeID: 9,
                    Title: {
                        userMsg: 'Đại Gia',
                        userMsgEn: 'Millionaire',
                        userMsgRu: '[RU] Millionaire'
                    },
                    Desc: {
                        userMsg: 'Nạp %s gold',
                        userMsgEn: 'Topup %s gold',
                        userMsgRu: '[RU] Topup %s gold'
                    },
                    Condition: {
                        GameList: [0],
                        Start: 100000,
                        End: 500000
                    },
                    Reward: {
                        GoldValue: 5000
                    }
                }

            ]
        },
        {

            Difficult: 10,
            MissionList: [
                {
                    MissionID:100,
                    TypeID: 10,
                    Title: {
                        userMsg: 'Thợ Săn Cá',
                        userMsgEn: 'Fishing',
                        userMsgRu: '[RU] Fishing'
                    },
                    Desc: {
                        userMsg: 'Thắng %s gold từ bắn cá',
                        userMsgEn: 'Win %s gold in game',
                        userMsgRu: '[RU] Win %s gold in game'
                    },
                    Condition: {
                        GameList: [1],
                        Start: 20000,
                        End: 50000
                    },
                    Reward: {
                        GoldValue: 5000
                    }
                }

            ]
        },
        {

            Difficult: 11,
            MissionList: [
                {
                    MissionID:110,
                    TypeID: 11,
                    Title: {
                        userMsg: 'Thiện Xạ',
                        userMsgEn: 'The Great Gun Man',
                        userMsgRu: '[RU] The Great Gun Man'
                    },
                    Desc: {
                        userMsg: 'Bắt %s cá bằng súng %s gold trở lên',
                        userMsgEn: 'Catch %s fish using gun %s gold upper',
                        userMsgRu: '[RU] Catch %s fish using gun %s gold upper'
                    },
                    Condition: {
                        GameList: [1],
                        StartFish: 5,
                        EndFish: 10,
                        StartBullet:100,
                        EndBullet:2000
                    },
                    Reward: {
                        GoldValue: 1000
                    }
                }

            ]
        },
        {

            Difficult: 12,
            MissionList: [
                {
                    MissionID:120,
                    TypeID: 12,
                    Title: {
                        userMsg: 'Long Nhất',
                        userMsgEn: 'One Shot One Kill',
                        userMsgRu: '[RU] One Shot One Kill'
                    },
                    Desc: {
                        userMsg: 'Bắn %s viên đạn và ăn %s gold trở lên',
                        userMsgEn: 'Shot %s bullet and win %s gold',
                        userMsgRu: '[RU] Shot %s bullet and win %s gold'
                    },
                    Condition: {
                        GameList: [1],
                        StartFishEarn: 100000,
                        EndFishEarn: 200000,
                        StartBullet:10,
                        EndBullet:15
                    },
                    Reward: {
                        GoldValue: 5000
                    }
                }

            ]
        },
        {

            Difficult: 13,
            MissionList: [
                {
                    MissionID:130,
                    TypeID: 13,
                    Title: {
                        userMsg: 'Nhà Sưu Tập',
                        userMsgEn: 'Fish Collector',
                        userMsgRu: '[RU] Fish Collector'
                    },
                    Desc: {
                        userMsg: 'Bắt %s loại cá khác nhau trong 1 ván',
                        userMsgEn: 'Kill %s difference fish type',
                        userMsgRu: '[RU] Kill %s difference fish type'
                    },
                    Condition: {
                        GameList: [1],
                        StartFish: 10,
                        EndFish: 20
                    },
                    Reward: {
                        GoldValue: 5000
                    }
                }

            ]
        },
        {

            Difficult: 19,
            MissionList: [
                {
                    MissionID:190,
                    TypeID: 19,
                    Title: {
                        userMsg: 'Kim Cương',
                        userMsgEn: 'Diamond',
                        userMsgRu: '[RU] Diamond'
                    },
                    Desc: {
                        userMsg: 'Hoàn thành tất cả nhiệm vụ',
                        userMsgEn: 'Completed All Mission',
                        userMsgRu: '[RU] Completed All Mission'
                    },
                    Condition: {
                        GameList: [1]
                    },
                    Reward: {
                        GoldValue: 10000
                    }
                }

            ]
        }
    ]
};

module.exports = MissionConfig;

