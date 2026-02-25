/**
 * Created by ngocnpt on 02/06/2016.
 */
var DefaultConfig = require('../Common/DefaultConfig');
var PubSubConfig = {
    Host: DefaultConfig.Redis.Host,
    Port: DefaultConfig.Redis.Port,
    Password: DefaultConfig.Redis.Password,
    DB: 1,
    Master: {
        Main: {
            SubcriberCPP: 'ClientRedisC_Master',
            PublisherCPP: 'ClientRedisC_Master',
            Subcriber: 'MMS:',
            Publisher: 'MMP:',
            Command: {
                LoginConflict: 1
            }
        },
        RoomManager: {
            Subcriber: 'MRS:',
            Publisher: 'MRP:',
            Command: {
                PickRoom: 1,
                CreateRoom: 2,
                KillRoom: 3,
                MaintainRoom: 4,
                OfflineRoom: 5
            }
        }
    }
};
module.exports = PubSubConfig;