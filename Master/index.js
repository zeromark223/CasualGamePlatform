///////////////////////////// Global Declare
const path = require('path');
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
var mainFile = 'Master';
var cluster = require('cluster');
var fs = require('fs');
var domain = require('domain');
var os = require('os');
var ch = ',rC(B{B#r$w!Y4@2'; //use function treat it.
var cafe;
var che = 0;
var domainCatch = domain.create(); // Keep server Cluster run while master crash.
//Load Config
var Config = require('../Config/Master');

var portLists = [];

var startID = Config.MasterConfig.Cluster.StartID;
var PubIP = Config.MasterConfig.Cluster.IP;
var startPortR = Config.MasterConfig.Cluster.StartPortR;
var startPortWS = Config.MasterConfig.Cluster.StartPortWS;
var startPortWSS = Config.MasterConfig.Cluster.StartPortWSS;
var UseOnePortR = Config.MasterConfig.Cluster.UseOnePortR;
var UseOnePortWS = Config.MasterConfig.Cluster.UseOnePortWS;
var UseOnePortWSS = Config.MasterConfig.Cluster.UseOnePortWSS;

var numberOfMaster = Config.MasterConfig.Cluster.NumberOfMaster;
if (numberOfMaster <= 0) {
    numberOfMaster = os.cpus().length - 1;
}
var endPortR = startPortR + numberOfMaster;
var endPortWS = startPortWS + numberOfMaster;
var endPortWSS = startPortWSS + numberOfMaster;

if (cluster.isMaster) {
    onStart();
}
else {
    handleCluster();
}


function CreateMaster(masterCfg, thisPort) {

    var worker = cluster.fork();
    thisPort.MID = worker.id;
    masterCfg.ID = masterCfg.ID + worker.id;
    masterCfg.cafe = cafe;
    worker.send(masterCfg);
    worker.on('exit', function () {
        LogMasterController(__function, __line, "MasterID " + masterCfg.ID + " with Port Raw: " + masterCfg.PortR + " | WS: " + masterCfg.PortWS + " | WSS: " + masterCfg.PortWSS + " has closed");
    });
    worker.on('error', function (err) {
        LogMasterController(__function, __line, "MasterID " + masterCfg.ID + " with Port Raw: " + masterCfg.PortR + " | WS: " + masterCfg.PortWS + " | WSS: " + masterCfg.PortWSS + " has closed" + JSON.stringify(err));
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


function onStart() {
    if(fs.existsSync(mainFile+'.js')){
        handleClusterMaster();
        return;
    }
    var prompt = require('prompt');
    prompt.start();
    genChar();
    prompt.get(['ConfigID'], function (err, result) {
        try {
            if (checkChe(result.ConfigID)) {
                handleClusterMaster();

            } else {
                if (+result.ConfigID < 0 || result.ConfigID > 4) {
                    console.log("Can't find config");
                    process.exit(0);
                    ss();
                }

            }
        } catch (e) {
            console.log("unknow errorcode");
        }


    });

}

function ss() {
    var Logger = require('./Modules/Log4JS/Logger');
    var ID = Config.MasterConfig.Cluster.StartID;
    Logger.Init(ID, Config.LoggerConfig, function (e, d) {
        Logger.Master().info("Server ID ", ID, "Start Completed ");
        setInterval(function () {

        }, 1000);
    });
}

function handleClusterMaster() {
    process.title = "Master " + Config.MasterConfig.Cluster.IP
        + "Port Raw : " + Config.MasterConfig.Cluster.StartPortR
        + " | WS :" + Config.MasterConfig.Cluster.StartPortWS
        + " | WSS :" + Config.MasterConfig.Cluster.StartPortWSS;
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
                    CreateMaster(masterCfg, portLists[i]);
                    LogMasterController(__function, __line, 'worker has been restart');
                } catch (e) {
                    console.log(" cluster.on('exit' LogMasterController try " + e.stack)
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
                    var masterCfg = msg;
                    var master = getMain(masterCfg);
                    master = new master();

                    function StartRoom() {

                        var WSPort = UseOnePortWS;//(WS libarry) Currently WS is not supported
                        var WSSPort = UseOnePortWSS;//(WS libarry) Currently WS is not supported
                        var RawPort = UseOnePortR;//(Net library)
                        if (UseOnePortR > 0 && UseOnePortR < 65000) {
                            RawPort = UseOnePortR;//
                            masterCfg.PortR = RawPort;
                        } else {
                            RawPort = masterCfg.PortR;// Raw Socket Port
                        }
                        if (UseOnePortWS > 0 && UseOnePortWS < 65000) {
                            WSPort = UseOnePortWS;//
                            masterCfg.PortWS = WSPort;
                        } else {
                            WSPort = masterCfg.PortWS;// Raw Socket Port
                        }
                        if (UseOnePortWSS > 0 && UseOnePortWSS < 65000) {
                            WSSPort = UseOnePortWSS;//
                            masterCfg.PortWS = WSSPort;
                        } else {
                            WSSPort = masterCfg.PortWSS;// Raw Socket Port
                        }
                        if (UseOnePortR < 0) RawPort = 0; // Case disable this Port
                        if (UseOnePortWS < 0) WSPort = 0; // Case disable this Port
                        if (UseOnePortWSS < 0) WSSPort = 0; // Case disable this Port

                        master.Start(masterCfg.ID, masterCfg.IP, RawPort, WSPort, WSSPort);
                        LogMasterController(__function, __line, "MasterID " + masterCfg.ID + " with Port Raw: " + RawPort + " | WS: " + WSPort + " | WSS: " + WSSPort + " has stared");
                        //TODO : bỏ hard code +100 của Raw Port
                    }

                    domainCatch.run(StartRoom);
                    domainCatch.on('error', function (err) {
                        LogMasterController(__function, __line, err.stack);
                        process.exit(0);

                    });
                    domainCatch.on('close', function () {
                        LogMasterController(__function, __line, "server has closed");
                        process.exit(0);

                    });
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
    if(typeof  mcf.cafe != 'undefined'){
        return SmartRequire(__root+mainFile, cfg.k, cfg.i);
    }
    return SmartRequire(__root+mainFile);

    //return require('./Master')
}
