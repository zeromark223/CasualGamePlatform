/*{"build":1}*/
module.exports = function (RoomCore) {
    function RoomTrial() {
        RoomCore.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
    }
    RoomTrial.prototype = new RoomCore();
    return new RoomTrial();
};