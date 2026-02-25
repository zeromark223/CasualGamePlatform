/*{"build":1}*/
module.exports = function (DeskCore) {
    function DeskFree() {
        DeskCore.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
    }
    DeskFree.prototype = new DeskCore();
    return new DeskFree();
};
