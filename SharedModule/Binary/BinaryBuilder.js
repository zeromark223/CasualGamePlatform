/**
 * Created by ngocnpt on 13-Mar-17.
 */

function BinaryBuilder(obj, objStruct, isBigEndian) {
    this.isBigEndian = (isBigEndian != null && typeof isBigEndian != 'undefined') ? isBigEndian : false;
    this.DataTypeID = require('./Define');
    return this.BuildBinaryFromStruct(obj, objStruct);
}

module.exports = BinaryBuilder;

BinaryBuilder.prototype.writeFloat = function (val) {
    var buf = new Buffer(4);
    if (this.isBigEndian) {
        try {
            buf.writeFloatBE(val, 0);
        } catch (e) {
            buf.writeFloatBE(0, 0);
        }
    } else {
        try {
            buf.writeFloatLE(val, 0);
        } catch (e) {
            buf.writeFloatLE(0, 0);
        }
    }
    return buf;
};

BinaryBuilder.prototype.writeInt8 = function (val) {
    var buf = new Buffer(1);
    try {
        buf.writeInt8(val, 0);
    } catch (e) {
        buf.writeInt8(0, 0);
    }
    return buf;
};

BinaryBuilder.prototype.writeUInt8 = function (val) {
    var buf = new Buffer(1);
    try {
        buf.writeUInt8(val, 0);
    } catch (e) {
        buf.writeUInt8(0, 0);
    }
    return buf;
};


BinaryBuilder.prototype.writeInt16 = function (val) {
    var buf = new Buffer(2);
    if (this.isBigEndian) {
        try {
            buf.writeInt16BE(val, 0);
        } catch (e) {
            buf.writeInt16BE(0, 0);
        }
    } else {
        try {
            buf.writeInt16LE(val, 0);
        } catch (e) {
            buf.writeInt16LE(0, 0);
        }
    }
    return buf;
};

BinaryBuilder.prototype.writeUInt16 = function (val) {
    var buf = new Buffer(2);
    if (this.isBigEndian) {
        try {
            buf.writeUInt16BE(val, 0);
        } catch (e) {
            buf.writeUInt16BE(0, 0);
        }
    } else {
        try {
            buf.writeUInt16LE(val, 0);
        } catch (e) {
            buf.writeUInt16LE(0, 0);
        }
    }
    return buf;
};

BinaryBuilder.prototype.writeInt32 = function (val) {
    var buf = new Buffer(4);
    if (this.isBigEndian) {
        try {
            buf.writeInt32BE(val, 0);
        } catch (e) {
            buf.writeInt32BE(0, 0);
        }
    } else {
        try {
            buf.writeInt32LE(val, 0);
        } catch (e) {
            buf.writeInt32LE(0, 0);
        }
    }
    return buf;
};

BinaryBuilder.prototype.writeUInt32 = function (val) {
    var buf = new Buffer(4);
    if (this.isBigEndian) {
        try {
            buf.writeUInt32BE(val, 0);
        } catch (e) {
            buf.writeUInt32BE(0, 0);
        }
    } else {
        try {
            buf.writeUInt32LE(val, 0);
        } catch (e) {
            buf.writeUInt32LE(0, 0);
        }
    }
    return buf;
};

BinaryBuilder.prototype.writeInt64 = function (val) {
    var buf = new Buffer(8);
    //Hàm này của BTS, vi dịu vl lắm
    if (this.isBigEndian) {
        try {
            buf.writeInt32BE((val % 0x7FFFFFFF), 0);
            buf.writeInt32BE((val / 0x7FFFFFFF), 4);

        } catch (e) {
            buf.writeInt32BE(0, 0);
            buf.writeInt32BE(0, 4);
        }
    } else {
        try {
            buf.writeInt32LE((val / 0x7FFFFFFF), 0);
            buf.writeInt32LE((val % 0x7FFFFFFF), 4);
        } catch (e) {
            buf.writeInt32LE(0, 0);
            buf.writeInt32LE(0, 4);
        }

    }
    return buf;
};

