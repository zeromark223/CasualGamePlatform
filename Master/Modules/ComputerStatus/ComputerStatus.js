/**
 * Created by quinx on 2/8/2017.
 */
var os = require('os');
var startMeasure = CPUAverage();

function CPUAverage(){
    var TotalIdle = 0;
    var TotalTick = 0;

    var CPUs = os.cpus();

    for(var i = 0; i < CPUs.length; i++){
        var cpu = CPUs[i];

        for(type in cpu.times){
            TotalTick += cpu.times[type];
        }

        TotalIdle += cpu.times.idle;
    }


    var Idle = TotalIdle / CPUs.length;
    var Tick = TotalTick / CPUs.length;


    return {Idle: Idle, Tick: Tick};
};

function Result_CPUUsage(){
    var endMeasure = CPUAverage();

    var Diff_Idle = endMeasure.Idle - startMeasure.Idle;
    var Diff_Tick = endMeasure.Tick - startMeasure.Tick;

    var percentCPU = 100 - ~~(100 * Diff_Idle / Diff_Tick);

    startMeasure = CPUAverage();
    return percentCPU;
}

function GetTotalMem(){
    var totalmem = os.totalmem() / (1024 * 1024 * 1024);

    return totalmem.toFixed(4);
}

function GetFreeMem(){
    var freemem = os.freemem() / (1024 * 1024 * 1024);

    return freemem.toFixed(4);
}

exports.GetComputerStatus = function(){
    var percentCPU = Result_CPUUsage();
    var totalmem = GetTotalMem();
    var freemem = GetFreeMem();
    var mem_usage = (totalmem - freemem).toFixed(4);
    //console.log('Total Memory: ' + totalmem + ' GB');
    //console.log('Free Memory: ' + freemem + ' GB');
    //console.log('Using Memory: ' + mem_usage, '(' + ~~(100 * mem_usage / totalmem) + '% Memory Usage)');
    //console.log(percentCPU + '% CPU Usage');

    return {TotalMemory: totalmem, FreeMemory: freemem, UsingMemory: mem_usage, MemoryPercent: ~~(100 * mem_usage / totalmem), CPUPercent: percentCPU};
}

