var Config = require('../Config/Agent/index');
var Logger = require('./Modules/Log4JS/index');
var WebSocket = require('ws');
var http = require('http');
var fs = require('fs');
var path = require('path');
var SQLAdapter = require('./Modules/SQLAdapter');
var AgentConfig = require('../Config/Agent');
var Utility = require('../SharedModule/Utility');
function AdminPage() {
    this.Config = Config;
    this.Logger = Logger;
    this.WebServer = 0;
    this.WSocketUser = 0;
    this.UserPortWS = 3001;
    this.SQLAdapter = SQLAdapter;
    this.GameKindID = 'agent';
}

module.exports = AdminPage;

AdminPage.prototype.Start = function () {
    this.Init();
};

AdminPage.prototype.test = function (Request,Response) {
    Response.end(fs.readFileSync('./AdminPagesClient/Home.html').toString());
};

AdminPage.prototype.Init = function () {
    this.Logger.Init(0, this.Config.LoggerConfig, function () {
        this.WebServer = http.createServer(this.HandleRequest.bind(this));
        this.WebServer.listen(this.Config.AdminPagesConfig.ListeningPort, this.Config.AdminPagesConfig.BindingIP);
        this.SQLAdapter.Init(AgentConfig.SQLConfig, this.Logger.Sql());
        this.InitUserListener();
    }.bind(this));
};

AdminPage.prototype.InitUserListener = function () {
    this.WSocketUser = new WebSocket.Server({
        port: this.UserPortWS,
        perMessageDeflate: false
    }, function (err) {
        if (!err) this.Logger.Master().info("MasterID " + this.MasterID + " is online listen all on port [WS] : " + this.UserPortWS);
        else this.Logger.Master().error("Master fail to start on port : " + this.UserPortWS);
    }.bind(this));
    this.WSocketUser.on('connection', this.WebSocketUserConnect.bind(this, false));//Bind This vs IsWSS
    this.WSocketUser.on('error', function (err) {
        this.Logger.Master().error("error W :" + err);
        //Handle Err3or
    }.bind(this));
};

AdminPage.prototype.WebSocketUserConnect = function (isWss, socket) {//nhận kết nối của user (đầu tiên)
    try {
        console.log("User Connected");
        // this.Logger.Master().debug('WebSocketUserConnect', socket._socket.remoteAddress);
        // socket.socketType = 1;
        // socket.isWss = isWss;
        // socket.remoteAddress = socket._socket.remoteAddress;
        // socket.remotePort = socket._socket.remotePort;
        // socket.remoteAddressReal = socket.remoteAddress;
        // socket.end = socket.close;
        // if (this.MaintainFlag) {
        //     var msg = new Packet.KickUserResponse(0, 'Hệ thống bảo trì.');
        //     if (msg != 0)
        //         this.SendSocketBinary(socket, msg);
        // } else {
        //
        //     socket.UserController = new UserController(this, socket);
        //     socket.UserModel = new UserModel(this, socket);
        //     socket.on('message', socket.UserController.HandleMessage.bind(socket.UserController)); // Handle User Message
        //     socket.on('error', function (err) {
        //         this.OnUserDisconnected(err, socket);
        //     }.bind(this)); // Handle Error
        //     socket.on('end', function () {
        //         this.OnUserDisconnected("end", socket);
        //     }.bind(this)); // Handle End
        //     socket.on('close', function () {
        //         this.OnUserDisconnected("close", socket);
        //     }.bind(this)); // Handle End
        //     socket.on('pong', function () {
        //         socket.UserModel.PingPongLost = 0;
        //     });
        //
        //     function close(error) { // Ham handle Error và End
        //         this.server.OnUserDisconnected(error, this.socket);
        //     }
        // }
    } catch (e) {
        this.Logger.Master().error('WebSocketUserConnect try ', e.stack);
    }

};

AdminPage.prototype.HandleRequest = function (Request, Response) {
    try {
        this.ShowCCUPage(Request,Response);
        // if(Request.socket.remoteAddress != '123.30.210.205'){
        //     this.Logger.Game().error("GMToolAPI.prototype.HandleRequest Unacceptable IP ", Request.socket.remoteAddress);
        //     Response.end();
        //     return;
        // }
        if (Request.method == 'POST') {
            var body = '';
            Request.on('data', function (data) {
                body += data;
            });
            Request.on('error', function (error) {

            });
            Request.on('end', function () {
                this.HandlePostRequest(Request, Response, body);
            }.bind(this));
        } else {
            this.HandleGetRequest(Request, Response);
        }

    } catch (e) {
        Response.end('{"statusCode":404,"message":"internal error "}');
        this.Logger.Game().error("GMToolAPI.prototype.HandlePostCompleted ", e.stack);
    }

};

AdminPage.prototype.HandlePostRequest = function (Request, Response, Body) {

};

AdminPage.prototype.HandleGetRequest = function (Request, Response) {

};

AdminPage.prototype.ShowCCUPage = function (Request, Response) {
    this.SQLAdapter.getCCUAllGame(function (e,d) {
        if(Utility.CheckVariable(d) &&Utility.CheckVariable(d[0],'CCU') ){
            Response.end('CCU hiện tại : '+d[0].CCU);
        }else{
            Response.end('Error 101 ');
        }

    })
};

