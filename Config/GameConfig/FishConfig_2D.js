/**
 * Created by tainm on 8/11/2016.
 */
//[0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 21, 30, 31, 32, 33, 34];
var FishConfig = {
    RedRatio: 0.002,
    RedRule:1,//1 = rule cu 2d, ti le dua tren RedRatio , 2 = rule balance RedRatio must set be 1
    FishInfo: [
        { //0
            FishKind: 0,
            Speed: 5,
            FishMultiple: 2,
            BoundingBox: {Width: 55, Height: 15},
            HitRadius: 10,
            CaptureProbability: 0.5
        },
        { //1
            FishKind: 1,
            Speed: 5,
            FishMultiple: 2,
            BoundingBox: {Width: 60, Height: 25},
            HitRadius: 10,
            CaptureProbability: 0.5
        },
        { //2
            FishKind: 2,
            Speed: 5,
            FishMultiple: 3,
            BoundingBox: {Width: 80, Height: 32},
            HitRadius: 10,
            CaptureProbability: 0.3333
        },
        { //3
            FishKind: 3,
            Speed: 5,
            FishMultiple: 4,
            BoundingBox: {Width: 70, Height: 43},
            HitRadius: 10,
            CaptureProbability: 0.25
        },
        { //4
            FishKind: 4,
            Speed: 5,
            FishMultiple: 5,
            BoundingBox: {Width: 80, Height: 54},
            HitRadius: 10,
            CaptureProbability: 0.2
        },
        { //5
            FishKind: 5,
            Speed: 5,
            FishMultiple: 6,
            BoundingBox: {Width: 90, Height: 70},
            HitRadius: 10,
            CaptureProbability: 0.1666
        },
        { //6
            FishKind: 6,
            Speed: 5,
            FishMultiple: 7,
            BoundingBox: {Width: 90, Height: 40},
            HitRadius: 10,
            CaptureProbability: 0.1428
        },
        { //7
            FishKind: 7,
            Speed: 5,
            FishMultiple: 8,
            BoundingBox: {Width: 120, Height: 55},
            HitRadius: 10,
            CaptureProbability: 0.125
        },
        { //8
            FishKind: 8,
            Speed: 5,
            FishMultiple: 9,
            BoundingBox: {Width: 150, Height: 47},
            HitRadius: 10,
            CaptureProbability: 0.111
        },
        { //9
            FishKind: 9,
            Speed: 5,
            FishMultiple: 9,
            BoundingBox: {Width: 110, Height: 112},
            HitRadius: 10,
            CaptureProbability: 0.111
        },
        { //10
            FishKind: 10,
            Speed: 4,
            FishMultiple: 10,
            BoundingBox: {Width: 145, Height: 80},
            HitRadius: 10,
            CaptureProbability: 0.1
        },
        { //11
            FishKind: 11,
            Speed: 4,
            FishMultiple: 12,
            BoundingBox: {Width: 120, Height: 150},
            HitRadius: 10,
            CaptureProbability: 0.0833
        },
        { //12
            FishKind: 12,
            Speed: 4,
            FishMultiple: 15,
            BoundingBox: {Width: 180, Height: 70},
            HitRadius: 10,
            CaptureProbability: 0.0666
        },
        { //13
            FishKind: 13,
            Speed: 4,
            FishMultiple: 18,
            BoundingBox: {Width: 255, Height: 88},
            HitRadius: 10,
            CaptureProbability: 0.0555
        },
        { //14
            FishKind: 14,
            Speed: 4,
            FishMultiple: 20,
            BoundingBox: {Width: 180, Height: 80},
            HitRadius: 10,
            CaptureProbability: 0.05
        },
        { //15
            FishKind: 15,
            Speed: 3,
            FishMultiple: 25,
            BoundingBox: {Width: 180, Height: 150},
            HitRadius: 10,
            CaptureProbability: 0.04
        },
        { //16
            FishKind: 16,
            Speed: 3,
            FishMultiple: 30,
            BoundingBox: {Width: 250, Height: 90},
            HitRadius: 10,
            CaptureProbability: 0.0333
        },
        { //17
            FishKind: 17,
            Speed: 3,
            FishMultiple: 40,
            BoundingBox: {Width: 240, Height: 100},
            HitRadius: 10,
            CaptureProbability: 0.025
        },
        { //18
            FishKind: 18,
            Speed: 3,
            FishMultiple: 50,
            EffectID: 1,
            BoundingBox: {Width: 350, Height: 70},
            HitRadius: 10,
            CaptureProbability: 0.02
        },
        { //19
            FishKind: 19,
            Speed: 1,
            FishMultiple: 100,
            BoundingBox: {Width: 450, Height: 150},
            HitRadius: 10,
            CaptureProbability: 0.01
        },
        { //20
            FishKind: 20,
            Speed: 2,
            FishMultiple: 200,
            BoundingBox: {Width: 380, Height: 110},
            HitRadius: 10,
            CaptureProbability: 0.005
        },
        { //21
            FishKind: 21,
            Speed: 2,
            FishMultiple: 300,
            BoundingBox: {Width: 380, Height: 110},
            HitRadius: 10,
            CaptureProbability: 0.0033
        },
        { //22
            FishKind: 22,
            Speed: 3,
            FishMultiple: 9,
            MaxFishMultiple: 45,
            BoundingBox: {Width: 120, Height: 120},
            HitRadius: 10,
            CaptureProbability: 0.037
        },
        { //23 trái boom
            FishKind: 23,
            Speed: 4,
            FishMultiple: 1,
            MaxFishMultiple: 999,
            BoundingBox: {Width: 170, Height: 180},
            HitRadius: 10,
            CaptureProbability: 0.002
        },
        { //24
            FishKind: 24,
            Speed: 2,
            FishMultiple: 40,
            MaxFishMultiple: 280,
            BoundingBox: {Width: 240, Height: 220},
            HitRadius: 10,
            CaptureProbability: 0.00625
        },
        { //25
            FishKind: 25,
            Speed: 2,
            FishMultiple: 100,
            MaxFishMultiple: 250,
            BoundingBox: {Width: 250, Height: 250},
            HitRadius: 10,
            CaptureProbability: 0.0057
        },
        { //26
            FishKind: 26,
            Speed: 3,
            FishMultiple: 80,
            MaxFishMultiple: 100,
            BoundingBox: {Width: 250, Height: 250},
            HitRadius: 10,
            CaptureProbability: 0.0111
        },
        { //27
            FishKind: 27,
            Speed: 3,
            FishMultiple: 18,
            MaxFishMultiple: 30,
            BoundingBox: {Width: 130, Height: 340},
            HitRadius: 10,
            CaptureProbability: 0.0416
        },
        { //28
            FishKind: 28,
            Speed: 3,
            FishMultiple: 150,
            MaxFishMultiple: 204,
            BoundingBox: {Width: 250, Height: 250},
            HitRadius: 10,
            CaptureProbability: 0.00564
        },
        { //29
            FishKind: 29,
            Speed: 3,
            FishMultiple: 32,
            MaxFishMultiple: 60,
            BoundingBox: {Width: 130, Height: 360},
            HitRadius: 10,
            CaptureProbability: 0.02173
        },
        { //30
            FishKind: 30,
            Speed: 4,
            FishMultiple: 0,
            BoundingBox: {Width: 170, Height: 180},
            HitRadius: 10,
            CaptureProbability: 0.002
        },
        { //31
            FishKind: 31,
            Speed: 4,
            FishMultiple: 0,
            BoundingBox: {Width: 170, Height: 180},
            HitRadius: 10,
            CaptureProbability: 0.002
        },
        { //32 rồng
            FishKind: 32,
            Speed: 1,
            FishMultiple: 1,
            BoundingBox: {Width: 800, Height: 250},
            HitRadius: 10,
            CaptureProbability: 0.001,
            BossSkill: 0
        },
        { //33 tiên cá
            FishKind: 33,
            Speed: 1,
            FishMultiple: 1,
            BoundingBox: {Width: 800, Height: 250},
            HitRadius: 10,
            CaptureProbability: 0.001,
            BossSkill: 0
        },
        { //34 Te Thien Dai Thanh gia lam~~~~~~~~~~~~~~~~~~
            FishKind: 34,
            Speed: 1,
            FishMultiple: 1,
            BoundingBox: {Width: 800, Height: 250},
            HitRadius: 10,
            CaptureProbability: 0.001,
            BossSkill: 1
        },
        { //35 con cóc
            FishKind: 35,
            Speed: 2,
            FishMultiple: 1,
            BoundingBox: {Width: 350, Height: 250},
            HitRadius: 10,
            CaptureProbability: 0.001,
        },
        { //36
            FishKind: 36,
            Speed: 2,
            FishMultiple: 1,
            BoundingBox: {Width: 350, Height: 250},
            HitRadius: 10,
            CaptureProbability: 0.001
        },
        { //37
            FishKind: 37,
            Speed: 2,
            FishMultiple: 1,
            BoundingBox: {Width: 350, Height: 250},
            HitRadius: 10,
            CaptureProbability: 0.001
        },
        { //38
            FishKind: 38,
            Speed: 2,
            FishMultiple: 1,
            BoundingBox: {Width: 350, Height: 250},
            HitRadius: 10,
            CaptureProbability: 0.001
        },
        { //39
            FishKind: 39,
            Speed: 2,
            FishMultiple: 1,
            BoundingBox: {Width: 350, Height: 250},
            HitRadius: 10,
            CaptureProbability: 0.001
        }
    ]
};
module.exports = FishConfig;