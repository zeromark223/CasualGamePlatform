/**
 * Created by tainm on 10/12/2016.
 */
exports.SetBulletIon = function (configBulletIon, bulletIon) {
    try {
        if(configBulletIon)
            return bulletIon;
    }catch (e){
        console.log('Modules - BulletIon - SetBulletIon - try err: ' + e);
    }

    return false;
};

exports.BulletIonTimer = function (configBulletIon, bulletIonTimer, msg, user) {
    try{
        if(configBulletIon){
            setTimeout(function () {
                user.IsSpecialBullet = false;
                if(msg != 0)
                    user.MyDesk.SendAllPlayer(msg);
            }, bulletIonTimer * 1000);
        }
    }catch (e){
        console.log('Modules - BulletIon - BulletIonTimer - try err: ' + e);
    }
};