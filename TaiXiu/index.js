/**
 * Created by ngocnpt on 09/05/2016.
 */
///////////////////////////// Global Declare

Object.defineProperty(global, '__stack', {
    get: function () {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function (_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});
Object.defineProperty(global, '__line', {
    get: function () {
        return __stack[1].getLineNumber();
    }
});
Object.defineProperty(global, '__function', {
    get: function () {
        return __stack[1].getFunctionName();
    }
});
Object.defineProperty(global, '__endian', {
    get: function () {
        return true;//Litte endian
    }
});

///////////////////////////// Global Declare End
var GameServer = require('./Taixiu');
var cluster = require('cluster');
var fs = require('fs');
var domain = require('domain');
var os = require('os');
var domainCatch = domain.create(); // Keep server Cluster run while master crash.
//Load Config
var Config = require('../Config/TaiXiu');
var Utility = require('../SharedModule/Utility');

var portLists = [];

var startID = Config.GameServerConfig.Cluster.StartID;
var PubIP = Config.GameServerConfig.Cluster.IP;
var startPortR = Config.GameServerConfig.Cluster.StartPortR;
var startPortWS = Config.GameServerConfig.Cluster.StartPortWS;
var startPortWSS = Config.GameServerConfig.Cluster.StartPortWSS;
var numberOfMaster = Config.GameServerConfig.Cluster.NumberOfMaster;
var UseOnePortR = Config.GameServerConfig.Cluster.UseOnePortR;
var UseOnePortWS = Config.GameServerConfig.Cluster.UseOnePortWS;
var UseOnePortWSS = Config.GameServerConfig.Cluster.UseOnePortWSS;

if (numberOfMaster <= 0) {
    numberOfMaster = os.cpus().length - 1;
}
var endPortR = startPortR + numberOfMaster;
var endPortWS = startPortWS + numberOfMaster;
var endPortWSS = startPortWSS + numberOfMaster;

var listWorker = [];
var currentServer = 0;
if (cluster.isMaster) {
    process.title = "GS " + Config.GameServerConfig.Cluster.IP
        + "Port Raw : " + Config.GameServerConfig.Cluster.StartPortR
        + " | WS :" + Config.GameServerConfig.Cluster.StartPortWS
        + " | WSS :" + Config.GameServerConfig.Cluster.StartPortWSS;


    HandleStopServerByConsole();

    var i;
    //// Gen Port Dynamic
    for (i = startPortR; i < endPortR; i++) {//Init Port List Raw Socket
        portLists.push({MID: 0, PortR: i, isFree: true});
    }
    var index = 0;
    for (i = startPortWS; i < endPortWS; i++) {//Init Port List WS Socket
        portLists[index].PortWS = i;
        index++;
    }
    index = 0;
    for (i = startPortWSS; i < endPortWSS; i++) {//Init Port List WS Socket
        portLists[index].PortWSS = i;
        index++;
    }

    for (i = 0; i < portLists.length; i++) {
        if (portLists[i].isFree == true) {
            var masterCfg = {
                CMD:'CreateProcess',
                ID: startID,
                PortR: portLists[i].PortR,
                PortWS: portLists[i].PortWS,
                PortWSS: portLists[i].PortWSS,
                IP: PubIP
            };
            portLists[i].isFree = false;
            CreateMaster(masterCfg, portLists[i]);
        }
        else {

        }
    }

    cluster.on('exit', function (worker, code, signal) {
        for (var i = 0; i < portLists.length; i++) {
            if (portLists[i].MID == worker.id) {
                try {
                    LogMasterController(__function, __line, 'worker ' + worker.id + ' died' + " with port  " + masterCfg.PortR + " R/ " + masterCfg.PortWS + ' is free . Info : ' + code + "\n" + signal);
                    worker.IsReadyForMaintain = true;
                    // CreateMaster(masterCfg, portLists[i]);
                    //LogMasterController(__function, __line, 'worker has been force shutdown');
                } catch (e) {
                    console.log(" cluster.on('exit' LogMasterController try " + e)
                }

            }
        }

    });

    cluster.on('message',function (worker,msg) {
        if(msg.CMD == 'IsReadyForMaintain'){
            worker.IsReadyForMaintain = true;
        }
    });
}
else {
    if (cluster.isWorker) {
        process.on('message', function (msg) {
            if (msg != null) {
                try {
                    if(msg.CMD == 'CreateProcess'){
                        var serverCfg = msg;
                        var serverGame = new GameServer();
                        domainCatch.run(function () {
                            var WSPort = UseOnePortWS;//(WS libarry) Currently WS is not supported
                            var WSSPort = UseOnePortWSS;//(WS libarry) Currently WS is not supported
                            var RawPort = UseOnePortR;//(Net library)
                            if (UseOnePortR > 0 && UseOnePortR < 65000) {
                                RawPort = UseOnePortR;//
                                serverCfg.PortR = RawPort;
                            } else {
                                RawPort = serverCfg.PortR;// Raw Socket Port
                            }
                            if (UseOnePortWS > 0 && UseOnePortWS < 65000) {
                                WSPort = UseOnePortWS;//
                                serverCfg.PortWS = WSPort;
                            } else {
                                WSPort = serverCfg.PortWS;// Raw Socket Port
                            }
                            if (UseOnePortWSS > 0 && UseOnePortWSS < 65000) {
                                WSSPort = UseOnePortWSS;//
                                serverCfg.PortWS = WSSPort;
                            } else {
                                WSSPort = serverCfg.PortWSS;// Raw Socket Port
                            }
                            if (UseOnePortR < 0) RawPort = 0; // Case disable this Port
                            if (UseOnePortWS < 0) WSPort = 0; // Case disable this Port
                            if (UseOnePortWSS < 0) WSSPort = 0; // Case disable this Port
                            serverGame.Start(serverCfg.ID, RawPort, WSPort, WSSPort, serverCfg.IP);
                            currentServer = serverGame;
                            LogMasterController(__function, __line, "ServerGameID " + serverCfg.ID + " with Port Raw: " + RawPort + " | WS: " + WSPort + " | WSS: " + WSSPort + " has stared");
                            //TODO : bỏ hard code +100 của Raw Port
                        });
                        domainCatch.on('error', function (err) {
                            LogMasterController(__function, __line, err.stack);

                        });
                        domainCatch.on('close', function () {
                            LogMasterController(__function, __line, "server has closed");
                        });
                    }else{

                        if(msg.CMD == 'Maintain'){
                            currentServer.MaintainServer();
                        }
                    }

                }
                catch (e) {
                    LogMasterController(__function, __line, msg);
                    LogMasterController(__function, __line, "rev msg err " + e.stack);
                }


            }
            else {
                LogMasterController(__function, __line, "msg is null")
            }
        });

    }

}


function CreateMaster(serverCfg, thisPort) {

    var worker = cluster.fork();
    thisPort.MID = worker.id;
    serverCfg.ID = serverCfg.ID + worker.id;
    worker.send(serverCfg);
    listWorker.push(worker);
    worker.on('exit', function () {
        LogMasterController(__function, __line, "ServerID " + serverCfg.ID + " with Port Raw: " + serverCfg.PortR + " | WS: " + serverCfg.PortWS + " | WSS: " + serverCfg.PortWSS + " has closed");
    });
    worker.on('error', function (err) {
        LogMasterController(__function, __line, "ServerID " + serverCfg.ID + " with Port Raw: " + serverCfg.PortR + " | WS: " + serverCfg.PortWS + " | WSS: " + serverCfg.PortWSS + " has closed" + JSON.stringify(err));
    });
}

function LogMasterController(func, line, object) {
    try {

        fs.mkdir('./logs/', function () {
            fs.mkdir('./logs/Index', function () {
                fs.appendFile('./logs/Index/MasterControllerLog.log', "" + (new Date()).toISOString() + " - [" + func + ":" + line + "] " + JSON.stringify(object) + "\r\n", function (err) {
                });
            });
        });
        console.log('./logs/Index/MasterControllerLog.log', "" + (new Date()).toISOString() + " - [" + func + ":" + line + "] " + object + "\r\n");

    }
    catch (e) {
        console.log("LogMasterController try" + e.stack);
    }

}

function HandleStopServerByConsole() {
    process.stdin.setRawMode(true);
    process.stdin.on('data', function (b) {
        if (b[0] === 3) {
            //Do nothing
            SendMaintainAllProcess();
            setInterval(CheckMaintainAndExit, 1000);
        }
    });
}

function CheckMaintainAndExit() {
    var isReadyForMaintain = true;
    for (var i = 0; i < listWorker.length; i++) {
        try{
            if(!listWorker[i].IsReadyForMaintain){
                isReadyForMaintain = false;
                break;
            }
        }catch (e){
            LogMasterController(__function, __line, "Try Error "+e.stack);
        }
    }
    if(isReadyForMaintain){
        console.log(">>>>>>>>>>>>>>>>>>> Server maintain succeed <<<<<<<<<<<<<<<<<<<");
        process.stdin.setRawMode(false);
        process.exit()
    }

}

function SendMaintainAllProcess() {
    try{
        for (var i = 0; i < listWorker.length; i++) {
            try{
                listWorker[i].send({
                    CMD:'Maintain'
                });
            }catch (e){
                LogMasterController(__function, __line, "Try Error "+e.stack);
            }
        }
    }catch (e){
        LogMasterController(__function, __line, "Try Error "+e.stack);
    }
}