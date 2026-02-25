/**
 * Created by quinx on 5/9/2017.
 */
var FishClass = require('../Fishes');
var Packet = require('../Packet');
var Utility = require('../../SharedModule/Utility');
var kResolutionWidth = 1280;
var kResolutionHeight = 720;

function FishSpawner(Desk) {
    this.Desk = Desk;
    this.NumberOfPathSeeds = 11; //123456
    this.DebugPath = 9;

    //PathSeeds
    this.PathSeed_LeftToRight = [1, 2, 3, 4, 5, 7];
    this.PathSeed_RightToLeft = [6, 8, 9, 10, 11, 12];

    this.Width = 1280;
    this.Height = 720;
    this.DeviationX = 200;
    this.Deviation_Min = 300;
    this.Deviation_Max = 600;
    this.MaximumZ = 150;

    //FishID
    this.CurrentFishID = 1;
    this.CurrentFishIDStart = 1;
    this.FishIDLimited = 200000;//200k
    //FishIDBoss
    this.CurrentFishIDBoss = 1000000;//1tr
    this.CurrentFishIDBossStart = 1000000;//1tr
    this.FishIDBossLimited = 2000000;//2tr

    //21, 30, 31, 32, 33, 34
    this.FishKindList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30, 31, 32, 33, 34];
    this.SmallFishList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 24];
    this.MediumFishList = [14, 15, 16, 17, 18, 19];
    this.BigFishList = [21, 22, 25];
    this.GoldenFishList = [30, 31, 32, 33, 34];
    this.CrowdedFishList = [0, 1, 2, 3, 4, 5, 6, 24];
    this.SpecialFish = [20, 23];
    this.SpecialFish_2D = [18];

    //Parade
    this.ParadeKind = {TORNADO: 1, UZUMAKI: 2, STAR: 3};
    this.CurrentParade = this.ParadeKind.UZUMAKI;


    //2D
    this.CurrentSceneKind = 0;
    this.NumberOfSceneKind = 4;
    this.CurrentParadeKind = 0;
}

module.exports = FishSpawner;

//Generate Fish ID mới
FishSpawner.prototype.GetNewFishID = function () {
    this.CurrentFishID++;
    if (this.CurrentFishID < 0 || this.CurrentFishID == 'undefined' || this.CurrentFishID > this.FishIDLimited) {
        this.CurrentFishID = this.CurrentFishIDStart;
    }
    return this.CurrentFishID;
};

FishSpawner.prototype.GetNewFishIDBoss = function () {
    this.CurrentFishIDBoss++;
    if (this.CurrentFishIDBoss < 0 || this.CurrentFishIDBoss == 'undefined' || this.CurrentFishIDBoss > this.CurrentFishIDBoss) {
        this.CurrentFishIDBoss = this.CurrentFishIDBossStart;
    }
    return this.CurrentFishIDBoss;
};
//Lấy Config dựa trên FishKind
FishSpawner.prototype.FindFishConfigByFishKind = function (FishKind) {
    for (var i = 0; i < this.Desk.GameServer.FishConfig.length; i++) {
        if (this.Desk.GameServer.FishConfig[i].FishKind == FishKind) {
            return this.Desk.GameServer.FishConfig[i];
        }
    }
    return 0;
};

//Cũ - Thả cá thường
FishSpawner.prototype.SpawnNormalFish = function (NumberOfFish, FishKindList) {
    var ListFish = [];
    var now = new Date();
    var build_tick;

    for (var i = 0; i < NumberOfFish; i++) {
        build_tick = now.getTime();
        //var FishKind = Math.floor(Math.random() * (FishKind_To - FishKind_From + 1)) + FishKind_From;
        var FishKind = FishKindList[Math.floor(Math.random() * FishKindList.length)]; //TODO DEBUG
        var PathSeed = 0;
        //Position
        var PosX = 0;
        var PosY = 0;
        var PosZ = 0;
        var IsLeft = Math.floor(Math.random() * 2);

        if (IsLeft == 1) {
            PosX = -this.DeviationX;
            PathSeed = this.PathSeed_LeftToRight[Math.floor(Math.random() * this.PathSeed_LeftToRight.length)];
        }
        else {
            PosX = this.Width + this.DeviationX;
            PathSeed = this.PathSeed_RightToLeft[Math.floor(Math.random() * this.PathSeed_RightToLeft.length)];
        }

        if (PathSeed == 6 || (PathSeed >= 8 && PathSeed < 11)) { //6 8 9 10
            PosY = Math.floor(Math.random() * this.Height / 2) + this.Height / 2; //thả trong khoảng Height / 2 -> Height
        }
        else if (PathSeed == 12) {
            PosY = this.Height;
        }
        else {
            PosY = Math.floor(Math.random() * ((this.Height - 300) - 150 + 1)) + 150; //thả trong khoảng 150 -> Height - 300
        }
        PosZ = -((Math.floor(Math.random() * (this.Deviation_Max - this.Deviation_Min + 1))) + this.Deviation_Min);

        var FishID = this.GetNewFishID();
        var FishDetail = this.FindFishConfigByFishKind(FishKind);
        var Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple);

        var EffectID = 0;

        if (FishDetail.hasOwnProperty('EffectID')) {
            EffectID = FishDetail.EffectID;
        }

        ListFish.push({
            FishID: FishID,
            FishKind: FishKind,
            SpecialKind: 0,
            PosX: PosX,
            PosY: PosY,
            PosZ: PosZ,
            PathSeed: PathSeed,
            EffectID: EffectID
        });
        this.Desk.ListFish.push(Fish);
    }
    return ListFish;
};

