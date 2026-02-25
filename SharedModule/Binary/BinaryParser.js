/**
 * Created by hungtd on 23/03/2017.
 * Edited by NgocNPT on 27/03/2017
 */
/**
 *
 * @constructor
 */
function BinaryParser(binaryData, struct, isBigEndian, offset) {
    this.isBigEndian = (isBigEndian != null && typeof isBigEndian != 'undefined') ? isBigEndian : false;
    this.offset = (offset != null && typeof offset != 'undefined') ? offset : 0;
    this.DataTypeID = require('./Define');
    return this.parseFromStruct(struct, binaryData);
}
module.exports = BinaryParser;

BinaryParser.prototype.parseFromStruct = function (struct, Binary) {
    var Obj = {};
    //this.offset = offset||0;
    //Duyệt struct
    for (var k in struct) {
        //bỏ qua các thuộc tính có đuôi  _Struct và _Type
        if (k.indexOf("_Struct") != -1)continue;
        if (k.indexOf("_Type") != -1)continue;
        if (struct[k] == this.DataTypeID.Object8) {//Nếu là kiểu Array Object
            //Đọc độ dài
            var ic = this.ReadDataByTypeID(struct[k], Binary);

            Obj[k] = []; // khỏi tạo array cho giá trị của thuộc tính k
            for (var i = 0; i < ic; i++) {
                //đọc dữ liệu và push vào array trên
                Obj[k].push(this.parseFromStruct(struct[k + "_Struct"], Binary));
            }

        } else {
            if (struct[k] == this.DataTypeID.Array8) {// Nếu là kiểu Array
                //tương tự trường hợp trên
                var ic = this.ReadDataByTypeID(struct[k], Binary);
                Obj[k] = [];
                for (var i = 0; i < ic; i++) {
                    Obj[k].push(this.ReadDataByTypeID(struct[k + "_Type"], Binary));
                }
            } else if (struct[k] == this.DataTypeID.Array16) {// Nếu là kiểu Array
                //tương tự trường hợp trên
                var ic = this.ReadDataByTypeID(struct[k], Binary);
                Obj[k] = [];
                for (var i = 0; i < ic; i++) {
                    Obj[k].push(this.ReadDataByTypeID(struct[k + "_Type"], Binary));
                }
            }
            else {
                // trường hợp còn lại, đọc dữ liệu dựa trên loại dữ liệu.
                Obj[k] = this.ReadDataByTypeID(struct[k], Binary);
            }

        }
    }
    return Obj
};

BinaryParser.prototype.readInt8 = function (buf) {
    this.offset++;
    return buf.readInt8(this.offset - 1);
};

BinaryParser.prototype.readUInt8 = function (buf) {
    this.offset++;
    return buf.readUInt8(this.offset - 1);
};

BinaryParser.prototype.readInt16 = function (buf) {
    this.offset += 2;
    if (this.isBigEndian) {
        return buf.readInt16BE(this.offset - 2);
    } else {
        return buf.readInt16LE(this.offset - 2);
    }
};

BinaryParser.prototype.readUInt16 = function (buf) {
    this.offset += 2;
    if (this.isBigEndian) {
        return buf.readUInt16BE(this.offset - 2);
    } else {
        return buf.readUInt16LE(this.offset - 2);
    }
};

BinaryParser.prototype.readInt32 = function (buf) {
    this.offset += 4;
    if (this.isBigEndian) {
        return buf.readInt32BE(this.offset - 4);
    } else {
        return buf.readInt32LE(this.offset - 4);
    }
};

BinaryParser.prototype.readUInt32 = function (buf) {
    this.offset += 4;
    if (this.isBigEndian) {
        return buf.readUInt32BE(this.offset - 4);
    } else {
        return buf.readUInt32LE(this.offset - 4);
    }
};

BinaryParser.prototype.readInt64 = function (buf) {
    if (this.isBigEndian) {
        return this.readInt32(buf) + this.readInt32(buf) * 0x7FFFFFFF;
    } else {
        return this.readInt32(buf) * 0x7FFFFFFF + this.readInt32(buf);
    }
};

BinaryParser.prototype.readUInt64 = function (buf) {
    if (this.isBigEndian) {
        return this.readUInt32(buf) + this.readUInt32(buf) * 0xFFFFFFFF;
    } else {
        return this.readUInt32(buf) * 0xFFFFFFFF + this.readUInt32(buf);
    }
};

BinaryParser.prototype.readFloat = function (buf) {
    this.offset += 4;
    if (this.isBigEndian) {
        return buf.readFloatBE(this.offset - 4);
    } else {
        return buf.readFloatLE(this.offset - 4);
    }
};

BinaryParser.prototype.readDouble = function (buf) {
    this.offset += 8;
    if (this.isBigEndian) {
        return buf.readDoubleBE(this.offset - 8);
    } else {
        return buf.readDoubleLE(this.offset - 8);
    }

};

BinaryParser.prototype.readStringDynamic = function (buf) {
    var str = '';
    var c = 0;
    for (var i = 0; i < buf.length; i++) {
        c = this.readUInt16(buf);
        if (c == 0) break;
        str += String.fromCharCode(c);
    }
    return str;
};

BinaryParser.prototype.ReadDataByTypeID = function (TypeID, data) {
    switch (TypeID) {
        case this.DataTypeID.Int8 : {
            return this.readInt8(data);
        }
        case this.DataTypeID.UInt8 : {
            return this.readUInt8(data);
        }
        case this.DataTypeID.Int16 : {
            return this.readInt16(data);
        }
        case this.DataTypeID.UInt16 : {
            return this.readUInt16(data);
        }
        case this.DataTypeID.Int32 : {
            return this.readInt32(data);
        }
        case this.DataTypeID.UInt32 : {
            return this.readUInt32(data);
        }
        case this.DataTypeID.Int64 : {
            return this.readInt64(data);
        }
        case this.DataTypeID.UInt64 : {
            return this.readUInt64(data);
        }
        case this.DataTypeID.Float : {
            return this.readFloat(data);
        }
        case this.DataTypeID.Double : {
            return this.readDouble(data);
        }
        case this.DataTypeID.StringDynamic : {
            return this.readStringDynamic(data);
        }
        case this.DataTypeID.Object8: {
            return this.readUInt8(data);
        }
        case this.DataTypeID.Array8: {
            return this.readUInt8(data);
        }
        case this.DataTypeID.Array16: {
            return this.readUInt16(data);
        }
        default: {
            //TODO : catch Error.
        }
    }
};