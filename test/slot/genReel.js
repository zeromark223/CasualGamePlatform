const clipboardy = require('clipboardy');

// Copy
//clipboardy.writeSync('🦄');

// Paste
var data = clipboardy.readSync();
console.log(data);

var rows = data.toString().split('\r\n');
var col = 5;
var reel = [];
for(var i = 0 ; i < col;i++){
    reel.push([]);
}
for(var i = 0 ; i  < rows.length;i++){
    var row = rows[i].split('\t');
    if(typeof row == 'undefined')continue;
    for(var j = 0 ; j < col;j++){
        if(typeof row[j] == 'undefined')continue;
        reel[j].push(row[j]);
    }
}
console.log(JSON.stringify(reel));
console.log(reel);
clipboardy.writeSync(JSON.stringify(reel));