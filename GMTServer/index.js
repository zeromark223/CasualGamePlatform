/**
 * Created by Ngoc on 24-03-2018.
 */
var cluster = require('cluster');
var domain = require('domain');
var domainCatch = domain.create(); // Keep server Cluster run while master crash.


if (cluster.isMaster) {
    //StartGMToolServer();
    CreateChildServer();
} else {
    domainCatch.run(function () {// Make sure If admin page crashed would not affect Agent.
        StartAdminPage();
    });
    domainCatch.on('error', function (err) {
        console.log("Domain ERROR ", err)

    });
    domainCatch.on('close', function (exit) {
        console.log("Domain Close ", exit)
    });
}


function CreateChildServer() {

    var worker = cluster.fork();
    worker.on('exit', function (exit) {
        console.log("EXIT ", exit)
    });
    worker.on('error', function (err) {
        console.log("ERROR ", err)
    });
}

function StartAdminPage() {

    var AdminPage = require('./AdminPage');
    var AdminPageProc = new AdminPage();
    AdminPageProc.Start();
}
