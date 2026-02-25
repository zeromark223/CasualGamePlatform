var fs = require('fs');
var own = fs.readFileSync('own.txt').toString();
var agent = fs.readFileSync('agent.txt').toString();

own = own.split('\r\n');
agent = agent.split('\r\n');

var rs = [];
var rstxt = '';

for(var i = 0;i< own.length;i++){
    if(arrFind(own[i],agent)){
        // rs.push({
        //     id:own[i],
        //     status:0
        // })
    }else{
        rstxt+= own[i] +'\r\n';
        // rs.push({
        //     id:own[i],
        //     status:1
        // })
    }
}
for(var i = 0;i< agent.length;i++){
    if(arrFind(agent[i],own)){
        // rs.push({
        //     id:agent[i],
        //     status:0
        // })
    }else{
       // rstxt+= agent[i] +'\r\n';
        // rs.push({
        //     id:agent[i],
        //     status:1
        // })
    }
}
fs.appendFileSync('rs.txt',rstxt);
function arrFind(id,arr) {
    for(var i = 0 ; i < arr.length;i++){
        if(arr[i] == id){
            return 1;
        }
    }
    return 0;
}