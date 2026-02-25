var SMSModule = require('../../../SharedModule/SMS');

function OTPManager() {
    this.Master = 0;
}

module.exports = OTPManager;

OTPManager.prototype.Init = function (Master) {
    this.Master = Master;
};

OTPManager.prototype.CheckAndGenOTP = function () {

};

OTPManager.prototype.OnSMSCallback = function () {

};

OTPManager.prototype.GenSendOTP = function () {

};

OTPManager.prototype.GenOTP = function () {
    var otp = Math.floor(Math.random()*10000);
};