//Cũ - Thả cá thành hàng
FishSpawner.prototype.SpawnLineFish = function (NumberOfFish, FishKind) {
    FishKind = this.FishKindList[Math.floor(Math.random() * this.FishKindList.length)]; //TODO DEBUG
    var ListFish = [];
    var now = new Date();
    var build_tick;

    var PosX = 0;
    var PosY;
    var PosZ;
    var IsLeft = Math.floor(Math.random() * 2);
    if (IsLeft == 1) {
        PosX = -((Math.floor(Math.random() * (this.Deviation_Max - this.Deviation_Min + 1))) + this.Deviation_Min);
    }
    else {
        PosX = this.Width + ((Math.floor(Math.random() * (this.Deviation_Max - this.Deviation_Min + 1))) + this.Deviation_Min);
    }
    var PathSeed = Math.floor(Math.random() * (this.NumberOfPathSeeds)) + 1;

    PosY = Math.floor(Math.random() * (this.Height - 300)) + 150;
    PosZ = -((Math.floor(Math.random() * (this.Deviation_Max - this.Deviation_Min + 1))) + this.Deviation_Min);

    for (var i = 0; i < NumberOfFish; i++) {
        build_tick = now.getTime();
        var FishID = this.GetNewFishID();
        var FishDetail = this.FindFishConfigByFishKind(FishKind);
        var Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple);

        ListFish.push({
            FishID: FishID,
            FishKind: FishKind,
            SpecialKind: 0,
            PosX: PosX,
            PosY: PosY,
            PosZ: PosZ,
            PathSeed: PathSeed
        });
        this.Desk.ListFish.push(Fish);
    }
    return ListFish;
};

//Cũ - Thả cá trận
FishSpawner.prototype.SpawnParadeFish = function () {
    this.CurrentParade++;
    if (this.CurrentParade > Object.keys(this.ParadeKind).length) {
        this.CurrentParade = this.ParadeKind.TORNADO;
    }

    switch (this.CurrentParade) {
        case this.ParadeKind.TORNADO: //TORNADO
            this.SpawnTornadoParadeFish();
            break;
    }
};

FishSpawner.prototype.SpawnTornadoParadeFish = function () {
    var FishKindList = [2, 15, 13];
    var msg = 0;
    for (var i = 0; i < FishKindList.length; i++) {
        var ListFish = this.SpawnSmallTornadoParadeFish(FishKindList[i]);
        msg = new Packet.SpawnParadeFish(this.ParadeKind.TORNADO, i, ListFish);
        this.Desk.SendAllPlayer(msg);
    }
};

FishSpawner.prototype.SpawnSmallTornadoParadeFish = function (FishKind) {
    var ListFish = [];
    var now = new Date();
    var build_tick;
    var NumberOfFish = 15;
    for (var i = 0; i < NumberOfFish; i++) {
        build_tick = now.getTime();
        var FishID = this.GetNewFishID();
        var SpecialKind = 0;
        var FishDetail = this.FindFishConfigByFishKind(FishKind);
        var Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple);

        ListFish.push({FishID: FishID, FishKind: FishKind, SpecialKind: SpecialKind});
        this.Desk.ListFish.push(Fish);
    }
    return ListFish;
};

FishSpawner.prototype.SpawnCrowdedFish = function () {
    var ListFish = [];
    var now = new Date();
    var build_tick;
    var NumberOfFish = 5;
    var FirstX, FirstY, FirstZ;
    var PathSeed = 0;//Math.floor(Math.random() * (this.NumberOfPathSeeds)) + 1;
    var FishKind = this.CrowdedFishList[Math.floor(Math.random() * this.CrowdedFishList.length)]; //TODO DEBUG
    var Max_Distance = 120;
    var Min_Distance = 70;
    var Max_Distance_Z = 300;
    var Min_Distance_Z = 150;

    var IsLeft = Math.floor(Math.random() * 2);
    if (IsLeft == 1) {
        FirstX = -this.DeviationX;
        PathSeed = this.PathSeed_LeftToRight[Math.floor(Math.random() * this.PathSeed_LeftToRight.length)];
    }
    else {
        FirstX = this.Width + this.DeviationX;
        PathSeed = this.PathSeed_RightToLeft[Math.floor(Math.random() * this.PathSeed_RightToLeft.length)];
    }

    if (PathSeed == 6 || (PathSeed >= 8 && PathSeed < 11)) { //6 8 9 10
        FirstY = Math.floor(Math.random() * this.Height / 2) + this.Height / 2;
    }
    else {
        FirstY = Math.floor(Math.random() * this.Height);
    }


    FirstZ = -((Math.floor(Math.random() * (this.Deviation_Max - this.Deviation_Min + 1))) + this.Deviation_Min);

    for (var i = 0; i < NumberOfFish; i++) {
        var FishID = this.GetNewFishID();
        var SpecialKind = 0;
        build_tick = now.getTime();
        var PosX, PosY, PosZ;
        if (i == 0) {
            PosX = FirstX;
            PosY = FirstY;
            PosZ = FirstZ;
        }
        else {
            PosX = (Math.random() <= 0.5 ? 1 : -1) * Math.floor(Math.random() * (Max_Distance - Min_Distance + 1)) + Min_Distance + FirstX;
            PosY = (Math.random() <= 0.5 ? 1 : -1) * Math.floor(Math.random() * (Max_Distance - Min_Distance + 1)) + Min_Distance + FirstY;
            PosZ = (Math.random() <= 0.5 ? 1 : -1) * Math.floor(Math.random() * (Max_Distance - Min_Distance + 1)) + Min_Distance + FirstZ;
        }
        var FishDetail = this.FindFishConfigByFishKind(FishKind);
        var Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple);
        ListFish.push({
            FishID: FishID,
            FishKind: FishKind,
            SpecialKind: SpecialKind,
            PosX: PosX,
            PosY: PosY,
            PosZ: PosZ,
            PathSeed: PathSeed
        });
        this.Desk.ListFish.push(Fish);
    }

    return ListFish;
};

