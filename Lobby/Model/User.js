/**
 * Created by Ngoc on 01-02-2019.
 */
function User() {
    this.LastPick = + new Date();
    this.Room = 0;
}
module.exports = User;

User.prototype.OnPickRoom = function (Room) {

};

User.prototype.OnEnterRoom = function (Room) {

};

User.prototype.OnUpdateRoomInfo = function (Room) {

};