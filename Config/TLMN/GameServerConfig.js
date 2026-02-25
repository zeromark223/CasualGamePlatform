var GameServerConfig = {
    RoomTypeConfig:{
        GameKindID:701, // ../Common/RoomKindConfig
        RoomName:'TLMN',
        MoneyRequired:0,
        LevelRequired: 0,
        DeskCount:10,
        DeskMaxUserLimit:200,
        IsTrial:0
    },
    SSLConfig:{
        Key: '../Config/ssl/s1.gamebaionline.club.key',
        Cert: '../Config/ssl/s1.gamebaionline.club.crt'
    },
    Cluster:{
        ChannelID:1,
        IP: '192.168.0.249',
        StartID: 249000,
        StartPortR: 0, // Raw Socket
        StartPortWS: 2019, // Web Socket
        StartPortWSS: 0, // Web Socket Secure
        NumberOfMaster: 1, // set 0 to use automatic
        UseOnePortR: -1, //set 0 to use dynamic port StartPort++, this option override StartPort Config. set -1 to disable
        UseOnePortWS: 0, //set 0 to use dynamic port StartPort++, this option override StartPort Config set -1 to disable
        UseOnePortWSS: -1 //set 0 to use dynamic port StartPort++, this option override StartPort Config set -1 to disable
    }
};
module.exports = GameServerConfig;