FishSpawner.prototype.SpawnBossFish = function (BossAutoID, BossID, FishKind, MaxHP, RoundCount, BirthTime) {
    var FishID = this.GetNewFishIDBoss();
    var BossFish = new FishClass.BossFish(FishID, FishKind, new Date().getTime(), this.Desk, 1);
    BossFish.Init(BossAutoID, BossID, FishKind, MaxHP, RoundCount, BirthTime, this.GeneratePosition_Boss(FishKind, RoundCount));
    //Đưa boss vào bàn
    this.Desk.ListFish.push(BossFish);
    return BossFish;
};

/** Thả cá đỏ */
FishSpawner.prototype.SpawnRedFish = function (numberOfFish) {
    var listFish = [];

    try {
        var now = +new Date();
        var build_tick;

        for (var i = 0; i < numberOfFish; i++) {
            build_tick = now;
            var fishKind = 1;//Red fish

            //Position
            var pos = {
                x: -((Math.floor(Math.random() * (this.Deviation_Max - this.Deviation_Min + 1))) + this.Deviation_Min),
                y: 0,
                z: 0
            };
            var isLeft = Math.floor(Math.random() * 2);

            if (isLeft != 1) {
                pos.x = this.Width + ((Math.floor(Math.random() * (this.Deviation_Max - this.Deviation_Min + 1))) + this.Deviation_Min);
            }
            var pathSeed = this.DebugPath;//Math.floor(Math.random() * this.NumberOfPathSeeds) + 1;
            pos.y = Math.floor(Math.random() * (this.Height - 300)) + 150;
            pos.z = -Math.floor(Math.random() * this.MaximumZ);

            var fishID = this.GetNewFishID();
            var fishDetail = this.FindFishConfigByFishKind(fishKind);
            var fishClass = new FishClass.RedFish(fishID, fishKind, build_tick, this.Desk, fishDetail.FishMultiple);

            listFish.push({
                FishID: fishID,
                FishKind: fishKind,
                SpecialKind: 1,
                PosX: pos.x,
                PosY: pos.y,
                PosZ: pos.z,
                PathSeed: pathSeed
            });
            this.Desk.ListFish.push(fishClass);
        }
    } catch (e) {
        this.Desk.GameServer.Logger.Game().error('FishSpawner.prototype.SpawnRedFish - try err: ' + e.stack);
    }

    return listFish;
};

/*
 this.CurrentParadeFish = {
 ParadeKind: 0,
 PathSeed: 0,
 BirthTime: 0,
 ListFish: [{
 FishID: 0,
 FishKind: -1,
 SpecialKind: 0
 }]
 }
 */
FishSpawner.prototype.SpawnUzumakiParadeFish = function (ParadeFish) {
    if (ParadeFish == 0) {
        ParadeFish = {};
        ParadeFish.ParadeKind = 2;
        ParadeFish.PathSeed = 2;
        ParadeFish.BirthTime = +new Date();

        var ListFish = [];
        var FishKindList = [15, 10, 1];
        var NumberOfFish = [7, 10, 15];
        var now = new Date();
        var build_tick;

        for (var i = 0; i < FishKindList.length; i++) {
            for (var j = 0; j < NumberOfFish[i]; j++) {
                build_tick = now.getTime();
                var FishID = this.GetNewFishID();
                var SpecialKind = 0;
                var FishKind = FishKindList[i];
                var FishDetail = this.FindFishConfigByFishKind(FishKind);
                var Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, 0);
                ListFish.push({FishID: FishID, FishKind: FishKind, SpecialKind: SpecialKind, ItemID: 0});
                this.Desk.ListFish.push(Fish);
            }
        }
        ParadeFish.ListFish = ListFish;
    }

    return ParadeFish;
};

FishSpawner.prototype.SpawnParadeFish_REALTIME = function (isSwitch) {

    switch (this.CurrentParade) {
        case this.ParadeKind.UZUMAKI:
            this.Desk.CurrentParadeFish = this.SpawnUzumakiParadeFish(this.Desk.CurrentParadeFish);
            break;
        case this.ParadeKind.STAR:
            this.Desk.CurrentParadeFish = this.SpawnStarParadeFish(this.Desk.CurrentParadeFish);
            break;
        default:

            break;
    }

    if (isSwitch == 1) {
        this.CurrentParade++;
        if (this.CurrentParade > Object.keys(this.ParadeKind).length) {
            this.CurrentParade = this.ParadeKind.UZUMAKI;
        }
    }
    var CurrentParadeFish = this.Desk.CurrentParadeFish;


    var msg = new Packet.SpawnParadeFish_REALTIME(CurrentParadeFish.ParadeKind, CurrentParadeFish.PathSeed, CurrentParadeFish.BirthTime, CurrentParadeFish.ListFish);

    return msg;
};

FishSpawner.prototype.SpawnSmallFish = function () {
    var NumberOfFish = Math.floor(Math.random() * 3) + 6;
    var FishList = this.SpawnNormalFish(NumberOfFish, this.SmallFishList);
    return FishList;
};

FishSpawner.prototype.SpawnMediumFish = function () {
    var NumberOfFish = Math.floor(Math.random() * 4) + 1;
    var FishList = this.SpawnNormalFish(NumberOfFish, this.MediumFishList);
    return FishList;
};

FishSpawner.prototype.SpawnBigFish = function () {
    var NumberOfFish = 1;//Math.floor(Math.random() * 4) + 1; //TODO: CHECK
    var FishList = this.SpawnNormalFish(NumberOfFish, this.BigFishList);
    return FishList;
};

