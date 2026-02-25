/**
 * Created by ngocnpt on 25/01/2018.
 */
/**
 * Created by ngocnpt on 10/08/2017.
 */
var gzip = require('./gzip');
var releaseConfig = require('./releaseConfig');
var fs = require('fs');
var path = require('path');


function findFolder(dirPath) {
    var list = [];
    var d = fs.readdirSync(dirPath);
    for (var i = 0; i < d.length; i++) {
        if (fs.lstatSync(path.join(dirPath, d[i])).isDirectory()) {
            list = list.concat(findFolder(path.join(dirPath, d[i])));
        } else {
            if (releaseConfig.ExtCheck.indexOf(path.extname(d[i])) != -1) {
                list.push(path.join(dirPath, d[i]));
            }

        }
    }
    return list;
}

function buildFile(FileWithPath) {
    var FileEx = path.extname(FileWithPath);
    var NewFileWithPath = FileWithPath.replace(FileEx,releaseConfig.ExtOutput);
    gzip.requireZipWithPass(FileWithPath,releaseConfig.Key,releaseConfig.IV,NewFileWithPath);
    fs.unlinkSync(FileWithPath);
}

function checkFileAndBuild(File) {
    try{
        var content  = fs.readFileSync(File).toString();
        if(content.substr(0,releaseConfig.Tag.length) == releaseConfig.Tag){
            buildFile(File);
        }
    }catch (e){

    }

}

function unzip(FileWithPath) {
    var FileEx = path.extname(FileWithPath);
    return gzip.unZipWithPass(FileWithPath,releaseConfig.Key,releaseConfig.IV);
}

var a = unzip('D:\\Svn\\1.Release\\20190129\\Master.bin');
fs.appendFileSync('D:\\Svn\\1.Release\\20190129\\Master.js',a);