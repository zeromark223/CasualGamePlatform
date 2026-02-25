/**
 * Created by ngocnpt on 17/08/2017.
 */
var fs = require('fs');
var path = require('path');
var gzip = require('./gzip/gzip');
module.exports = function(Filename,SecretKey,SecretIV) {
    try{
        if(Filename.substr(Filename.length-3,3) != '.js'){
            if(fs.existsSync(Filename)){
                Filename = path.join(Filename,'index.js');
            }else{
                Filename+='.js';
            }
        }
        if(fs.existsSync(Filename)){
            return require(Filename);
        }else{
            var newFile = Filename.replace(path.extname(Filename),'.bin');
            if(fs.existsSync(newFile)){
                return gzip.requireZipWithPass(newFile,SecretKey,SecretIV);
            }else{

                throw new Error('smartRequire File not exists');
            }

        }
    }catch (e){
        console.log(e.stack);
    }

};