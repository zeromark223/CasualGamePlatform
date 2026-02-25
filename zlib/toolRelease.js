/**
 * Created by ngocnpt on 10/08/2017.
 */
var gzip = require('./gzip');
var releaseConfig = require('./releaseConfig');
var fs = require('fs');
var path = require('path');


BuildAllFile();

function BuildAllFile() {
    var listFilse = findFolder(releaseConfig.Path);
    for(var i = 0 ; i < listFilse.length;i++){
        checkFileAndBuild(listFilse[i]);
    }
}

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
    gzip.zipFileWithPass(FileWithPath,releaseConfig.Key,releaseConfig.IV,NewFileWithPath);
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



