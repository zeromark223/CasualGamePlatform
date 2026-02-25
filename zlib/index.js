///////////////////////////// Global Declare


Object.defineProperty(global, '__stack', {
    get: function() {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack) {
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
    get: function() {
        return __stack[1].getLineNumber();
    }
});

Object.defineProperty(global, '__function', {
    get: function() {
        return __stack[1].getFunctionName();
    }
});
Object.defineProperty(global, '__endian', {
    get: function() {
        return true;//Litte endian
    }
});
Object.defineProperty(global, '__Logger', {
    get: function() {
        return true;//Litte endian
    }
});
/**
 * Created by ngocnpt on 09/05/2016.
 */

var cluster = require('cluster');
var fs = require('fs');
var domain = require('domain');
var os = require('os');
var domainCatch = domain.create(); // Keep server Cluster run while master crash.
//Load Config
var Config = require('../Config/Master');
var Utility = require('../SharedModule/Utility');

var portLists =[];

var startID = Config.MasterConfig.Cluster.StartID;
var PubIP = Config.MasterConfig.Cluster.IP;
var startPortR = Config.MasterConfig.Cluster.StartPortR;
var startPortWS = Config.MasterConfig.Cluster.StartPortWS;
var numberOfMaster = Config.MasterConfig.Cluster.NumberOfMaster;
var UseOnePortR = Config.MasterConfig.Cluster.UseOnePortR;
var UseOnePortWS = Config.MasterConfig.Cluster.UseOnePortWS;
if(numberOfMaster<=0)
{
    numberOfMaster = os.cpus().length-1;
}
var endPortR = startPortR+numberOfMaster;
var endPortWS = startPortWS+numberOfMaster;

if(cluster.isMaster)
{
    process.title = "Master "+Config.MasterConfig.Cluster.IP
        +   " PortR : "+Config.MasterConfig.Cluster.StartPortR
        +   " / PortWS :"+Config.MasterConfig.Cluster.StartPortWS;
    var i = 0;
    for ( i = startPortR; i < endPortR; i++) {//Init Port List Raw Socket
        portLists.push({MID: 0, PortR: i, isFree: true});
    }
    var index =0;
    for ( i = startPortWS; i < endPortWS; i++) {//Init Port List WS Socket
        portLists[index].PortWS = i;
        index++;
    }
    for ( i = 0; i < portLists.length; i++) {
        if (portLists[i].isFree == true) {
            var masterCfg = {
                ID:startID,
                PortR:portLists[i].PortR,
                PortWS:portLists[i].PortWS,
                IP:PubIP
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
                try{
                    LogMasterController(__function,__line,'worker ' + worker.id + ' died' +" with port  " + masterCfg.PortR +" R/ " +masterCfg.PortWS + ' is free . Info : '+code+"\n"+signal);
                    CreateMaster(masterCfg,portLists[i]);
                    LogMasterController(__function,__line,'worker has been restart');
                }catch(e){
                    console.log(" cluster.on('exit' LogMasterController try "+e)
                }

            }
        }

    });
}
else{
    if (cluster.isWorker) {
        process.on('message', function (msg) {
            if (msg != null) {
                try
                {
                    var masterCfg = msg;
                    var Master = require('./Master');
                    var master = new Master();
                    function StartRoom() {

                        var WSPort = UseOnePortWS;//(WS libarry) Currently WS is not supported
                        var RawPort = UseOnePortR;//(Net library)
                        if(UseOnePortR > 0 && UseOnePortR < 65000 ){
                            RawPort = UseOnePortR;//
                            masterCfg.PortR = RawPort;
                        }else{
                            RawPort = masterCfg.PortR;// Raw Socket Port
                        }
                        if(UseOnePortWS > 0 && UseOnePortWS < 65000 ){
                            WSPort = UseOnePortWS;//
                            masterCfg.PortWS = WSPort;
                        }else{
                            WSPort = masterCfg.PortWS;// Raw Socket Port
                        }
                        if (UseOnePortR < 0)RawPort = 0; // Case disable this Port
                        if (UseOnePortWS < 0)WSPort = 0; // Case disable this Port

                        master.Start(masterCfg.ID,RawPort,WSPort,masterCfg.IP);
                        LogMasterController(__function,__line,"MasterID "+ masterCfg.ID+" with port  " + RawPort +" R/ " +WSPort + " WS has started");
                        //TODO : bỏ hard code +100 của Raw Port
                    }

                    domainCatch.run(StartRoom);
                    domainCatch.on('error', function (err) {
                        LogMasterController(__function,__line,err.stack);
                        process.exit(0);

                    });
                    domainCatch.on('close', function () {
                        LogMasterController(__function,__line,"server has closed");
                        process.exit(0);

                    });
                }
                catch(e)
                {
                    LogMasterController(__function,__line,msg);
                    LogMasterController(__function,__line,"rev msg err "+e);
                }


            }
            else {
                LogMasterController(__function,__line,"msg is null")
            }
        });

    }

}


function CreateMaster(masterCfg,thisPort)
{

    var worker = cluster.fork();
    thisPort.MID = worker.id;
    masterCfg.ID=masterCfg.ID+worker.id;
    worker.send(masterCfg);
    worker.on('exit', function () {
        LogMasterController(__function,__line,"MasterID "+ masterCfg.ID+" with port  " + masterCfg.PortR +" R/ " +masterCfg.PortWS + " has closed");
    });
    worker.on('error', function (err) {
        LogMasterController(__function,__line,"MasterID "+ masterCfg.ID+" with port  " + masterCfg.PortR +" R/ " +masterCfg.PortWS + " has error "+JSON.stringify(err));
    });
}

function LogMasterController(func,line,object){
    try
    {

        fs.mkdir('./logs/',function(){
            fs.mkdir('./logs/Index',function(){
                fs.appendFile('./logs/Index/MasterControllerLog.log', ""+(new Date()).toISOString()+" - ["+func+":"+line+"] "+JSON.stringify(object)+"\r\n", function (err) {
                });
            });
        });
        console.log('./logs/Index/MasterControllerLog.log', ""+(new Date()).toISOString()+" - ["+func+":"+line+"] "+object+"\r\n");

    }
    catch(e)
    {
        console.log("LogMasterController try"+ e.stack);
    }

}