BinaryBuilder.prototype.writeUInt64 = function (val) {
    var buf = new Buffer(8);
    //Hàm này của BTS, vi dịu vl lắm
    if (this.isBigEndian) {
        try {
            buf.writeUInt32BE((val % 0xFFFFFFFF), 0);
            buf.writeUInt32BE((val / 0xFFFFFFFF), 4);

        } catch (e) {
            buf.writeUInt32BE(0, 0);
            buf.writeUInt32BE(0, 4);
        }
    } else {
        try {
            buf.writeUInt32LE((val / 0xFFFFFFFF), 0);
            buf.writeUInt32LE((val % 0xFFFFFFFF), 4);
        } catch (e) {
            buf.writeUInt32LE(0, 0);
            buf.writeUInt32LE(0, 4);
        }
    }
    return buf;
};

BinaryBuilder.prototype.writeDouble = function (val) {
    var buf = new Buffer(8);
    if (this.isBigEndian) {
        try {
            buf.writeDoubleBE(val, 0);
        } catch (e) {
            buf.writeDoubleBE(0, 0);
        }
    } else {
        try {
            buf.writeDoubleLE(val, 0);
        } catch (e) {
            buf.writeDoubleLE(0, 0);
        }
    }
    return buf;
};


BinaryBuilder.prototype.writeStringDynamic = function (str, endcoding) {
    var buf = new Buffer(str.length * 2 + 2);
    buf.fill(0);// fill 0 to all buffer.
    var i;
    if (this.isBigEndian) {
        for (i = 0; i < str.length; i++) {
            buf.writeUInt16BE(str.charCodeAt(i), i * 2);
        }
    } else {
        for (i = 0; i < str.length; i++) {
            buf.writeUInt16LE(str.charCodeAt(i), i * 2);
        }
    }
    // 0 0 is break string (fill 0);
    return buf;
};

BinaryBuilder.prototype.WriteDataByTypeID = function (TypeID, data) {
    //write data theo loại
    switch (TypeID) {
        case this.DataTypeID.Int8 : {
            return this.writeInt8(data);
        }
        case this.DataTypeID.UInt8 : {
            return this.writeUInt8(data);
        }
        case this.DataTypeID.Int16 : {
            return this.writeInt16(data);
        }
        case this.DataTypeID.UInt16 : {
            return this.writeUInt16(data);
        }
        case this.DataTypeID.Int32 : {
            return this.writeInt32(data);
        }
        case this.DataTypeID.UInt32 : {
            return this.writeUInt32(data);
        }
        case this.DataTypeID.Int64 : {
            return this.writeInt64(data);
        }
        case this.DataTypeID.UInt64 : {
            return this.writeUInt64(data);
        }
        case this.DataTypeID.Float : {
            return this.writeFloat(data);
        }
        case this.DataTypeID.Double : {
            return this.writeDouble(data);
        }
        case this.DataTypeID.StringDynamic : {
            return this.writeStringDynamic(data);
        }
        case this.DataTypeID.Object8: {
            return this.writeUInt8(data);
        }
        case this.DataTypeID.Array8: {
            return this.writeUInt8(data);
        }
        case this.DataTypeID.Array16: {
            return this.writeUInt16(data);
        }
        default: {
            return;
        }
    }
};

BinaryBuilder.prototype.BuildBinaryFromArray = function (data, Type) {
    var bufArr = [];// List buffer
    for (var i = 0; i < data.length; i++) {
        //push data vào list
        bufArr.push(this.WriteDataByTypeID(Type, data[i]));
    }
    //ghep buffer
    return Buffer.concat(bufArr);
};