FishSpawner.prototype.SpawnGoldenFish = function () {
    var NumberOfFish = 1;//Math.floor(Math.random() * 4) + 1; //TODO: CHECK
    var FishList = this.SpawnNormalFish(NumberOfFish, this.GoldenFishList);
    return FishList;
};

//TODO: DEBUG
FishSpawner.prototype.SpawnCrowdedFish1 = function (FishInfo) {
    var ListFish = [];
    var now = new Date();
    var build_tick;
    var NumberOfFish = Math.floor(Math.random() * (FishInfo.NumberOfFish - 2)) + 2;
    var FirstX, FirstY, FirstZ;
    var Paths = FishInfo.Path;
    var PathSeed = Paths[Math.floor(Math.random() * Paths.length)];

    var FishKind = FishInfo.FishKind[Math.floor(Math.random() * FishInfo.FishKind.length)];
    var Max_Distance = 200;
    var Min_Distance = 100;
    var Max_Distance_Z = 300;
    var Min_Distance_Z = 200;
    var multi = 1.2;

    var Structure = [{x: 0, y: 0}, {x: -75, y: -50}, {x: 75, y: -50}, {x: -50, y: -100}, {x: 50, y: -100}];

    var PathIndex = this.PathSeed_LeftToRight.indexOf(PathSeed);

    if (PathIndex != -1) //ben phai
    {
        FirstX = -this.DeviationX - 100;
    }
    else {
        FirstX = this.Width + this.DeviationX + 100;
    }

    FirstY = Math.floor(Math.random() * (FishInfo.MaxY - FishInfo.MinY + 1)) + FishInfo.MinY;
    FirstZ = -(Math.floor(Math.random() * (FishInfo.MaxZ - FishInfo.MinZ + 1)) + FishInfo.MinZ);

    for (var i = 0; i < NumberOfFish; i++) {
        var FishID = this.GetNewFishID();
        var SpecialKind = 0;
        build_tick = now.getTime();
        var PosX, PosY, PosZ;
        if (i == 0) {
            PosX = FirstX;
            PosY = FirstY;
            PosZ = FirstZ;
        }
        else {
            PosX = (Math.random() <= 0.5 ? 1 : -1) * Math.floor(Math.random() * (Max_Distance - Min_Distance + 1)) + Min_Distance + FirstX;
            PosY = (Math.random() <= 0.5 ? 1 : -1) * Math.floor(Math.random() * (Max_Distance - Min_Distance + 1)) + Min_Distance + FirstY;
            PosZ = FirstZ;//(Math.random() <= 0.5 ? 1 : -1) * Math.floor(Math.random() * (Max_Distance_Z - Min_Distance_Z + 1)) + Min_Distance_Z + FirstZ;
            //PosX = FirstX + Structure[i].x * multi;
            //PosY = FirstY + Structure[i].y * multi;
            //PosZ = FirstZ;
        }
        var FishDetail = this.FindFishConfigByFishKind(FishKind);
        var Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, 0);
        ListFish.push({
            FishID: FishID,
            FishKind: FishKind,
            SpecialKind: SpecialKind,
            PosX: PosX,
            PosY: PosY,
            PosZ: PosZ,
            PathSeed: PathSeed,
            ItemID: 0
        });
        this.Desk.ListFish.push(Fish);
    }

    return ListFish;
};

FishSpawner.prototype.SpawnNormalFish_Group = function (FishInfo) {
    var FishKindList = FishInfo.FishKind;
    var Paths = FishInfo.Path;
    var ListFish = [];

    var NumberOfFish = FishInfo.NumberOfFish;
    var now = new Date();
    var build_tick;


    for (var i = 0; i < NumberOfFish; i++) {
        build_tick = now.getTime();
        //var FishKind = Math.floor(Math.random() * (FishKind_To - FishKind_From + 1)) + FishKind_From;
        var FishKind = FishKindList[Math.floor(Math.random() * FishKindList.length)]; //TODO DEBUG
        var PathSeed = Paths[Math.floor(Math.random() * Paths.length)];
        //Position
        var PosX = 0;
        var PosY = 0;
        var PosZ = 0;

        var IsLeft = Math.floor(Math.random() * 2);

        if (IsLeft == 1) {
            PosX = -this.DeviationX;
        }
        else {
            PosX = this.Width + this.DeviationX;
        }

        PosY = Math.floor(Math.random() * (FishInfo.MaxY - FishInfo.MinY + 1)) + FishInfo.MinY;

        PosZ = -(Math.floor(Math.random() * (FishInfo.MaxZ - FishInfo.MinZ + 1)) + FishInfo.MinZ);

        var FishID = this.GetNewFishID();
        var FishDetail = this.FindFishConfigByFishKind(FishKind);

        var Fish = 0;
        var ItemID = 0;

        // if (this.GoldenFishList.indexOf(FishKind) != -1) { //ca hoang kim
        //     ItemID = FishDetail.ItemID;
        // }

        if (FishDetail.ItemID > 0) {
            ItemID = FishDetail.ItemID;
        }


        if (FishDetail.EffectID > 0) { //ca co EFFECT
            Fish = new FishClass.SpecialFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, ItemID, FishDetail.MaxFishMultiple, 0);
            Fish.Init(FishDetail.EffectID);
        }
        else {
            Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, ItemID, FishDetail.MaxFishMultiple, 0);
        }

        ListFish.push({
            FishID: FishID,
            FishKind: FishKind,
            SpecialKind: 0,
            PosX: PosX,
            PosY: PosY,
            PosZ: PosZ,
            PathSeed: PathSeed,
            ItemID: ItemID
        });
        this.Desk.ListFish.push(Fish);
    }

    return ListFish;
};

