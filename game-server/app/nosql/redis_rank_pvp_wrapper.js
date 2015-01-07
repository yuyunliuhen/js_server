/**
 * Created by King Lee on 2015/1/5.
 */
var redis_pools = require("../nosql/redis_pools");

var redis_rank_pvp_wrapper = module.exports;
var log4js = require('log4js');
var log_json = require('../../config/log.json');
log4js.configure(log_json);
var rank_for_pvp_logger = log4js.getLogger('rank-for-pvp-logger');
var h_rank_pvp = 'h_rank_pvp';
var z_rank_pvp_score = 'z_rank_pvp_score';
var z_rank_pvp_score_weekly = 'z_rank_pvp_score_weekly';
var z_rank_pvp_strength = 'z_rank_pvp_strength';
/**
 * add rank info at first enter pvp
 * @param device_guid
 * @param rank_info
 */
redis_rank_pvp_wrapper.set_rank_info = function(device_guid,rank_info){
    redis_pools.execute('pool_1',function(client, release) {
        client.hset(h_rank_pvp, device_guid, JSON.stringify(rank_info), function (err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            release();
        });
    });
};

/**
 * get rank info form redis
 * @param device_guid
 * @param cb
 */
redis_rank_pvp_wrapper.get_rank_info = function(device_guid,cb){
    redis_pools.execute('pool_1',function(client, release) {
        client.hget(h_rank_pvp, device_guid, function (err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

/**
 * get multi rank info form redis
 * @param device_guid1
 * @param device_guid2
 * @param device_guid3
 * @param cb
 */
redis_rank_pvp_wrapper.get_rank_info_multi = function(device_guid1,device_guid2,device_guid3,cb){
    redis_pools.execute('pool_1',function(client, release) {
        var args = [ z_rank_pvp_strength, device_guid1, device_guid2, device_guid3 ];
        client.hmget(args, function (err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

/**
 * update some about area,phone info for player
 * @param device_guid
 * @param area
 * @param phone
 * @param cb
 */
redis_rank_pvp_wrapper.update_rank_info = function(device_guid,area,phone_number){
    redis_rank_pvp_wrapper.get_rank_info(device_guid,function(rank_info){
        if(rank_info){
            rank_info = JSON.parse(rank_info);
            rank_info.area = area;
            rank_info.phone_number = phone_number;
            redis_rank_pvp_wrapper.set_rank_info(device_guid,rank_info);
        }
    });
};

/**
 * update score to rank/rank weekly
 * @param device_guid
 * @param championship_id : the week index
 * @param score : the latest score
 */
redis_rank_pvp_wrapper.update_score_rank = function(device_guid,championship_id,score){
    redis_pools.execute('pool_1',function(client, release) {
        client.zadd(z_rank_pvp_score, score,device_guid, function (err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            release();
        });
    });
    redis_pools.execute('pool_1',function(client, release) {
        client.zadd(z_rank_pvp_score_weekly + ":" + championship_id, score,device_guid, function (err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            release();
        });
    });
};

/**
 * get rank by score
 * @param device_guid
 * @param cb
 */
redis_rank_pvp_wrapper.get_score_rank = function(device_guid,cb){
    redis_pools.execute('pool_1',function(client, release) {
        client.rank(z_rank_pvp_score,device_guid, function (err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

/**
 * get rank by score weekly
 * @param device_guid
 * @param championship_id
 * @param cb
 */
redis_rank_pvp_wrapper.get_score_rank_weekly = function(device_guid,championship_id,cb){
    redis_pools.execute('pool_1',function(client, release) {
        client.rank(z_rank_pvp_score_weekly + ":" + championship_id,device_guid, function (err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

/**
 * update score to rank
 * @param device_guid
 * @param strength
 */
redis_rank_pvp_wrapper.update_strength_rank = function(device_guid,strength){
    redis_pools.execute('pool_1',function(client, release) {
        client.zadd(z_rank_pvp_strength, strength,device_guid, function (err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            release();
        });
    });
};

/**
 * get rank by strength
 * @param device_guid
 * @param cb
 */
redis_rank_pvp_wrapper.get_strength_rank = function(device_guid,cb){
    redis_pools.execute('pool_1',function(client, release) {
        client.rank(z_rank_pvp_strength,device_guid, function (err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};

redis_rank_pvp_wrapper.get_player_by_strength = function(min,max,count,cb){
    redis_pools.execute('pool_1',function(client, release) {
        //  offset form the first result
        var offset = 0;
        var args = [ z_rank_pvp_strength, min, max, 'LIMIT', offset, count ];
        client.zrangebyscore(args, function (err, reply) {
            if (err) {
                //  some thing log
                rank_for_pvp_logger.error(err);
            }
            cb(reply);
            release();
        });
    });
};