var EventConfigCode = {
    CreateAccBonus:1,//01
    DailyLoginEvent:2,//10
    LuckyTime:4//100
};

var user = {
    UserID:123,
    EventFlag:4
};


function addEvent(user,EventFlag) {
    user.EventFlag += EventFlag;
}

function checkEvent(user,EventFlag) {
    return user.EventFlag & EventFlag ;
}



console.log(checkEvent(user,EventConfigCode.LuckyTime));
addEvent(user,-4);
console.log(checkEvent(user,EventConfigCode.LuckyTime));

function dec2bin(dec){
    return (dec >>> 0);
}