/*{"build":1}*/
module.exports = function (RoomCore) {
    function RoomVIP() {
        RoomCore.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
    }
    RoomVIP.prototype = new RoomCore();
    return new RoomVIP();
};