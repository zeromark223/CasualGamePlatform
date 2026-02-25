/**
 * Created by quinx on 5/9/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function CocktailUpdateResponse (Percent) {

    return this.AddHeader(Define.CocktailUpdate, new BinaryBuilder(
        {
            Percent: Percent
        },
        Struct.CocktailUpdateResponse
    ));

}
module.exports = CocktailUpdateResponse ;
CocktailUpdateResponse.prototype = new Packet();