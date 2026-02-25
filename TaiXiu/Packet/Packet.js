function Packet() {

}

module.exports = Packet;

Packet.prototype.AddHeader = function (PackedID, data, isBigEndian) {
    if (typeof isBigEndian == 'undefined') isBigEndian = false;

    var header = new Buffer(4);
    //Set PacketID
    if (isBigEndian) {
        header.writeUInt16BE(PackedID, 2)
    } else {
        header.writeUInt16LE(PackedID, 2)
    }
    var len = 4;

    //Check Data
    if (typeof data == 'undefined') {

        //Set Length (include header 4byte)
        if (isBigEndian) {
            header.writeUInt16BE(len, 0)
        } else {
            header.writeUInt16LE(len, 0)
        }
        return header;
    }else{
        len += data.length;
        //Set Length (include header 4byte)
        if (isBigEndian) {
            header.writeUInt16BE(len, 0)
        } else {
            header.writeUInt16LE(len, 0)
        }
        return Buffer.concat([header,data]) ;
    }



};