BinaryBuilder.prototype.BuildBinaryFromStruct = function (data, struct) {
    var bufArr = [];// List buffer
    // Kiểm tra dữ liệu.
    if (typeof struct == 'undefined' || typeof data == 'undefined') {
        if (typeof struct == 'undefined') {
            throw new Error("Error BuildBinaryFromStruct struct undefined");
        } else {
            throw new Error("Error BuildBinaryFromStruct data undefined");
        }

    }
    if (Array.isArray(data)) {// Check data có phải Array ko.
        for (var i = 0; i < data.length; i++) {
            //Đệ qui và lấy data đưa vào list buffer
            bufArr.push(this.BuildBinaryFromStruct(data[i], struct));
        }
        //Trả kết quả sau khi ghép list buffer thành 1 buffer tổng
        return Buffer.concat(bufArr);
    }
    //for each mỗi thuộc tính của struct
    for (var k in struct) {
        if (struct.hasOwnProperty(k)) { // kiểm tra lại thuộc tính có tồn tại ko
            // bỏ qua các thuộc tính có đuôi là _Struct và _Type
            if (k.indexOf("_Struct") != -1) continue;
            if (k.indexOf("_Type") != -1) continue;
            if (struct[k] == this.DataTypeID.Object8) { // struct[k] Lấy giá trị của thuộc tính . So sánh có phải là dạng Array Object ko | ví dụ {UserList:[{UserID:123}]}
                //Array Object bắt buộc phải có 1 thuộc tính phụ có tên trùng với tên thuốc tính và thêm đuôi _Struct.
                // Để mô tả cấu trúc của từng Object trong Array
                if (typeof struct[k + "_Struct"] == 'undefined') {
                    throw new Error("Error BuildBinaryFromStruct Object8 struct " + k + "_Struct undefined");
                }
                if (data[k].length == 0) { // Trường hợp Array rỗng, chỉ cần write số lượng 0
                    bufArr.push(this.WriteDataByTypeID(struct[k], data[k].length));
                } else {// Trường hợp Array có data, chỉ cần write số lượng data và bắt đầu write Data theo struct
                    bufArr.push(this.WriteDataByTypeID(struct[k], data[k].length));
                    bufArr.push(this.BuildBinaryFromStruct(data[k], struct[k + "_Struct"]));
                }

            } else {
                if (struct[k] == this.DataTypeID.Array8) { // struct[k] Lấy giá trị của thuộc tính . So sánh có phải là dạng Array ko
                    if (typeof struct[k + "_Type"] == 'undefined') {
                        throw new Error("Error BuildBinaryFromStruct Array8 " + k + "_Type undefined");
                    }
                    //tương tự trường hợp struct, // khác duy nhất ở hàm BuildBinaryFromStruct vs BuildBinaryFromArray
                    if (data[k].length == 0) {
                        bufArr.push(this.WriteDataByTypeID(struct[k], data[k].length));
                    } else {
                        bufArr.push(this.WriteDataByTypeID(struct[k], data[k].length));
                        bufArr.push(this.BuildBinaryFromArray(data[k], struct[k + "_Type"]));
                    }

                } else if (struct[k] == this.DataTypeID.Array16) {
                    // struct[k] Lấy giá trị của thuộc tính . So sánh có phải là dạng Array16 ko
                    if (typeof struct[k + "_Type"] == 'undefined') {
                        throw new Error("Error BuildBinaryFromStruct Array16 " + k + "_Type undefined");
                    }
                    //tương tự trường hợp struct, // khác duy nhất ở hàm BuildBinaryFromStruct vs BuildBinaryFromArray
                    if (data[k].length == 0) {
                        bufArr.push(this.WriteDataByTypeID(struct[k], data[k].length));
                    } else {
                        bufArr.push(this.WriteDataByTypeID(struct[k], data[k].length));
                        bufArr.push(this.BuildBinaryFromArray(data[k], struct[k + "_Type"]));
                    }

                } else {
                    if (typeof data[k] == 'undefined') {
                        throw new Error("Error BuildBinaryFromStruct data " + k + " undefined ");
                    }
                    //Các trường hợp còn lại
                    bufArr.push(this.WriteDataByTypeID(struct[k], data[k]));
                }

            }
        }
    }

    return Buffer.concat(bufArr);
};




