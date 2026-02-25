/*{"build":1}*/
module.exports = function (RoomCore) {
    function RoomFree() {
        RoomCore.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
    }
    RoomFree.prototype = new RoomCore();
    return new RoomFree();
};
