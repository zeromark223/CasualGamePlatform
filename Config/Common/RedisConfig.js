/**
 * Created by ngocnpt on 03/06/2016.
 */
var DefaultConfig = require('./DefaultConfig');
var RedisConfig = {
    Host: DefaultConfig.Redis.Host,
    Port: DefaultConfig.Redis.Port,
    Password: DefaultConfig.Redis.Password,
    DB: 0,
    Define: {
        UserBeginPlaying: 'UBP:',
        UserSoftLock: 'USL:',
        UserCheckAndLock: 'UCL:',
        UserOnlineList: 'UOL',
        UserBeginGetReward: 'UGR:',
        UserLoginGameKey: 'ULK',
        StockDetail: "Stock:",
        StockDetailUpdate: "StockUpdate:",
        RecordDetail: "RecordDetail:",
        StockConfigDefault: 'StockConfigDefault',
        StockRatioConfigDefault: 'StockRatioConfigDefault',
        StockConfig: 'StockConfig',
        StockRatioConfig: 'StockRatioConfig',
        GlobalBossDie: 'GBD',
        GlobalBossListUser: 'GBLU:',
        GlobalBossListUserDmg: 'GBDU:',
        BossGlobal: 'BBG:',
        BossGlobal_CurrentAwardMoney: 'CurrentAwardMoney',
        BossGlobal_CurrentAwardItemCount: 'CurrentAwardItemCount',
        BossGlobal_CurrentConfig: 'CurrentConfig',
        ManhTheLimitAll: 'MTA',
        ManhTheLimitPerDay: 'MTD:',
        ManhTheLimitPlayer: 'MTP:',
        MoneyHistoryPlayer: 'MHP:',
        GoldenHourLimitAll: 'GHA',
        EventList: "EVL:",
        Jackpot: "Jackpot",//Jackpot chính, save là jackpot phụ dùng để bù tiền cho JP chính
        Jackpot_Main: "Main",
        Jackpot_Save: "Save",
        TaiXiuBetUserHistory: "TXBH:",
        TaiXiuTopUserWin: "TXTUW",
        TaiXiuTopUserWinName: "TXTUWN",
        SlotJackpotConfig: "SLOTJPC:",
        SlotJackpot: "SLOTJP:",
        SlotJackpotSave: "SLOTJPS:",
        SlotTopWin: "SLOTTW",
        SlotUserHistory: "SLOTUH:",
        LogGold: "lg:",
        BaccaratBetUserHistory: "BBH:",
        XocDiaBetUserHistory: "XDH:",
        XocDiaTopUserWin: "XDTUW",
        XocDiaTopUserWinName: "XDTUWN",
        TrackingUserFlagData: "TUF",
        //VQMM
        VQMMUserHistory: "VUH:",
        VQMMBigWin: "VBW",
        VQMMFreeSpin: "VFP",
        VQMMSpinInfo: "VSI",
        VQMMSpinBonusFree: "VBF",
        VQMMSpinBonusDaily: "VBD",
        // for TaiXiuMini
        TaiXiuMiniBetUserHistory: "101H:",
        TaiXiuMiniTopUserWin: "101TUW",
        TaiXiuMiniTopUserWinName: "101TUWN:",
        // for bingo
        BingoTreasure: "BingoTreasure",
        BingoUserPlayHistory: "102UserPlayHistory:",
        BingoTopUserWin: "102TopUserWinByMode", // top user by game mode
        BingoTopUserWinAllMode: "102TopUserWinAllMode", // top user in all mode
        //MiniPoker
        MiniPokerUserHistory: "MPUH:",
        MiniPokerBigWin: "MPBW",

        ShowStoreConfig: "ShowStoreConfig"
    }
};
module.exports = RedisConfig;

