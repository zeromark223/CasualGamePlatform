/**
 * Created by tainm on 18/07/2016.
 */
var StatusCode ={
    Fail: -1,//thất bại
    NotEnoughMoney: 0,// Không đủ tiền vào bàn
    Success: 1,// Thành công
    NotRoom: 2,// Không có phòng
    RoomNotExist: 3,// Phòng không tồn tại
    NotEnoughLevel: 4,// Không đủ level
    NotData: 5,// Không tìm thấy dữ liệu
    SystemError: 9999,// Lỗi hệ thống
};

module.exports = StatusCode;
