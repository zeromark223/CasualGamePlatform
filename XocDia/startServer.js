///////////////////////////// Global Declare

const path = require('path');
var rl = require('readline');
var encrytion = require('../SharedModule/encrytion');

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
var rootFile = __stack[0].getFileName();
const root = path.dirname(rootFile) + path.sep;

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

Object.defineProperty(global, '__root', {
    get: function () {
        return root;//Litte endian
    }
});

/**
 * Created by ngocnpt on 09/05/2016.
 */

var SmartRequire = require('../SharedModule/smartRequire');
var count = 0;
var mainFile = 'Main';
var ch = ',rC(B{B#r$w!Y4@2'; //use function treat it.
var cafe;
var che = 0;

var cluster = require('cluster');
var fs = require('fs');
var domain = require('domain');
var os = require('os');
var domainCatch = domain.create(); // Keep server Cluster run while master crash.
//Load Config
var Config = require('../Config/XocDia');
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
    onStart();
}
else {
    handleCluster();

}


function CreateMaster(serverCfg, thisPort) {

    var worker = cluster.fork();
    thisPort.MID = worker.id;
    serverCfg.ID = serverCfg.ID + worker.id;
    serverCfg.cafe = cafe;
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

    // });

}

function SendMaintainAllProcess() {
    try {
        for (var i = 0; i < listWorker.length; i++) {
            try {
                listWorker[i].send({
                    CMD: 'Maintain'
                });
            } catch (e) {
                LogMasterController(__function, __line, "Try Error " + e.stack);
            }
        }
    } catch (e) {
        LogMasterController(__function, __line, "Try Error " + e.stack);
    }
}

function handleClusterMaster() {
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
                CMD: 'CreateProcess',
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
                    //CreateMaster(masterCfg, portLists[i]);
                    LogMasterController(__function, __line, 'worker has been stopped');
                } catch (e) {
                    console.log(" cluster.on('exit' LogMasterController try " + e)
                }

            }
        }

    });
}

function handleCluster() {
    if (cluster.isWorker) {
        process.on('message', function (msg) {
            if (msg != null) {
                try {
                    if (msg.CMD == 'CreateProcess') {
                        var serverCfg = msg;
                        var serverGame = getMain(serverCfg);
                        serverGame = new serverGame();

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
                            if(!Utility.CheckVariable(serverCfg.cafe,'k','i')){
                                serverCfg.cafe = {
                                    k:'',
                                    i:''
                                }
                            }
                            serverGame.Start(serverCfg.ID, RawPort, WSPort, WSSPort, serverCfg.IP, serverCfg.cafe.k, serverCfg.cafe.i);
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
                    } else {

                        if (msg.CMD == 'Maintain') {
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

function onStart() {

    genChar();

    var r = rl.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    r.on('SIGINT', function () {
        count++;
        if (count > 5) {
            r.close();
        }
        SendMaintainAllProcess();
    });
    setTimeout(function () {
        if (fs.existsSync(mainFile + '.js')) {
            r.write("\r\n");
        }
    },500);

    r.question('ConfigID : ' + '\n', function (answer) {
        try {
            console.log('\033c');
            if (fs.existsSync(mainFile + '.js')) {
                count = 4;
                handleClusterMaster();
            }else{
                if (checkChe(answer)) {
                    handleClusterMaster();
                } else {
                    if (+answer < 0 || answer > 4) {
                        console.log("Can't find config");
                        process.exit(0);
                    } else {
                        ss();
                    }

                }
            }

        } catch (e) {
            console.log("unknow errorcode", e.stack);
        }
    });


}

function checkChe(chk) {

    try {
        var d = encrytion.aesDecryptIV(chk, che, che);
        d = JSON.parse(d);
        cafe = d;
        return true;
    } catch (e) {
    }
    return false;
}

function genChar() {
    var char = 'Server Start At ' + (new Date()).toISOString() + ' with PID ' + process.pid;
    che = encrytion.sha256(char + ch);
    console.log(char, '\r\n', 'Choose Config', '\r\n', '1.Online', '2.Beta', '3.Debug', '4.Exit');
}

function getMain(mcf) {
    //__root
    var cfg = mcf.cafe;
    if (typeof  mcf.cafe != 'undefined') {
        return SmartRequire(__root + mainFile, cfg.k, cfg.i);
    }
    return SmartRequire(__root + mainFile);

    //return require('./Master')
}

function ss() {
    var Logger = require('./Modules/Log4JS/Logger');
    var ID = Config.GameServerConfig.Cluster.StartID;
    Logger.Init(ID, Config.LoggerConfig, function (e, d) {
        Logger.Master().info("Server ID ", ID, "Start Completed ");
        setInterval(function () {

        }, 1000);
    });
}