FishSpawner.prototype.SpawnStarParadeFish = function (ParadeFish) {
    if (ParadeFish == 0) {
        ParadeFish = {};
        ParadeFish.ParadeKind = 3;
        ParadeFish.PathSeed = 3;
        ParadeFish.BirthTime = +new Date();

        var ListFish = [];
        var FishKindList = [3, 18];
        var NumberOfFish = [20, 20];
        var now = new Date();
        var build_tick;

        for (var i = 0; i < FishKindList.length; i++) {
            for (var j = 0; j < NumberOfFish[i]; j++) {
                build_tick = now.getTime();
                var FishID = this.GetNewFishID();
                var SpecialKind = 0;
                var FishKind = FishKindList[i];
                var FishDetail = this.FindFishConfigByFishKind(FishKind);
                var Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, 0);
                ListFish.push({FishID: FishID, FishKind: FishKind, SpecialKind: SpecialKind, ItemID: 0});
                this.Desk.ListFish.push(Fish);
            }
        }
        ParadeFish.ListFish = ListFish;
    }

    return ParadeFish;
};

FishSpawner.prototype.SpawnSpecialFish = function () {
    var NumberOfFish = Math.floor(Math.random() * 3) + 6;
    var FishList = this.SpawnNormalFish(NumberOfFish, this.SpecialFish);
    return FishList;
};

FishSpawner.prototype.CreateSpecialFish = function (NumberOfFish, FishKindList) {
    var ListFish = [];
    var now = new Date();
    var build_tick;

    for (var i = 0; i < NumberOfFish; i++) {
        build_tick = now.getTime();
        //var FishKind = Math.floor(Math.random() * (FishKind_To - FishKind_From + 1)) + FishKind_From;
        var FishKind = FishKindList[Math.floor(Math.random() * FishKindList.length)]; //TODO DEBUG
        var PathSeed = 0;
        //Position
        var PosX = 0;
        var PosY = 0;
        var PosZ = 0;
        var IsLeft = Math.floor(Math.random() * 2);

        if (IsLeft == 1) {
            PosX = -this.DeviationX;
            PathSeed = this.PathSeed_LeftToRight[Math.floor(Math.random() * this.PathSeed_LeftToRight.length)];
        }
        else {
            PosX = this.Width + this.DeviationX;
            PathSeed = this.PathSeed_RightToLeft[Math.floor(Math.random() * this.PathSeed_RightToLeft.length)];
        }

        if (PathSeed == 6 || (PathSeed >= 8 && PathSeed < 11)) { //6 8 9 10
            PosY = Math.floor(Math.random() * this.Height / 2) + this.Height / 2; //thả trong khoảng Height / 2 -> Height
        }
        else if (PathSeed == 12) {
            PosY = this.Height;
        }
        else {
            PosY = Math.floor(Math.random() * ((this.Height - 300) - 150 + 1)) + 150; //thả trong khoảng 150 -> Height - 300
        }
        PosZ = -((Math.floor(Math.random() * (this.Deviation_Max - this.Deviation_Min + 1))) + this.Deviation_Min);

        var FishID = this.GetNewFishID();
        var FishDetail = this.FindFishConfigByFishKind(FishKind);
        var Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple);

        ListFish.push({
            FishID: FishID,
            FishKind: FishKind,
            SpecialKind: 0,
            PosX: PosX,
            PosY: PosY,
            PosZ: PosZ,
            PathSeed: PathSeed,
            ItemID: 0
        });
        this.Desk.ListFish.push(Fish);
    }
    return ListFish;
};

FishSpawner.prototype.GeneratePosition = function (InitCount, FishKind) {
    var Position = [];
    var FishDetail = this.FindFishConfigByFishKind(FishKind);

    for (var i = 0; i < 3; i++) {
        Position.push({PosX: 0, PosY: 0});
    }
    var chair_id = Math.floor(Math.random() * (8));

    var center_x = kResolutionWidth / 2;
    var center_y = kResolutionHeight / 2;

    var factor = Math.floor(Math.random() * 2) % 2 == 0 ? 1 : -1;

    switch (chair_id) {
        case 0:
        case 1:
        case 2:
            Position[0].PosX = center_x + factor * Math.floor(Math.random() * center_x);
            Position[0].PosY = 0 - FishDetail.Height * 2;
            Position[1].PosX = center_x + factor * Math.floor(Math.random() * center_x);
            Position[1].PosY = center_y + (Math.floor(Math.random() * center_y));
            Position[2].PosX = center_x - factor * Math.floor(Math.random() * center_x);
            Position[2].PosY = kResolutionHeight + FishDetail.Height * 2;
            break;
        case 3:
            Position[0].PosX = kResolutionWidth + FishDetail.Width * 2;
            Position[0].PosY = center_y + factor * Math.floor(Math.random() * center_y);
            Position[1].PosX = center_x - (Math.floor(Math.random() * center_x));
            Position[1].PosY = center_y + factor * Math.floor(Math.random() * center_y);
            Position[2].PosX = 0 - FishDetail.Width * 2;
            Position[2].PosY = center_y - factor * Math.floor(Math.random() * center_y);
            break;
        case 4:
        case 5:
        case 6:
            Position[0].PosX = center_x + factor * Math.floor(Math.random() * center_x);
            Position[0].PosY = kResolutionHeight + FishDetail.Height * 2;
            Position[1].PosX = center_x + factor * Math.floor(Math.random() * center_x);
            Position[1].PosY = center_y + (Math.floor(Math.random() * center_y));
            Position[2].PosX = center_x - factor * Math.floor(Math.random() * center_x);
            Position[2].PosY = 0 - FishDetail.Height * 2;
            break;
        case 7:
            Position[0].PosX = 0 - FishDetail.Width * 2;
            Position[0].PosY = center_y + factor * Math.floor(Math.random() * center_y);
            Position[1].PosX = center_x - (Math.floor(Math.random() * center_x));
            Position[1].PosY = center_y + factor * Math.floor(Math.random() * center_y);
            Position[2].PosX = kResolutionWidth + FishDetail.Width * 2;
            Position[2].PosY = center_y - factor * Math.floor(Math.random() * center_y);
            break;
    }

    if (InitCount == 2) {
        Position[1] = Position[2];
    }

    Position.Direction = chair_id;

    return Position;
};

