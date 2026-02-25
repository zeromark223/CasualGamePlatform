var GameServerConfig = {
    SlotTuLongThan:{
        MaintainStock:-5000000,
        Tax:1,
        BetList:[
            250, 500, 1000, 2500, 5000, 10000, 25000
        ]
    },
    RoomTypeConfig:{
        GameKindID:401, // ../Common/RoomKindConfig
        RoomName:'Slot Tu Long Than',
        MoneyRequired:0,
        LevelRequired: 0,
        DeskCount:1,
        DeskMaxUserLimit:200,
        IsTrial:0
    },
    SSLConfig:{
        Key: '../Config/ssl/s1.gamebaionline.club.key',
        Cert: '../Config/ssl/s1.gamebaionline.club.crt'
    },
    Cluster:{
        ChannelID:1,
        IP: '192.168.0.250',
        StartID: 1250000,
        StartPortR: 0, // Raw Socket
        StartPortWS: 2018, // Web Socket
        StartPortWSS: 0, // Web Socket Secure
        NumberOfMaster: 1, // set 0 to use automatic
        UseOnePortR: -1, //set 0 to use dynamic port StartPort++, this option override StartPort Config. set -1 to disable
        UseOnePortWS: 0, //set 0 to use dynamic port StartPort++, this option override StartPort Config set -1 to disable
        UseOnePortWSS: -1 //set 0 to use dynamic port StartPort++, this option override StartPort Config set -1 to disable
    }
};
module.exports = GameServerConfig;

