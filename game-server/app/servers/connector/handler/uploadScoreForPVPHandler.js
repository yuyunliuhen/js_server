/**
 * Created by King Lee on 2015/1/6.
 */
var handlerMgr = require("./../handlerMgr");
var consts = require("../../../util/consts");
var pomelo = require('pomelo');
var util = require('../../../util/util');
var rival_vs_title_json = require('../../../../config/rival_vs_title');

handlerMgr.handler(consts.TYPE_MSG.TYPE_UPLOAD_SCORE_FOR_PVP, function(msg, session, next) {
    var channel = msg.channel;
    var version = msg.version;
    var device_guid = msg.deviceid;
    var championship_id = util.getWeek(new Date());
    pomelo.app.get("rank_pvp_wrapper").get_rank_info(device_guid,function(rank_info){
        if(rank_info){
            rank_info = JSON.parse(rank_info);
        }
        //  calc score and money
        var my_rank = msg.my_rank;
        var rivals = msg.rivals;
        var score_add = 0;
        var money_add = 0;
        var buffer_data = 1;
        for(var v in rivals){
            if(rivals[v].rank > my_rank){
                score_add += Math.floor(rivals[v].strength/10);
                money_add += Math.floor(rivals[v].strength/3);
            }
        }
        rank_info.car = msg.car;
        rank_info.car_lv = msg.car_lv;
        rank_info.racer = msg.racer;
        rank_info.racer_lv = msg.racer_lv;
        rank_info.strength = msg.strength;

        //  score is provide by client, which is the final result(include all loser's score).
        rank_info.score += score_add;
        if(rank_info.championship_id == championship_id){
            rank_info.score_weekly += score_add;
        }
        else{
            rank_info.score_weekly = score_add;
        }
        //  calc degree
        var old_degree = rank_info.degree ? rank_info.degree : 1;
        var degree = old_degree;
        for(var v in rival_vs_title_json){
            if(rival_vs_title_json[v].score <= rank_info.score){
                degree = rival_vs_title_json[v].grade;
                rank_info.degree_title = rival_vs_title_json[v].title;
                rank_info.buff_data = rival_vs_title_json[v].buff_data;
                rank_info.buff_desc = rival_vs_title_json[v].buff_desc;
                buffer_data = rival_vs_title_json[v].buff_data;
            }
        }
        var degree_next = degree < rival_vs_title_json.length ? degree  + 1: rival_vs_title_json.length;
        rank_info.score_next = rival_vs_title_json[degree_next - 1].score;
        money_add = Math.floor(money_add * (buffer_data + 100)/100);
        rank_info.degree = degree;
        rank_info.total_race += 1;
        if("true" == msg.win_flag){
            rank_info.total_win += 1;
        }
        //  save it
        pomelo.app.get("rank_pvp_wrapper").set_rank_info(device_guid,rank_info);
        //  update score/score weekly rank
        pomelo.app.get("rank_pvp_wrapper").update_score_rank(device_guid,championship_id,rank_info);
        //  update strength rank
        pomelo.app.get("rank_pvp_wrapper").update_strength_rank(device_guid,rank_info.strength);
        next(null, {
            code: 0,
            msg_id : msg.msg_id,
            flowid : msg.flowid,
            time:Math.floor(Date.now()/1000),
            score:rank_info.score,
            money:money_add
        });
    });

});