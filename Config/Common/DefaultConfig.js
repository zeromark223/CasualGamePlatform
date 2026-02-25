/**
 * Created by ngocnpt on 23/08/2016.
 */
var DefaultConfig = {
    Redis:{
        Host: '115.78.5.187',
        Port: 2205,
        Password: '123456'
    },
    SQLConfig:{
        connectionLimit:10,
        host: '115.78.5.187',
        port:2204,
        user: 'root',
        password: '123456',
        database: 'bc68'
    },
    LogRecorderConfig:{
        connectionLimit:10,
        host: '115.78.5.187',
        port:2204,
        user: 'root',
        password: '123456',
        database: 'bc68_log'
    }
};
module.exports = DefaultConfig;
