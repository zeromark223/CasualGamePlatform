/**
 * Created by ngocnpt on 26-May-17.
 */

var Achievement = [
    {
        AchievementID: 1,
        TypeID: 1,
        Title: {
            userMsg: 'Ngư dân chăm chỉ I',
            userMsgEn: 'The Hard Fisher Man I',
            userMsgRu: '[RU] The Hard Fisher Man I'
        },
        Desc: {
            userMsg: 'Bắt %s chim bất kỳ',
            userMsgEn: 'Catch %s fishes',
            userMsgRu: '[RU] Catch %s fishes'
        },
        Condition: {
            GameList: [1],
            FishKind: [-1],
            Target: 100
        },
        Reward: {
            GoldValue: 500
        }

    },
    {
        AchievementID: 2,
        TypeID: 1,
        Title: {
            userMsg: 'Ngư dân chăm chỉ II',
            userMsgEn: 'The Hard Fisher Man II',
            userMsgRu: '[RU] The Hard Fisher Man II'
        },
        Desc: {
            userMsg: 'Bắt %s chim bất kỳ',
            userMsgEn: 'Catch %s fishes',
            userMsgRu: '[RU] Catch %s fishes'
        },
        Condition: {
            GameList: [1],
            FishKind: [-1],
            Target: 200
        },
        Reward: {
            GoldValue: 1500
        }

    },
    {
        AchievementID: 3,
        TypeID: 1,
        Title: {
            userMsg: 'Ngư dân chăm chỉ III',
            userMsgEn: 'The Hard Fisher Man III',
            userMsgRu: '[RU] The Hard Fisher Man III'
        },
        Desc: {
            userMsg: 'Bắt %s chim bất kỳ',
            userMsgEn: 'Catch %s fishes',
            userMsgRu: '[RU] Catch %s fishes'
        },
        Condition: {
            GameList: [1],
            FishKind: [-1],
            Target: 300
        },
        Reward: {
            GoldValue: 3000
        }

    },
    {
        AchievementID: 4,
        TypeID: 1,
        Title: {
            userMsg: 'Ngư dân chăm chỉ IV',
            userMsgEn: 'The Hard Fisher Man IV',
            userMsgRu: '[RU] The Hard Fisher Man IV'
        },
        Desc: {
            userMsg: 'Bắt %s chim bất kỳ',
            userMsgEn: 'Catch %s fishes',
            userMsgRu: '[RU] Catch %s fishes'
        },
        Condition: {
            GameList: [1],
            FishKind: [-1],
            Target: 400
        },
        Reward: {
            GoldValue: 5000
        }

    },
    {
        AchievementID: 5,
        TypeID: 1,
        Title: {
            userMsg: 'Ngư dân chăm chỉ V',
            userMsgEn: 'The Hard Fisher Man V',
            userMsgRu: '[RU] The Hard Fisher Man V'
        },
        Desc: {
            userMsg: 'Bắt %s chim bất kỳ',
            userMsgEn: 'Catch %s fishes',
            userMsgRu: '[RU] Catch %s fishes'
        },
        Condition: {
            GameList: [1],
            FishKind: [-1],
            Target: 500
        },
        Reward: {
            GoldValue: 10000
        }

    },
    {
        AchievementID: 6,
        TypeID: 1,
        Title: {
            userMsg: 'Siêu xạ thủ I',
            userMsgEn: 'Super Marksman I',
            userMsgRu: '[RU] Super Marksman I'
        },
        Desc: {
            userMsg: 'Nhắm bắn và tiêu diệt được %s chim bất kỳ',
            userMsgEn: 'Kill %s fishes',
            userMsgRu: '[RU] Catch %s fishes'
        },
        Condition: {
            GameList: [1],
            FishKind: [-1],
            Target: 1
        },
        Reward: {
            GoldValue: 100
        }

    },
    {
        AchievementID: 7,
        TypeID: 1,
        Title: {
            userMsg: 'Siêu xạ thủ II',
            userMsgEn: 'Super Marksman II',
            userMsgRu: '[RU] Super Marksman II'
        },
        Desc: {
            userMsg: 'Nhắm bắn và tiêu diệt được %s chim bất kỳ',
            userMsgEn: 'Kill %s fishes',
            userMsgRu: '[RU] Catch %s fishes'
        },
        Condition: {
            GameList: [1],
            FishKind: [-1],
            Target: 5
        },
        Reward: {
            GoldValue: 1000
        }

    },
    {
        AchievementID: 8,
        TypeID: 1,
        Title: {
            userMsg: 'Ninja Rùa',
            userMsgEn: 'Ninja Turtle',
            userMsgRu: '[RU] Ninja Turtle'
        },
        Desc: {
            userMsg: 'Bắt %s Rùa Biển',
            userMsgEn: 'Catch %s Turtles',
            userMsgRu: '[RU] Catch %s Turtles'
        },
        Condition: {
            GameList: [1],
            FishKind: [10],
            Target: 20
        },
        Reward: {
            GoldValue: 1000
        }

    },
    {
        AchievementID: 9,
        TypeID: 1,
        Title: {
            userMsg: 'Giật Điện',
            userMsgEn: 'Electric Eels',
            userMsgRu: '[RU] Electric Eels'
        },
        Desc: {
            userMsg: 'Bắt %s Lươn Điện',
            userMsgEn: 'Catch %s Electric Eels',
            userMsgRu: '[RU] Catch %s Electric Eels'
        },
        Condition: {
            GameList: [1],
            FishKind: [5],
            Target: 50
        },
        Reward: {
            GoldValue: 1500
        }

    },
    {
        AchievementID: 10,
        TypeID: 1,
        Title: {
            userMsg: 'chim Mập Xanh',
            userMsgEn: 'Sharks',
            userMsgRu: '[RU] Sharks'
        },
        Desc: {
            userMsg: 'Bắt %s chim Mập',
            userMsgEn: 'Catch %s Sharks',
            userMsgRu: '[RU] Catch %s Sharks'
        },
        Condition: {
            GameList: [1],
            FishKind: [14],
            Target: 10
        },
        Reward: {
            GoldValue: 1000
        }

    },
    {
        AchievementID: 11,
        TypeID: 1,
        Title: {
            userMsg: 'Tiếng Hát chim Voi',
            userMsgEn: 'The Whales Song',
            userMsgRu: '[RU] The Whales Song'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Voi Sát Thủ',
            userMsgEn: 'Catch %s Whales',
            userMsgRu: '[RU] Catch %s Whales'
        },
        Condition: {
            GameList: [1],
            FishKind: [22],
            Target: 10
        },
        Reward: {
            GoldValue: 8000
        }

    },
    {
        AchievementID: 12,
        TypeID: 1,
        Title: {
            userMsg: 'Cẩn Thận chim Mập',
            userMsgEn: 'Careful Sharks',
            userMsgRu: '[RU] Careful Sharks'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Mập Hổ',
            userMsgEn: 'Catch %s Tiger Sharks',
            userMsgRu: '[RU] Catch %s Tiger Sharks'
        },
        Condition: {
            GameList: [1],
            FishKind: [22],
            Target: 10
        },
        Reward: {
            GoldValue: 8000
        }

    },
    {
        AchievementID: 13,
        TypeID: 1,
        Title: {
            userMsg: 'Sát Thủ Cá Vàng I',
            userMsgEn: 'Golden Fish Destroyer',
            userMsgRu: '[RU] Golden Fish Destroyer'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Vàng',
            userMsgEn: 'Catch %s Golden Fishes',
            userMsgRu: '[RU] Catch %s Golden Fishes'
        },
        Condition: {
            GameList: [1],
            FishKind: [0],
            Target: 100
        },
        Reward: {
            GoldValue: 1000
        }

    },
    {
        AchievementID: 14,
        TypeID: 1,
        Title: {
            userMsg: 'Sát Thủ Cá Vàng II',
            userMsgEn: 'Golden Fish Destroyer',
            userMsgRu: '[RU] Golden Fish Destroyer'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Vàng',
            userMsgEn: 'Catch %s Golden Fishes',
            userMsgRu: '[RU] Catch %s Golden Fishes'
        },
        Condition: {
            GameList: [1],
            FishKind: [0],
            Target: 200
        },
        Reward: {
            GoldValue: 2500
        }

    },
    {
        AchievementID: 15,
        TypeID: 1,
        Title: {
            userMsg: 'Sát Thủ Cá Vàng III',
            userMsgEn: 'Golden Fish Destroyer',
            userMsgRu: '[RU] Golden Fish Destroyer'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Vàng',
            userMsgEn: 'Catch %s Golden Fishes',
            userMsgRu: '[RU] Catch %s Golden Fishes'
        },
        Condition: {
            GameList: [1],
            FishKind: [0],
            Target: 500
        },
        Reward: {
            GoldValue: 5000
        }

    },
    {
        AchievementID: 16,
        TypeID: 1,
        Title: {
            userMsg: 'Lạc lối I',
            userMsgEn: 'Finding Nemo',
            userMsgRu: '[RU] Finding Nemo'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Nemo',
            userMsgEn: 'Catch %s Nemo Fishes',
            userMsgRu: '[RU] Catch %s Nemo Fishes'
        },
        Condition: {
            GameList: [1],
            FishKind: [1],
            Target: 50
        },
        Reward: {
            GoldValue: 500
        }

    },
    {
        AchievementID: 17,
        TypeID: 1,
        Title: {
            userMsg: 'Lạc lối II',
            userMsgEn: 'Finding Nemo',
            userMsgRu: '[RU] Finding Nemo'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Nemo',
            userMsgEn: 'Catch %s Nemo Fishes',
            userMsgRu: '[RU] Catch %s Nemo Fishes'
        },
        Condition: {
            GameList: [1],
            FishKind: [1],
            Target: 100
        },
        Reward: {
            GoldValue: 1500
        }

    },
    {
        AchievementID: 18,
        TypeID: 1,
        Title: {
            userMsg: 'Lạc lối III',
            userMsgEn: 'Finding Nemo',
            userMsgRu: '[RU] Finding Nemo'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Nemo',
            userMsgEn: 'Catch %s Nemo Fishes',
            userMsgRu: '[RU] Catch %s Nemo Fishes'
        },
        Condition: {
            GameList: [1],
            FishKind: [1],
            Target: 200
        },
        Reward: {
            GoldValue: 4000
        }

    },
    {
        AchievementID: 19,
        TypeID: 1,
        Title: {
            userMsg: 'Cung Hỉ Phát Tài I',
            userMsgEn: 'Golden Ocean',
            userMsgRu: '[RU] Golden Ocean'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Hoàng Kim Bất Kỳ',
            userMsgEn: 'Catch %s Golden Fishes (any)',
            userMsgRu: '[RU] Catch %s Golden Fishes (any)'
        },
        Condition: {
            GameList: [1],
            FishKind: [30, 31, 32, 33, 34],
            Target: 50
        },
        Reward: {
            GoldValue: 5000
        }

    },
    {
        AchievementID: 20,
        TypeID: 1,
        Title: {
            userMsg: 'Cung Hỉ Phát Tài II',
            userMsgEn: 'Golden Ocean',
            userMsgRu: '[RU] Golden Ocean'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Hoàng Kim Bất Kỳ',
            userMsgEn: 'Catch %s Golden Fishes (any)',
            userMsgRu: '[RU] Catch %s Golden Fishes (any)'
        },
        Condition: {
            GameList: [1],
            FishKind: [30, 31, 32, 33, 34],
            Target: 100
        },
        Reward: {
            GoldValue: 15000
        }

    },
    {
        AchievementID: 21,
        TypeID: 1,
        Title: {
            userMsg: 'Cung Hỉ Phát Tài III',
            userMsgEn: 'Golden Ocean',
            userMsgRu: '[RU] Golden Ocean'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Hoàng Kim Bất Kỳ',
            userMsgEn: 'Catch %s Golden Fishes (any)',
            userMsgRu: '[RU] Catch %s Golden Fishes (any)'
        },
        Condition: {
            GameList: [1],
            FishKind: [30, 31, 32, 33, 34],
            Target: 200
        },
        Reward: {
            GoldValue: 30000
        }

    },
    {
        AchievementID: 22,
        TypeID: 1,
        Title: {
            userMsg: 'Ngư Lão Tiên Sinh I',
            userMsgEn: 'Fisher Old Man',
            userMsgRu: '[RU] Fisher Old Man'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Heo',
            userMsgEn: 'Catch %s Dolphins',
            userMsgRu: '[RU] Catch %s Dolphins'
        },
        Condition: {
            GameList: [1],
            FishKind: [30, 31, 32, 33, 34],
            Target: 20
        },
        Reward: {
            GoldValue: 10000
        }

    },
    {
        AchievementID: 23,
        TypeID: 1,
        Title: {
            userMsg: 'Ngư Lão Tiên Sinh II',
            userMsgEn: 'Fisher Old Man',
            userMsgRu: '[RU] Fisher Old Man'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Heo',
            userMsgEn: 'Catch %s Dolphins',
            userMsgRu: '[RU] Catch %s Dolphins'
        },
        Condition: {
            GameList: [1],
            FishKind: [30, 31, 32, 33, 34],
            Target: 50
        },
        Reward: {
            GoldValue: 40000
        }

    },
    {
        AchievementID: 24,
        TypeID: 1,
        Title: {
            userMsg: 'Ngư Lão Tiên Sinh II',
            userMsgEn: 'Fisher Old Man',
            userMsgRu: '[RU] Fisher Old Man'
        },
        Desc: {
            userMsg: 'Bắt được %s chim Heo',
            userMsgEn: 'Catch %s Dolphins',
            userMsgRu: '[RU] Catch %s Dolphins'
        },
        Condition: {
            GameList: [1],
            FishKind: [30, 31, 32, 33, 34],
            Target: 100
        },
        Reward: {
            GoldValue: 80000
        }

    }

];
var AchievementAllGame = [
    {
        AchievementID: 100,
        TypeID: 2,
        Title: {
            userMsg: 'Trùm Phán',
            userMsgEn: 'Uptake',
            userMsgRu: '[RU] Fisher Old Man'
        },
        Desc: {
            userMsg: 'Thắng %s ván Tài Xỉu mini liên tiếp',
            userMsgEn: 'Win %s consecutive rounds mini Sicbo',
            userMsgRu: '[RU] Thắng %s ván Tài Xỉu mini liên tiếp'
        },
        Condition: {
            GameList: [101],
            Target: 5
        },
        Reward: {
            GoldValue: 2500
        }

    },
    {
        AchievementID: 101,
        TypeID: 2,
        Title: {
            userMsg: 'Thần Phán',
            userMsgEn: 'Judgment',
            userMsgRu: '[RU] Fisher Old Man'
        },
        Desc: {
            userMsg: 'Thắng %s ván Tài Xỉu mini liên tiếp',
            userMsgEn: 'Win %s consecutive rounds mini Sicbo',
            userMsgRu: '[RU] Thắng %s ván Tài Xỉu mini liên tiếp'
        },
        Condition: {
            GameList: [101],
            Target: 8
        },
        Reward: {
            GoldValue: 6000
        }

    },
    {
        AchievementID: 102,
        TypeID: 2,
        Title: {
            userMsg: 'Thánh Phán',
            userMsgEn: 'God Judgment',
            userMsgRu: '[RU] Fisher Old Man'
        },
        Desc: {
            userMsg: 'Thắng %s ván Tài Xỉu mini liên tiếp',
            userMsgEn: 'Win %s consecutive rounds mini Sicbo',
            userMsgRu: '[RU] Thắng %s ván Tài Xỉu mini liên tiếp'
        },
        Condition: {
            GameList: [101],
            Target: 10
        },
        Reward: {
            GoldValue: 10000
        }

    },
    {
        AchievementID: 103,
        TypeID: 3,
        Title: {
            userMsg: 'Trùm Xoáy',
            userMsgEn: 'Spin Boss',
            userMsgRu: '[RU] Fisher Old Man'
        },
        Desc: {
            userMsg: 'Quay VQMM %s lần',
            userMsgEn: 'Spin Rotation Luck %s times',
            userMsgRu: '[RU] Quay VQMM %s lần'
        },
        Condition: {
            GameList: [100],
            Target: 100
        },
        Reward: {
            GoldValue: 3000
        }

    },
    {
        AchievementID: 104,
        TypeID: 3,
        Title: {
            userMsg: 'Thần Xoáy',
            userMsgEn: 'Spin God',
            userMsgRu: '[RU] Fisher Old Man'
        },
        Desc: {
            userMsg: 'Quay VQMM %s lần',
            userMsgEn: 'Spin Rotation Luck %s times',
            userMsgRu: '[RU] Quay VQMM %s lần'
        },
        Condition: {
            GameList: [100],
            Target: 500
        },
        Reward: {
            GoldValue: 15000
        }

    },
    {
        AchievementID: 105,
        TypeID: 3,
        Title: {
            userMsg: 'Thánh Xoáy',
            userMsgEn: 'Holy Spin',
            userMsgRu: '[RU] Fisher Old Man'
        },
        Desc: {
            userMsg: 'Quay VQMM %s lần',
            userMsgEn: 'Spin Rotation Luck %s times',
            userMsgRu: '[RU] Quay VQMM %s lần'
        },
        Condition: {
            GameList: [100],
            Target: 1000
        },
        Reward: {
            GoldValue: 50000
        }

    },
    {
        AchievementID: 106,
        TypeID: 4,
        Title: {
            userMsg: 'Trùm Xui',
            userMsgEn: 'Bad Luck',
            userMsgRu: '[RU] Fisher Old Man'
        },
        Desc: {
            userMsg: 'Thua %s ván Tài Xỉu mini liên tiếp',
            userMsgEn: 'Lose %s consecutive rounds mini Sicbo',
            userMsgRu: '[RU] Thua %s ván Tài Xỉu mini liên tiếp'
        },
        Condition: {
            GameList: [101],
            Target: 5
        },
        Reward: {
            GoldValue: 2500
        }

    },
    {
        AchievementID: 107,
        TypeID: 4,
        Title: {
            userMsg: 'Thần Xui',
            userMsgEn: 'God Unlucky',
            userMsgRu: '[RU] Fisher Old Man'
        },
        Desc: {
            userMsg: 'Thua %s ván Tài Xỉu mini liên tiếp',
            userMsgEn: 'Lose %s consecutive rounds mini Sicbo',
            userMsgRu: '[RU] Thua %s ván Tài Xỉu mini liên tiếp'
        },
        Condition: {
            GameList: [101],
            Target: 8
        },
        Reward: {
            GoldValue: 6000
        }

    },
    {
        AchievementID: 108,
        TypeID: 4,
        Title: {
            userMsg: 'Thánh Xui',
            userMsgEn: 'Holly Unlucky',
            userMsgRu: '[RU] Fisher Old Man'
        },
        Desc: {
            userMsg: 'Thua %s ván Tài Xỉu mini liên tiếp',
            userMsgEn: 'Lose %s consecutive rounds mini Sicbo',
            userMsgRu: '[RU] Thua %s ván Tài Xỉu mini liên tiếp'
        },
        Condition: {
            GameList: [101],
            Target: 10
        },
        Reward: {
            GoldValue: 10000
        }

    },
    {
        AchievementID: 109,
        TypeID: 5,
        Title: {
            userMsg: 'Kẻ Săn Rồng',
            userMsgEn: 'Dragon Hunter',
            userMsgRu: '[RU] Kẻ Săn rồng'
        },
        Desc: {
            userMsg: 'Chơi %s lần slot Tứ Long',
            userMsgEn: 'Play %s times Four Dragons slot',
            userMsgRu: '[RU] Chơi %s lần slot Tứ Long'
        },
        Condition: {
            GameList: [4],
            GameKind: 401,
            Target: 1000
        },
        Reward: {
            GoldValue: 15000
        }

    },
    {
        AchievementID: 110,
        TypeID: 6,
        Title: {
            userMsg: 'Trùm Baccarat',
            userMsgEn: 'Boss Baccarat',
            userMsgRu: '[RU] Trùm Baccarat'
        },
        Desc: {
            userMsg: 'Thắng %s ván Baccarat liên tiếp',
            userMsgEn: 'Win %s consecutive rounds Baccarat',
            userMsgRu: '[RU] Thắng %s ván Baccarat liên tiếp'
        },
        Condition: {
            GameList: [5],
            Target: 5
        },
        Reward: {
            GoldValue: 2500
        }

    },
    {
        AchievementID: 111,
        TypeID: 6,
        Title: {
            userMsg: 'Thần Baccarat',
            userMsgEn: 'God Baccarat',
            userMsgRu: '[RU] Trùm Baccarat'
        },
        Desc: {
            userMsg: 'Thắng %s ván Baccarat liên tiếp',
            userMsgEn: 'Win %s consecutive rounds Baccarat',
            userMsgRu: '[RU] Thắng %s ván Baccarat liên tiếp'
        },
        Condition: {
            GameList: [5],
            Target: 8
        },
        Reward: {
            GoldValue: 6000
        }

    },
    {
        AchievementID: 112,
        TypeID: 6,
        Title: {
            userMsg: 'Thánh Baccarat',
            userMsgEn: 'Holly Baccarat',
            userMsgRu: '[RU] Trùm Baccarat'
        },
        Desc: {
            userMsg: 'Thắng %s ván Baccarat liên tiếp',
            userMsgEn: 'Win %s consecutive rounds Baccarat',
            userMsgRu: '[RU] Thắng %s ván Baccarat liên tiếp'
        },
        Condition: {
            GameList: [5],
            Target: 10
        },
        Reward: {
            GoldValue: 10000
        }

    },
    {
        AchievementID: 1,
        TypeID: 1,
        Title: {
            userMsg: 'Xạ Điêu',
            userMsgEn: 'Bird Hunter',
            userMsgRu: '[RU] Xạ Điêu'
        },
        Desc: {
            userMsg: 'Bắt %s Khổng Tước',
            userMsgEn: 'Catching %s Peacock',
            userMsgRu: '[RU] Bắt %s Khổng Tước'
        },
        Condition: {
            GameList: [1],
            FishKind: [17],
            Target: 50
        },
        Reward: {
            GoldValue: 3000
        }
    },
    {
        AchievementID: 2,
        TypeID: 1,
        Title: {
            userMsg: 'Anh Hùng Xạ Điêu',
            userMsgEn: 'Condor Heroes',
            userMsgRu: '[RU] Xạ Điêu Anh Hùng'
        },
        Desc: {
            userMsg: 'Bắt %s Phượng Hoàng',
            userMsgEn: 'Catching %s Phoenix',
            userMsgRu: '[RU] Bắt %s Phượng Hoàng'
        },
        Condition: {
            GameList: [1],
            FishKind: [21],
            Target: 50
        },
        Reward: {
            GoldValue: 5000
        }

    },
    {
        AchievementID: 113,
        TypeID: 5,
        Title: {
            userMsg: 'Trùm Nông Sản',
            userMsgEn: 'Agricultural Boss',
            userMsgRu: '[RU] Trùm Nông Sản'
        },
        Desc: {
            userMsg: 'Quay slot Hoa Quả %s lần',
            userMsgEn: 'Spin Fruit slot %s times',
            userMsgRu: '[RU] Quay Slot Hoa Quả %s lần'
        },
        Condition: {
            GameList: [4],
            GameKind: 402,
            Target: 100
        },
        Reward: {
            GoldValue: 2000
        }

    },
    {
        AchievementID: 114,
        TypeID: 5,
        Title: {
            userMsg: 'Thần Nông Sản',
            userMsgEn: 'Agricultural God',
            userMsgRu: '[RU] Thần Nông Sản'
        },
        Desc: {
            userMsg: 'Quay slot Hoa Quả %s lần',
            userMsgEn: 'Spin Fruit slot %s times',
            userMsgRu: '[RU] Quay Slot Hoa Quả %s lần'
        },
        Condition: {
            GameList: [4],
            GameKind: 402,
            Target: 500
        },
        Reward: {
            GoldValue: 10000
        }

    },
    {
        AchievementID: 115,
        TypeID: 5,
        Title: {
            userMsg: 'Thánh Nông Sản',
            userMsgEn: 'Agricultural Holly',
            userMsgRu: '[RU] Thần Nông Sản'
        },
        Desc: {
            userMsg: 'Quay slot Hoa Quả %s lần',
            userMsgEn: 'Spin Fruit slot %s times',
            userMsgRu: '[RU] Quay Slot Hoa Quả %s lần'
        },
        Condition: {
            GameList: [4],
            GameKind: 402,
            Target: 1000
        },
        Reward: {
            GoldValue: 2000
        }

    }
];
var AchievementLobby = [
    {
        AchievementID: 200,
        TypeID: 10,
        Title: {
            userMsg: 'Khá Giàu',
            userMsgEn: 'Quite Rich',
            userMsgRu: '[RU] Khá Giàu'
        },
        Desc: {
            userMsg: 'Tài khoản có %s Xu',
            userMsgEn: 'Account has %s Coins',
            userMsgRu: '[RU] Tài khoản có %s Xu'
        },
        Condition: {
            GameList: [-1],
            Target: 5000000
        },
        Reward: {
            GoldValue: 50000
        }

    },
    {
        AchievementID: 201,
        TypeID: 10,
        Title: {
            userMsg: 'Giàu',
            userMsgEn: 'Rich',
            userMsgRu: '[RU] Giàu'
        },
        Desc: {
            userMsg: 'Tài khoản có %s Xu',
            userMsgEn: 'Account has %s Coins',
            userMsgRu: '[RU] Tài khoản có %s Xu'
        },
        Condition: {
            GameList: [-1],
            Target: 10000000
        },
        Reward: {
            GoldValue: 100000
        }

    },
    {
        AchievementID: 202,
        TypeID: 10,
        Title: {
            userMsg: 'Rất Giàu',
            userMsgEn: 'Very Rich',
            userMsgRu: '[RU] Rất Giàu'
        },
        Desc: {
            userMsg: 'Tài khoản có %s Xu',
            userMsgEn: 'Account has %s Coins',
            userMsgRu: '[RU] Tài khoản có %s Xu'
        },
        Condition: {
            GameList: [-1],
            Target: 20000000
        },
        Reward: {
            GoldValue: 200000
        }

    },
    {
        AchievementID: 203,
        TypeID: 10,
        Title: {
            userMsg: 'Trùm Giàu Sụ',
            userMsgEn: 'Wealthy Tycoon',
            userMsgRu: '[RU] Trùm Giàu Sụ'
        },
        Desc: {
            userMsg: 'Tài khoản có %s Xu',
            userMsgEn: 'Account has %s Coins',
            userMsgRu: '[RU] Tài khoản có %s Xu'
        },
        Condition: {
            GameList: [-1],
            Target: 50000000
        },
        Reward: {
            GoldValue: 500000
        }

    },
    {
        AchievementID: 204,
        TypeID: 10,
        Title: {
            userMsg: 'Thần Giàu Sụ',
            userMsgEn: 'Mammon',
            userMsgRu: '[RU] Thần Giàu Sụ'
        },
        Desc: {
            userMsg: 'Tài khoản có %s Xu',
            userMsgEn: 'Account has %s Coins',
            userMsgRu: '[RU] Tài khoản có %s Xu'
        },
        Condition: {
            GameList: [-1],
            Target: 100000000
        },
        Reward: {
            GoldValue: 1000000
        }

    },
    {
        AchievementID: 205,
        TypeID: 10,
        Title: {
            userMsg: 'Tiền Thôi Mà',
            userMsgEn: 'Just Money',
            userMsgRu: '[RU] Tiền Thôi Mà'
        },
        Desc: {
            userMsg: 'Tài khoản có %s Xu',
            userMsgEn: 'Account has %s Coins',
            userMsgRu: '[RU] Tài khoản có %s Xu'
        },
        Condition: {
            GameList: [-1],
            Target: 200000000
        },
        Reward: {
            GoldValue: 2000000
        }

    },
    {
        AchievementID: 206,
        TypeID: 11,
        Title: {
            userMsg: 'Phú Gia',
            userMsgEn: 'Rich Man',
            userMsgRu: '[RU] Đại Gia'
        },
        Desc: {
            userMsg: 'Nạp tiền %s Xu',
            userMsgEn: 'Recharge %s Gold',
            userMsgRu: '[RU] Recharge %s Gold'
        },
        Condition: {
            GameList: [-1],
            Target: 10000
        },
        Reward: {
            GoldValue: 5000
        }

    },
    {
        AchievementID: 206,
        TypeID: 11,
        Title: {
            userMsg: 'Triệu Phú',
            userMsgEn: 'Millionaire',
            userMsgRu: '[RU] Millionaire'
        },
        Desc: {
            userMsg: 'Nạp tiền %s Xu',
            userMsgEn: 'Recharge %s Gold',
            userMsgRu: '[RU] Recharge %s Gold'
        },
        Condition: {
            GameList: [-1],
            Target: 1000000
        },
        Reward: {
            GoldValue: 50000
        }

    },
    {
        AchievementID: 206,
        TypeID: 11,
        Title: {
            userMsg: 'Tỷ Phú',
            userMsgEn: 'Billionaire',
            userMsgRu: '[RU] Billionaire'
        },
        Desc: {
            userMsg: 'Nạp tiền %s Xu',
            userMsgEn: 'Recharge %s Gold',
            userMsgRu: '[RU] Recharge %s Gold'
        },
        Condition: {
            GameList: [-1],
            Target: 10000000
        },
        Reward: {
            GoldValue: 150000
        }

    }
];
//module.exports = AchievementAllGame.concat(AchievementLobby);
module.exports = AchievementAllGame.concat(AchievementLobby);

