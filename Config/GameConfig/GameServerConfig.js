var GameServerConfig = {
    GameServer: {
        FishVersion:3,
        MAX_BULLET_SKILL_LAZER: 8,
        MAX_BULLET_COUNT: 50,
        INVALID_CHAIR: 255,
        Enable_Adventure: 1//1 = open adventure, 0 = close adventure
    },
    RoomTypeConfig:{
        GameKindID:1, // 1 = Free Mode, 2 = Battle Mode , 3 = VIP Mode., 4: = adventure Mode
        RoomName:'3D Free',
        MoneyRequired:10,
        LevelRequired: 0,
        DeskCount:10
    },
    SSLConfig:{
        IsWss:0,
        Key: '../Config/ssl/sundayclub.online.key',
        Cert: '../Config/ssl/sundayclub.online.crt'
    },
    Cluster:{
        ChannelID:1,
        IP: '10.17.16.48',
        StartID: 481230,
        StartPortR: 3015, // Raw Socket
        StartPortWS: 1230, // Web Socket
        StartPortWSS: 1330, // Web Socket Secure
        NumberOfMaster: 1, // set 0 to use automatic
        UseOnePortR: -1, //set 0 to use dynamic port StartPort++, this option override StartPort Config. set -1 to disable
        UseOnePortWS: 0, //set 0 to use dynamic port StartPort++, this option override StartPort Config set -1 to disable
        UseOnePortWSS: 0 //set 0 to use dynamic port StartPort++, this option override StartPort Config set -1 to disable
    }
};
module.exports = GameServerConfig;

