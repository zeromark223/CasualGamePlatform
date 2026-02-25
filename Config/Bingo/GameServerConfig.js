var RoomKindConfig = require('../../Config/Common/RoomKindConfig');

var GameServerConfig = {
    RoomTypeConfig: {
        GameKindID: RoomKindConfig.BingoLobby,
        RoomName: 'Bingo',
        MoneyRequired: 0,
        LevelRequired: 0,
        DeskCount: 1,
        DeskMaxUserLimit: 200,
        IsTrial: 0
    },
    SSLConfig: {
        Key: '../Config/ssl/s1.gamebaionline.club.key',
        Cert: '../Config/ssl/s1.gamebaionline.club.crt'
    },
    Cluster: {
        ChannelID: 1,
        IP: 's1.gamebaionline.club',
        StartID: 1260000,
        StartPortR: 0, // Raw Socket
        StartPortWS: 1330, // Web Socket
        StartPortWSS: 0, // Web Socket Secure
        NumberOfMaster: 1, // set 0 to use automatic
        UseOnePortR: -1, //set 0 to use dynamic port StartPort++, this option override StartPort Config. set -1 to disable
        UseOnePortWS: 0, //set 0 to use dynamic port StartPort++, this option override StartPort Config set -1 to disable
        UseOnePortWSS: -1 //set 0 to use dynamic port StartPort++, this option override StartPort Config set -1 to disable
    }
};
module.exports = GameServerConfig;

