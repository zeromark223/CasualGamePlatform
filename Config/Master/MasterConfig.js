var MasterConfig = {
    Master: {
        ClientTimerInterval: 6000,
        MainTimerInterval: 5000,
        CheckUserTimerInterval: 10000,
        GCTimerInterval: 300000,
        FacebookAPILink: 'http://localhost:8090/facebook?fields=id,name,email&access_token='
    },
    SSLConfig: {
        IsWss: 1,
        Key: '../Config/ssl/sundayclub.online.key',
        Cert: '../Config/ssl/sundayclub.online.crt'
    },
    Cluster: {
        ChannelID: 1,
        IP: '10.17.16.48',
        StartID: 9191,
        StartPortR: 3115, // Raw Socket
        StartPortWS: 3018, // Web Socket
        StartPortWSS: 2083, // Web Socket Secure
        NumberOfMaster: 1, // set 0 to use automatic
        UseOnePortR: -1, //set 0 to use dynamic port StartPort++, this option override StartPort Config. set -1 to disable
        UseOnePortWS: 3018, //set 0 to use dynamic port StartPort++, this option override StartPort Config set -1 to disable
        UseOnePortWSS: 2083 //set 0 to use dynamic port StartPort++, this option override StartPort Config set -1 to disable
    }
};
module.exports = MasterConfig;
