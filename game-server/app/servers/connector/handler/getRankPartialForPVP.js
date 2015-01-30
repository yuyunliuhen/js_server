/**
 * Created by King Lee on 2015/1/8.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var util = require('../../../util/util');
var async = require('async');

handlerMgr.handler(consts.TYPE_MSG.TYPE_GET_RANK_PARTIAL_FOR_PVP, function (msg, session, next) {
    var device_guid = msg.deviceid;
    var championship_id = util.getWeek(new Date());
    var rank_pvp_wrapper = pomelo.app.get("rank_pvp_wrapper");
    async.parallel([
            function (callback) {
                rank_pvp_wrapper.get_score_rank_partial_weekly(championship_id, function (reply) {
                    //  reply is rank as a json array
                    if(0 != reply.length){
                        rank_pvp_wrapper.get_rank_info_batch(reply, function (reply) {
                            callback(null, reply);
                        });
                    }else{
                        callback(null, []);
                    }
                });
            },
            function (callback) {
                rank_pvp_wrapper.get_score_rank_partial(function (reply) {
                    //  reply is rank as a json array
                    if(0 != reply.length){
                        rank_pvp_wrapper.get_rank_info_batch(reply, function (reply) {
                            callback(null, reply);
                        });
                    }else{
                        callback(null, []);
                    }
                });
            },
            function (callback) {
                rank_pvp_wrapper.get_score_rank_weekly(device_guid,championship_id,function (reply) {
                    callback(null,reply);
                });
            },
            function (callback) {
                rank_pvp_wrapper.get_score_rank(device_guid,function (reply) {
                    callback(null,reply);
                });
            }
        ],
        // optional callback
        function (err,result) {
            if (err) {
                console.error(err);
            }
            var rank_info_array = result[0];
            var rank_info_array_weekly = result[1];
            var mine_score_rank = result[2];
            var mine_score_rank_weekly = result[3];
            var score_rank_array = [];
            var score_rank_array_weekly = [];
            for(var i = 0; i < rank_info_array.length; ++i){
                if(rank_info_array[i])
                {
                    var rank_info = JSON.parse(rank_info_array[i]);
                    score_rank_array.push({driver_id:rank_info.racer,
                        nickname:rank_info.nickname,
                        degree_title:rank_info.degree_title,
                        area:rank_info.area,
                        rank:i + 1,
                        score:rank_info.score})
                }
            }
            for(var i = 0; i < rank_info_array_weekly.length; ++i){
                if(rank_info_array_weekly[i])
                {
                    var rank_info = JSON.parse(rank_info_array_weekly[i]);
                    score_rank_array_weekly.push({driver_id:rank_info.racer,
                        nickname:rank_info.nickname,
                        degree_title:rank_info.degree_title,
                        area:rank_info.area,
                        rank:i + 1,
                        score:rank_info.score})
                }
            }
            next(null, {
                code: 0,
                msg_id : msg.msg_id,
                flowid : msg.flowid,
                time:Math.floor(Date.now()/1000),
                score_rank_array:score_rank_array,
                score_rank_array_weekly:score_rank_array_weekly,
                mine_score_rank:mine_score_rank != null ? parseInt(mine_score_rank) + 1: mine_score_rank,
                mine_score_rank_weekly:mine_score_rank_weekly != null ? parseInt(mine_score_rank_weekly) + 1: mine_score_rank_weekly
            });
        }
    );
});