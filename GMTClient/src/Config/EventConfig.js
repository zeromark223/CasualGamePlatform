/**
 * Created by quinx on 10/22/2018.
 */
module.exports = {
    EventConfig: [
        {
            EventCode: 'CreateAccBonus',
            Menu: [
                {
                    Prop: 'Gold',
                    Name: 'Tiền',
                    SubMenu: []
                },{
                    Prop: 'DailySpinTicket',
                    Name: 'Lượt quay hằng ngày',
                    SubMenu: []
                }
            ]
        },
        {
            EventCode: 'DailyLoginEvent',
            Menu: [
                {
                    Prop: 'Gold',
                    Name: 'Tiền',
                    SubMenu: []
                }
            ]
        },
        {
            EventCode: 'LuckyTime',
            Menu: [
                {
                    Prop: 'Gold',
                    Name: 'Tiền',
                    SubMenu: []
                },
                {
                    Prop: 'TimeStart',
                    Name: 'Thời gian bắt đầu',
                    SubMenu: []
                },
                {
                    Prop: 'TimeEnd',
                    Name: 'Thời gian kết thúc',
                    SubMenu: []
                }
            ]
        },
        {
            EventCode: 'HuntAndFun',
            Menu: [
                {
                    Prop: 'FishList',
                    Name: 'Danh sách cá',
                    SubMenu: [
                        {
                            Prop: 'FishKind',
                            Name: 'Loại cá'
                        },
                        {
                            Prop: 'Ratio',
                            Name: 'Tỷ lệ'
                        }
                    ]
                }
            ]
        },
        {
            EventCode: 'RandomHour',
            Menu: [
                {
                    Prop: 'FishList',
                    Name: 'Danh sách cá',
                    SubMenu: [
                        {
                            Prop: 'FishKind',
                            Name: 'FishKind'
                        },
                        {
                            Prop: 'TimeStart',
                            Name: 'TimeStart'
                        },
                        {
                            Prop: 'TimeEnd',
                            Name: 'TimeEnd'
                        },
                        {
                            Prop: 'FishMultiple',
                            Name: 'FishMultiple'
                        },
                        {
                            Prop: 'MaxFishMultiple',
                            Name: 'MaxFishMultiple'
                        },
                        {
                            Prop: 'Interval',
                            Name: 'Interval'
                        },
                        {
                            Prop: 'FishCount',
                            Name: 'FishCount'
                        },
                        {
                            Prop: 'FishMaxCount',
                            Name: 'FishMaxCount'
                        }
                    ]
                }
            ]
        },
        {
            EventCode: "SlotCollectItem",
            Menu: [
                {
                    Prop: 'EventConfig',
                    Name: 'Cấu hình',
                    SubMenu: []
                }
            ]
        },
        {
            EventCode: 'BossHunter',
            Menu: []
        },
        {
            EventCode: 'KingOfTheSea',
            Menu: []
        },
        {
            EventCode: 'SeaHunter',
            Menu: []
        },
        {
            EventCode: 'TopUserWinDisplay',
            Menu: []
        },
        {
            EventCode: 'KingOfTaiXiu',
            Menu: [
                {
                    Prop: 'WinRatio',
                    Name: 'Tỷ lệ thắng',
                    SubMenu: []
                },
                {
                    Prop: 'LoseRatio',
                    Name: 'Tỷ lệ thua',
                    SubMenu: []
                }
            ]
        },
        {
            EventCode: 'SlotWinLose',
            Menu: [
                {
                    Prop: 'EventConfig',
                    Name: 'Cấu hình',
                    SubMenu: []
                }
            ]
        },{
            EventCode: 'FourSpiritXocDia',
            Menu: [
                {
                    Prop: 'ListCheck',
                    Name: 'Danh sách ID cược',
                    SubMenu: []
                },
                {
                    Prop: 'Reward',
                    Name: 'Phần thưởng',
                    SubMenu: [
                        {
                            Prop: "Win",
                            Name: "Liên thắng"
                        },
                        {
                            Prop: "Gold",
                            Name: "Thắng"
                        },
                        {
                            Prop: "BetRequireGold",
                            Name: "Gold cược"
                        },
                        {
                            Prop: "Name",
                            Name: "Tên"
                        }
                    ]
                }
            ]
        },
        {
            EventCode: 'FourSpirit',
            Menu: [
                {
                    Prop: 'ListCheck',
                    Name: 'Danh sách ID cược',
                    SubMenu: []
                },
                {
                    Prop: 'Reward',
                    Name: 'Phần thưởng',
                    SubMenu: [
                        {
                            Prop: "Win",
                            Name: "Liên thắng"
                        },
                        {
                            Prop: "Gold",
                            Name: "Thắng"
                        },
                        {
                            Prop: "BetRequireGold",
                            Name: "Gold cược"
                        },
                        {
                            Prop: "Name",
                            Name: "Tên"
                        }
                    ]
                }
            ]
        },
        {
            EventCode: 'KingOfBetXocDia',
            Menu: [
                {
                    Prop: 'ListCheck',
                    Name: 'Danh sách ID cược',
                    SubMenu: []
                }
            ]
        },
        {
            EventCode: 'KingOfXocDia',
            Menu: [
                {
                    Prop: 'WinRatio',
                    Name: 'Tỷ lệ điểm thắng',
                    SubMenu: []
                },
                {
                    Prop: 'LoseRatio',
                    Name: 'Tỷ lệ điểm thua',
                    SubMenu: []
                }
            ]
        },
        {
            EventCode: 'DailyFreeSpin',
            Menu: [
                {
                    Prop: 'DailySpinTicket',
                    Name: 'Lượt quay hằng ngày',
                    SubMenu: []
                }
            ]
        },
        {
            EventCode: 'FreeSpinTopUp',
            Menu: [
                {
                    Prop: 'SpinRewardConfig',
                    Name: 'Sự kiện vòng quay',
                    SubMenu: [
                        {
                            Prop: "GoldRequired",
                            Name: "Số tiền nạp"
                        },
                        {
                            Prop: "DailySpinTicket",
                            Name: "Lượt quay hằng ngày"
                        },
                        {
                            Prop: "FreeSpinTicket",
                            Name: "Lượt quay miễn phí"
                        }
                    ]
                }
            ]
        },
        {
            EventCode: 'PokerMiniCollectItem',
            Menu: [
                {
                    Prop: 'PokerMiniCollectItem',
                    Name: 'Nhà sưu tập Poker',
                    SubMenu: [
                        {
                            Prop: "CardID",
                            Name: "CardID"
                        },
                        {
                            Prop: "Ratio",
                            Name: "Tỷ lệ"
                        }
                    ]
                }
            ]
        },
        {
            EventCode: 'PokerMiniWinLose',
            Menu: [
                {
                    Prop: 'WinRatio',
                    Name: 'Tỷ lệ thắng',
                    SubMenu: []
                },
                {
                    Prop: 'LoseRatio',
                    Name: 'Tỷ lệ thua',
                    SubMenu: []
                }
            ]
        },
    ]
};