FishSpawner.prototype.GeneratePosition_Group = function (InitCount, FishKind) {
    var Position = [];
    var FishDetail = this.FindFishConfigByFishKind(FishKind);

    for (var i = 0; i < 3; i++) {
        Position.push({PosX: 0, PosY: 0});
    }
    var chair_id = Math.floor(Math.random() * (8));

    var center_x = kResolutionWidth / 2;
    var center_y = kResolutionHeight / 2;

    var factor = Math.floor(Math.random() * 2) % 2 == 0 ? 1 : -1;

    switch (chair_id) {
        case 0:
        case 1:
        case 2:
            Position[0].PosX = center_x + factor * Math.floor(Math.random() * center_x);
            Position[0].PosY = 0 - FishDetail.BoundingBox.Height * 2;
            Position[1].PosX = center_x + factor * Math.floor(Math.random() * center_x);
            Position[1].PosY = center_y + (Math.floor(Math.random() * center_y));
            Position[2].PosX = center_x - factor * Math.floor(Math.random() * center_x);
            Position[2].PosY = kResolutionHeight + FishDetail.BoundingBox.Height * 2;
            break;
        case 3:
            Position[0].PosX = kResolutionWidth + FishDetail.BoundingBox.Width * 2;
            Position[0].PosY = center_y + factor * Math.floor(Math.random() * center_y);
            Position[1].PosX = center_x - (Math.floor(Math.random() * center_x));
            Position[1].PosY = center_y + factor * Math.floor(Math.random() * center_y);
            Position[2].PosX = 0 - FishDetail.BoundingBox.Width * 2;
            Position[2].PosY = center_y - factor * Math.floor(Math.random() * center_y);
            break;
        case 4:
        case 5:
        case 6:
            Position[0].PosX = center_x + factor * Math.floor(Math.random() * center_x);
            Position[0].PosY = kResolutionHeight + FishDetail.BoundingBox.Height * 2;
            Position[1].PosX = center_x + factor * Math.floor(Math.random() * center_x);
            Position[1].PosY = center_y + (Math.floor(Math.random() * center_y));
            Position[2].PosX = center_x - factor * Math.floor(Math.random() * center_x);
            Position[2].PosY = 0 - FishDetail.BoundingBox.Height * 2;
            break;
        case 7:
            Position[0].PosX = 0 - FishDetail.BoundingBox.Width * 2;
            Position[0].PosY = center_y + factor * Math.floor(Math.random() * center_y);
            Position[1].PosX = center_x - (Math.floor(Math.random() * center_x));
            Position[1].PosY = center_y + factor * Math.floor(Math.random() * center_y);
            Position[2].PosX = kResolutionWidth + FishDetail.BoundingBox.Width * 2;
            Position[2].PosY = center_y - factor * Math.floor(Math.random() * center_y);
            break;
    }

    if (InitCount == 2) {
        Position[1] = Position[2];
    }

    return {Position: Position, ChairID: chair_id};
};

FishSpawner.prototype.GeneratePosition_Boss = function (FishKind, RoundCount) {
    var Position = [];
    var FishDetail = this.FindFishConfigByFishKind(FishKind);

    for (var i = 0; i < 3; i++) {
        Position.push({PosX: 0, PosY: 0});
    }

    var center_y = kResolutionHeight / 2;
    if (RoundCount % 2) {// vòng chẵn thì quay lại (từ phải qua trái)
        Position[0].PosX = -FishDetail.Width;
        Position[0].PosY = center_y;
        Position[1].PosX = kResolutionWidth + FishDetail.Width * 2;
        Position[1].PosY = center_y;
        Position[2].PosX = kResolutionWidth + FishDetail.Width * 2;
        Position[2].PosY = center_y;
    } else {//từ trái qua phải
        Position[0].PosX = kResolutionWidth + FishDetail.Width * 2;
        Position[0].PosY = center_y;
        Position[1].PosX = -FishDetail.Width;
        Position[1].PosY = center_y;
        Position[2].PosX = -FishDetail.Width;
        Position[2].PosY = center_y;
    }
    return Position;
};

FishSpawner.prototype.SpawnParadeFish3 = function () {
    var ListFishKind = [0, 2, 4, 1, 3, 5, 19];
    var ListNumberFish = [100, 17, 17, 30, 30, 15, 1];
    var ListFish = [];

    for (var i = 0; i < ListFishKind.length; i++) {
        var FishKind = ListFishKind[i];
        var build_tick = +new Date();
        var iRandRed = Math.floor(Math.random() * ListNumberFish[i]);
        var FishDetail = this.FindFishConfigByFishKind(FishKind);
        for (var j = 0; j < ListNumberFish[i]; j++) {
            var IsRedFish = 0;
            var Fish = 0;
            var FishID = this.GetNewFishID();
            if (j == iRandRed && FishKind < 11) {
                IsRedFish = 1;
            }


            if (IsRedFish) {
                //ca do
                Fish = new FishClass.RedFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, IsRedFish);
                Fish.Init(this.GetFishRedRatio(), this.GetFishRedRule());

            }
            else {
                Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, IsRedFish);
            }

            this.Desk.ListFish.push(Fish);

            ListFish.push({
                FishID: FishID,
                FishKind: FishKind,
                IsRedFish: IsRedFish
            })

        }
    }
    return ListFish;
};

