/**
 * Created by aleksa on 1/27/16.
 */

//forever start  -o out.log -e err.log app.js

var email_alert=require('./EmailAlert.js');

var schedule = require('node-schedule');

var j = schedule.scheduleJob('0 * * * * 5', function(){
    new email_alert();

});










