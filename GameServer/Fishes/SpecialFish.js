/**
 * Created by quinx on 7/6/2017.
 */
var NormalFish = require('./NormalFish');
var Packet = require('../Packet');

function SpecialFish(){
    NormalFish.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
    //NormalFish.call(this);
    this.EffectID = 0;
}

module.exports = SpecialFish;
SpecialFish.prototype = new NormalFish();

SpecialFish.prototype.Init = function(EffectID){
    this.EffectID = EffectID;
};

SpecialFish.prototype.PlayEffect = function(){
    this.Desk.PlayRoomEffect(this.EffectID);
};