FishSpawner.prototype.SpawnParadeFish1 = function () {
    var ListFishKind = [0, 16, 17, 16, 17, 16, 17, 16, 20, 21, 20, 21, 20, 21, 20];//20,21,20,21,20,21,20
    var ListNumberFish = [200, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    var ListFish = [];

    for (var i = 0; i < ListFishKind.length; i++) {
        var build_tick = +new Date();
        var iRandRed = Math.floor(Math.random() * ListNumberFish[i]);
        for (var j = 0; j < ListNumberFish[i]; j++) {
            var FishKind = ListFishKind[i];

            if (FishKind == -1) {
                FishKind = 11 + (j % 7);
            }

            var FishDetail = this.FindFishConfigByFishKind(FishKind);

            var IsRedFish = 0;
            var Fish = 0;
            var FishID = this.GetNewFishID();
            if (j == iRandRed && FishKind < 11) {
                IsRedFish = 0;
            }

            if (IsRedFish) {
                //ca do
                Fish = new FishClass.RedFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, IsRedFish);
                Fish.Init(this.GetFishRedRatio(), this.GetFishRedRule());
            }
            else {
                Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, IsRedFish);
            }

            this.Desk.ListFish.push(Fish);

            ListFish.push({
                FishID: FishID,
                FishKind: FishKind,
                IsRedFish: IsRedFish
            })

        }
    }
    return ListFish;
};

FishSpawner.prototype.SpawnParadeFish2 = function () {
    //var ListFishKind = [10, 11, 12, 13, 14, 15, 16, 17];
    //var ListNumberFish = [8, 8, 8, 8, 8, 8, 8, 8];

    //var ListFishKind = [16, 17, 16, 17, 15, 26, 16, 17, 16, 17, 15, 26, 16, 17, 16, 17, 15, 26, 16, 17, 16, 17, 15, 26, 20, 21, 20, 21, 29, 24, 20, 21, 20, 21, 29, 24, 20, 21, 20, 21, 29, 24, 20, 21, 20, 21, 29, 24];//10,10,10
    //var ListNumberFish = [2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1];//3,1,3,1

    var ListFishKind = [10, 11, 12, 13, 14, 23, 15, 20, 16, 21, 17, 24];
    var ListNumberFish = [8, 8, 8, 8, 7, 1, 7, 1, 7, 1, 7, 1];

    var ListFish = [];

    for (var i = 0; i < ListFishKind.length; i++) {
        var build_tick = +new Date();
        var iRandRed = Math.floor(Math.random() * ListNumberFish[i]);
        var FishKind = ListFishKind[i];

        var FishDetail = this.FindFishConfigByFishKind(FishKind);
        for (var j = 0; j < ListNumberFish[i]; j++) {


            var IsRedFish = 0;
            var Fish = 0;
            var FishID = this.GetNewFishID();
            if (j == iRandRed && FishKind < 11) {
                IsRedFish = 1;
            }

            if (IsRedFish) {
                //ca do
                Fish = new FishClass.RedFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, IsRedFish);
                Fish.Init(this.GetFishRedRatio(), this.GetFishRedRule());
            }
            else {
                Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, IsRedFish);
            }

            this.Desk.ListFish.push(Fish);

            ListFish.push({
                FishID: FishID,
                FishKind: FishKind,
                IsRedFish: IsRedFish
            })

        }
    }
    return ListFish;
};

FishSpawner.prototype.SpawnParadeFish4 = function () {
    var ListFishKind = [0, 2, 3, 15, 0, 1, 4, 17];
    var ListNumberFish = [50, 40, 30, 1, 50, 40, 30, 1];
    var ListFish = [];

    for (var i = 0; i < ListFishKind.length; i++) {
        var build_tick = +new Date();
        var iRandRed = Math.floor(Math.random() * ListNumberFish[i]);
        var FishKind = ListFishKind[i];
        var FishDetail = this.FindFishConfigByFishKind(FishKind);
        for (var j = 0; j < ListNumberFish[i]; j++) {


            var IsRedFish = 0;
            var Fish = 0;
            var FishID = this.GetNewFishID();
            if (j == iRandRed && FishKind < 11) {
                IsRedFish = 1;
            }

            if (IsRedFish) {
                //ca do
                Fish = new FishClass.RedFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, IsRedFish);
                Fish.Init(this.GetFishRedRatio(), this.GetFishRedRule());
            }
            else {
                Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, IsRedFish);
            }

            this.Desk.ListFish.push(Fish);

            ListFish.push({
                FishID: FishID,
                FishKind: FishKind,
                IsRedFish: IsRedFish
            })

        }
    }
    return ListFish;
};

FishSpawner.prototype.SpawnParadeFish5 = function () {
    var ListFishKind = [0, 1, 2, 2, 3, 6, 5, 5, 19, 19];
    var ListNumberFish = [40, 40, 40, 40, 24, 24, 13, 13, 1, 1];
    var ListFish = [];

    for (var i = 0; i < ListFishKind.length; i++) {
        var build_tick = +new Date();
        var iRandRed = Math.floor(Math.random() * ListNumberFish[i]);
        var FishKind = ListFishKind[i];
        var FishDetail = this.FindFishConfigByFishKind(FishKind);
        for (var j = 0; j < ListNumberFish[i]; j++) {


            var IsRedFish = 0;
            var Fish = 0;
            var FishID = this.GetNewFishID();
            if (j == iRandRed && FishKind < 11) {
                IsRedFish = 1;
            }

            if (IsRedFish) {
                //ca do
                Fish = new FishClass.RedFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, IsRedFish);
                Fish.Init(this.GetFishRedRatio(), this.GetFishRedRule());
            }
            else {
                Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, IsRedFish);
            }

            this.Desk.ListFish.push(Fish);

            ListFish.push({
                FishID: FishID,
                FishKind: FishKind,
                IsRedFish: IsRedFish
            })

        }
    }
    return ListFish;
};

