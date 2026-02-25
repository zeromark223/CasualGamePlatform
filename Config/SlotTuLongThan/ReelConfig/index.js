var GameServerConfig = require('../GameServerConfig');
var KindID = GameServerConfig.RoomTypeConfig.GameKindID;
var ReelConfig = require('./TuLong');
var BetList = [
    1000, 2500, 5000, 10000, 15000, 25000, 50000
];
var BetListLimit = [
    {
        TotalBet:1000,
        LimitBet:10000
    },
    {
        TotalBet:2500,
        LimitBet:25000
    },
    {
        TotalBet:5000,
        LimitBet:50000
    },
    {
        TotalBet:10000,
        LimitBet:100000
    },
    {
        TotalBet:15000,
        LimitBet:150000
    },
    {
        TotalBet:25000,
        LimitBet:250000
    },
    {
        TotalBet:50000,
        LimitBet:500000
    }
];
var BetListLimitDefault = 10;

switch (KindID) {
    case 401:
        ReelConfig = require('./TuLong');
        break;
    case 402:
        ReelConfig = require('./HoaQua');
        break;
    case 403:
        ReelConfig = require('./Hawai');
        break;
}

ReelConfig.BetList = BetList;
ReelConfig.BetListLimit = BetListLimit;
ReelConfig.BetListLimitDefault = BetListLimitDefault;

module.exports = ReelConfig;