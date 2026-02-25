/* {"build": 1} */
module.exports = function (DeskCore) {
    function DeskFactory() {
        DeskCore.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
    }

    DeskFactory.prototype = new DeskCore();
    return new DeskFactory();
};