FishSpawner.prototype.ManageSpawnParade = function () {
    var ListFish = [];
    var ParadeKind = this.CurrentParadeKind;
    var SceneKind = this.CurrentSceneKind;

    switch (this.CurrentParadeKind) {
        case 0:
            ListFish = this.SpawnParadeFish1();
            break;
        case 1:
            ListFish = this.SpawnParadeFish2();
            break;
        case 2:
            ListFish = this.SpawnParadeFish3();
            break;
        case 3:
            ListFish = this.SpawnParadeFish4();
            break;
        case 4:
            ListFish = this.SpawnParadeFish5();
            break;
    }

    this.CurrentParadeKind++;
    if (this.CurrentParadeKind > 1) {
        this.CurrentParadeKind = 0;
    }

    this.CurrentSceneKind++;
    if (this.CurrentSceneKind > 5) {
        this.CurrentSceneKind = 0;
    }

    //TODO: TEMPORARY
    this.Desk.CurrentParadeFish = {};
    this.Desk.CurrentParadeFish.ParadeKind = this.CurrentParadeKind;
    this.Desk.CurrentParadeFish.CurrentSceneKind = this.CurrentSceneKind;
    this.Desk.CurrentParadeFish.ListFish = ListFish;
    //TODO: TEMPORARY

    // var msg = new Packet.SpawnParadeFish_REALTIME(CurrentParadeFish.ParadeKind, CurrentParadeFish.PathSeed, CurrentParadeFish.BirthTime, CurrentParadeFish.ListFish);

    var msg = new Packet.SpawnParadeFish_2D(ParadeKind, SceneKind, ListFish);
    return msg;
};

FishSpawner.prototype.SpawnNormalFish_Group_2D = function (FishInfo) {
    var FishKindList = FishInfo.FishKind;
    var Paths = FishInfo.Path;
    var ListFish = [];

    var NumberOfFish = FishInfo.NumberOfFish;
    var now = new Date();
    var build_tick;
    var myFish = [];
    var myPath = [];


    for (var i = 0; i < NumberOfFish; i++) {
        build_tick = now.getTime();
        //var FishKind = Math.floor(Math.random() * (FishKind_To - FishKind_From + 1)) + FishKind_From;
        var FishKind = FishKindList[Math.floor(Math.random() * FishKindList.length)]; //TODO DEBUG

        //Position
        var IsRedFish = FishInfo.IsRedFish;

        var FishID = this.GetNewFishID();
        var FishDetail = this.FindFishConfigByFishKind(FishKind);

        var Fish = 0;
        var ItemID = 0;

        if (IsRedFish) {
            Fish = new FishClass.RedFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, ItemID, FishDetail.MaxFishMultiple, IsRedFish);
            if (Utility.CheckVariable(FishInfo, 'RedFishRatio', 'RedFishRule')) {
                Fish.Init(FishInfo.RedFishRatio, FishInfo.RedFishRule);
            } else {
                Fish.Init(0.001, 1);//1 = rule cu 2d, ti le dua tren RedRatio , 2 = rule balance RedRatio must set be 1
            }

        }
        else {
            if (FishDetail.EffectID > 0) { //ca DB
                Fish = new FishClass.SpecialFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, ItemID, FishDetail.MaxFishMultiple, IsRedFish);
                Fish.Init(FishDetail.EffectID);
            }
            else {
                Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, ItemID, FishDetail.MaxFishMultiple, IsRedFish);
            }
        }

        var InitCount = 2;
        if (FishKind > 1) {
            InitCount = 3;
        }

        var Position = [];
        Position = this.GeneratePosition(InitCount, FishKind);

        ListFish.push({
            FishID: FishID,
            FishKind: FishKind,
            IsRedFish: IsRedFish,
            InitCount: InitCount,
            Position: Position,
            ItemID: ItemID
        });
        this.Desk.ListFish.push(Fish);
    }

    return ListFish;
};

FishSpawner.prototype.SpawnCrowdedFish1_2D = function (FishInfo) {
    var ListFish = [];
    var now = new Date();
    var build_tick;
    var NumberOfFish = Math.floor(Math.random() * (FishInfo.NumberOfFish - 2)) + 2;
    var FishKind = FishInfo.FishKind[Math.floor(Math.random() * FishInfo.FishKind.length)];
    var InitCount = 2;

    if (FishKind > 1) {
        InitCount = 3;
    }

    var FirstPosition = this.GeneratePosition(InitCount, FishKind);


    for (var i = 0; i < NumberOfFish; i++) {

        var Position = FirstPosition;
        var FishID = this.GetNewFishID();
        var FishDetail = this.FindFishConfigByFishKind(FishKind);


        build_tick = now.getTime();

        switch (FirstPosition.Direction) {
            case 0:
            case 1:
            case 2:
                Position[0].PosY = FirstPosition[0].PosY - 100 * i;
                break;
            case 3:
                Position[0].PosX = FirstPosition[0].PosX + 100 * i;
                break;
            case 4:
            case 5:
            case 6:
                Position[0].PosY = FirstPosition[0].PosY + 100 * i;
                break;
            case 7:
                Position[0].PosX = FirstPosition[0].PosX - 100 * i;
                break;
        }


        var Fish = new FishClass.NormalFish(FishID, FishKind, build_tick, this.Desk, FishDetail.FishMultiple, 0, FishDetail.MaxFishMultiple, 0);
        ListFish.push({
            FishID: FishID,
            FishKind: FishKind,
            IsRedFish: 0,
            InitCount: InitCount,
            Position: Position,
            ItemID: 0
        });

        this.Desk.ListFish.push(Fish);
    }

    return ListFish;
};

FishSpawner.prototype.GetFishRedRatio = function () {
    return 0.002;
};

FishSpawner.prototype.GetFishRedRule = function () {
    return 1;
};