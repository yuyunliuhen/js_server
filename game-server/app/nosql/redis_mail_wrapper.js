/**
 * Created by King Lee on 2014/6/19.
 */
var redis_pools = require("../nosql/redis_pools");
var h_mail = 'h_mail';

var redis_mail_wrapper = module.exports;

redis_mail_wrapper.add_mail = function(title,content,phone_number,channel,version){
    redis_pools.execute('pool_1',function(client, release){
        client.hset(h_mail,Date.now(),JSON.stringify({title : title,content:content,phone_number:phone_number,channel:channel,version:version}),function (err, reply){
            if(err){
                //  some thing log
            }
            release();
        });
    });
};

redis_mail_wrapper.get_all_mail = function(cb){
    redis_pools.execute('pool_1',function(client, release){
        client.hgetall(h_mail,function (err, reply){
            if(err){
                //  some thing log
            }
            cb(reply);
            release();
        });
    });
};

redis_mail_wrapper.del_mail = function(key){
    redis_pools.execute('pool_1',function(client, release){
        client.hdel(h_mail,key,function (err, reply){
            if(err){
                //  some thing log
            }
            release();
        });
    });
};