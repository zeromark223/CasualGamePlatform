/**
 * Created by quinx on 6/30/2017.
 */

var FishScriptConfig = [


    //Cá nhỏ
    { FishKind: [0, 1, 2, 3, 4, 5, 6, 24], Path: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], Time: 4284, MinY: 100, MaxY: 700, MinZ: 300, MaxZ: 600, IsCrowded: 0, NumberOfFish: 3 },
    { FishKind: [7, 8, 9, 10, 11, 12, 13], Path: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], Time: 5314, MinY: 100, MaxY: 700, MinZ: 1, MaxZ: 300, IsCrowded: 0, NumberOfFish: 2 },
    //Cá vừa
    { FishKind: [14, 15, 16, 17, 18, 19], Path: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11], Time: 6000, MinY: 100, MaxY: 700, MinZ: 1, MaxZ: 600, IsCrowded: 0, NumberOfFish: 2 },
    //Cá lớn
    { FishKind: [21, 22], Path: [2, 3, 5, 6, 7], Time: 15000, MinY: 200, MaxY: 700, MinZ: 300, MaxZ: 600, IsCrowded: 0, NumberOfFish: 1 },
    { FishKind: [25], Path: [2, 3, 5, 6, 7], Time: 12000, MinY: 200, MaxY: 700, MinZ: 1, MaxZ: 600, IsCrowded: 0, NumberOfFish: 1 },
    //Cá hiệu ứng
    { FishKind: [20, 23], Path: [2, 3, 5, 6, 7], Time: 25237, MinY: 200, MaxY: 700, MinZ: 300, MaxZ: 600, IsCrowded: 0, NumberOfFish: 1 },
    //Cá hoàng kim
    { FishKind: [31, 33], Path: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], Time: 15844, MinY: 100, MaxY: 700, MinZ: 150, MaxZ: 300, IsCrowded: 0, NumberOfFish: 1 },
    { FishKind: [30, 32, 34], Path: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11], Time: 15972, MinY: 100, MaxY: 700, MinZ: 150, MaxZ: 600, IsCrowded: 0, NumberOfFish: 1 },
    //Cá đàn
    { FishKind: [0, 1, 2, 3, 4, 5, 6, 24], Path: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], Time: 4000, MinY: 1, MaxY: 720, MinZ: 150, MaxZ: 300, IsCrowded: 1, NumberOfFish: 7 },
    { FishKind: [0, 1, 2, 3, 4, 6, 24], Path: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], Time: 4000, MinY: 1, MaxY: 720, MinZ: 300, MaxZ: 600, IsCrowded: 1, NumberOfFish: 7 },
    //Cá làm trò
    { FishKind: [15, 9, 13, 12, 14, 17, 1], Path: [12], Time: 13000, MinY: 720, MaxY: 920, MinZ: 150, MaxZ: 300, IsCrowded: 0, NumberOfFish: 1 },

    ];

module.exports = FishScriptConfig;