var crypto = require('crypto');//Sys library

module.exports = function (pwd, fn) {
    var hash = crypto.createHash('sha256').update(pwd).digest('hex');
    fn(null, hash);
};

