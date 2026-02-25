var text =[
    '68995f963913da404731d5e1d5875e791a4031637f4f9fdeef2621bd4a1913525dc78e830bdaef8f618d29d75a710503d1127e0eb817a898d22e7037efa3ff30184a1a70157b50310958a0e5de828d7e34d3949ac7c51c1343084bafc567d4ced4db1fd765b9eda4f720cb08feda7050',
    '68995f963913da404731d5e1d5875e791a4031637f4f9fdeef2621bd4a191352f9eec42c89e5b16cc87cb36dd2064039361660d30c7c1acedfe709a6043ea85fca5a5c6175b319de6f9e3cf0d5379e429ab8b875057d3e491618c48735e0a51d3f1a7394763fad7c5b4f87477e70f714',
    '68995f963913da404731d5e1d5875e791a4031637f4f9fdeef2621bd4a191352f9eec42c89e5b16cc87cb36dd2064039361660d30c7c1acedfe709a6043ea85f4383171694c190f322341981c963b5a59e22259b7d7756d9248a03c4929eb362f4dccd2a8a1fae4ed10c934684a5199b'
];

var key = {
    GMApiKey : 'e5LdVKjVwlfv',
    GMApiIV : 'reVg0A6ulZq9'
};

var encrytion = require('../../SharedModule/encrytion');
var qqq = '9Y9xC3zGXrl6ykw';

for(var i = 0 ; i < text.length;i++){
    var obj = printData(text[i]);
    // if(printData(obj,qqq,text[i])){
    //     //console.log(text);
    // }
}

function printData(txt) {
    console.log(deCryptData(txt));
}


function deCryptData(txt) {
    return encrytion.aesDecryptIV(txt,key.GMApiKey,key.GMApiIV);
}

function findByUid(obj,uid,src) {
    var obj = JSON.parse(obj);
    if(obj.AccountID == uid){
        console.log("fint him ",obj,src);
        return 1;
    }
}