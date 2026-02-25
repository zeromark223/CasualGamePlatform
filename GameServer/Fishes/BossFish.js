/**
 * Created by quinx on 5/19/2017.
 */
var NormalFish = require('./NormalFish');
var Packet = require('../Packet');
function BossFish(){
    NormalFish.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
    this.BossID = 0;
    this.BossAutoID = 0;
    this.MaxHP = 0;
    this.RoundCount = 0;
    this.PathSeed = 50;
    this.BirthTime = 0;
    this.Position = [];
}

module.exports = BossFish;
BossFish.prototype = new NormalFish();

BossFish.prototype.Init = function(BossAutoID, BossID, FishKind, MaxHP, RoundCount, BirthTime,Position){
    this.BossAutoID = BossAutoID;
    this.BossID = BossID;
    this.MaxHP = MaxHP;
    this.RoundCount = RoundCount;
    this.BirthTime = BirthTime;
    this.Position = Position;
};

BossFish.prototype.GetHit = function(){
   //boss do nothing
};

BossFish.prototype.OnFishDie = function(){
    //this.Desk.RemoveFishInDesk(this.FishID);
};

