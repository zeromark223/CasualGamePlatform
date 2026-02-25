/**
 * Created by quinx on 5/9/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function CocktailFillUpResponse (Percent,Gold) {

    return this.AddHeader(Define.CocktailFillUp, new BinaryBuilder(
        {
            Percent: Percent,
            Gold:Gold
        },
        Struct.CocktailFillUpResponse
    ));

}
module.exports = CocktailFillUpResponse ;
CocktailFillUpResponse.prototype = new Packet();