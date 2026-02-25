var encrytion = require('../SharedModule/encrytion');
var configrandomhour = {
    FishList:
        [
            {
                FishKind: 31,
                FishMultiple: 100,
                MaxFishMultiple: 400,
                Interval: 30000,
                FishCount: 2,
                FishMaxCount: 3
            },
            {
                FishKind: 32,
                FishMultiple: 500,
                MaxFishMultiple: 1000,
                Interval: 30000,
                FishCount: 1,
                FishMaxCount: 2
            }
        ]
};
var configHunt = {
    FishList:
        [
            {FishKind: 0, Ratio: 1},
            {FishKind: 1, Ratio: 1},
            {FishKind: 2, Ratio: 1},
            {FishKind: 3, Ratio: 1},
            {FishKind: 4, Ratio: 1},
            {FishKind: 5, Ratio: 1},
            {FishKind: 6, Ratio: 1},
            {FishKind: 7, Ratio: 1},
            {FishKind: 8, Ratio: 1},
            {FishKind: 9, Ratio: 1},
            {FishKind: 10, Ratio: 1},
            {FishKind: 11, Ratio: 1},
            {FishKind: 12, Ratio: 1},
            {FishKind: 13, Ratio: 1},
            {FishKind: 14, Ratio: 1},
            {FishKind: 15, Ratio: 1},
            {FishKind: 16, Ratio: 1},
            {FishKind: 17, Ratio: 1},
            {FishKind: 18, Ratio: 1},
            {FishKind: 19, Ratio: 1},
            {FishKind: 20, Ratio: 1},
            {FishKind: 21, Ratio: 1},
            {FishKind: 22, Ratio: 1},
            {FishKind: 23, Ratio: 1},
            {FishKind: 24, Ratio: 1},
            {FishKind: 25, Ratio: 1},
            {FishKind: 26, Ratio: 1},
            {FishKind: 27, Ratio: 1},
            {FishKind: 28, Ratio: 1},
            {FishKind: 29, Ratio: 1}
        ]
};

var test = {
    cmd:'event',
    action:'get',
    eventcode:'',
    langcode:'vn',
    data:{
        startTime:new Date('2017-01-01'),
        endTime:new Date('2019-01-01'),
        startDisplayTime:new Date('2017-01-01'),
        endDisplayTime:new Date('2019-01-01'),
        config:{}
    }
};
//test hunt
var key = 'umbala@botchien';
//
test.eventcode ='FishNameByLang';
test.action ='get';
test.langcode ='vn';
test.data.config =  configrandomhour;
//
var a = encrytion.aesEncryptIV(JSON.stringify(test),key,key);
console.log(a);
// cmd	event
// action	get/update/clear	lấy/chỉnh sửa/ clear data khi start event mới
// eventcode	mã event
// langcode	VN / EN	Mã ngôn ngữ, VN EN ....
// data (chỉ action update cần)	startTime	Thời gian bắt đầu sk
// endTime	Thời gian kết thúc sk
// startDisplayTime	Thời gian bắt hiển thị top sk trong game
// endDisplayTime	Thời gian bắt hiển thị top sk trong game
// config	Mỗi event sẽ có định nghĩa config khác nhau
//
// 0	Cá Ốc Sên
// 1	Cá Cỏ Xanh
// 2	Cá Cỏ Vàng
// 3	Cá Mắt Lớn
// 4	Cá Dẹp Vàng
// 5	Cá Chú Hề
// 6	Cá Nhỏ
// 7	Cá Xanh
// 8	Cá Đèn Lồng
// 9	Cá Đèn Lồng Xanh
// 10	Rùa Biển
// 11	Cá Cánh Hoa
// 12	Cá Bướm
// 13	Cá Khổng Tước
// 14	Cá Kiếm
// 15	Cá Dơi
// 16	Cá Mập Bạc
// 17	Cá Mập Vàng
// 18	Gậy Kim Cô
// 19	Cá Voi Vua
// 20	Rồng Bạc
// 21	Rồng Vàng
// 22	Cỏ Biển
// 23	Đạn Nổ
// 24	Tháp Năng Lượng
// 25	Cá Nhà Táng
// 26	Cá Tam Nguyên 3
// 27	Cá Tam Nguyên Lớn
// 28	Cá Tam Nguyên 4
// 29	Cá Tử Hỉ Lớn
// 30	Vua Cá Đỏ
// 31	Cóc xanh lè
// 32	Cóc vàng khè
// 33	Boss bạch tuộc đỏ
// 34	Boss bạch tuộc vàng
// 35	Boss người cá nam
// 36	Boss người cá nữ
