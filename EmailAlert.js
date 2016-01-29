/**
 * Created by aleksa on 1/27/16.
 */

var mysql=require('mysql'),
    nodemailer = require('nodemailer'),
    fs = require('fs'),
    connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'pass',
    database : 'drkaskescraper'
});




var smtpTransport = require("nodemailer-smtp-transport")


var smtpTransport = nodemailer.createTransport(smtpTransport({
    //  host : "1und1",
  //  secureConnection : false,
  //  port: 587,
  service: '1und1',
    auth: {
        user: "",
        pass: ""
    }
}));


function EmailAlert(){
    connection.connect();
    var that=this;
this.get_email_alert_table_data(function(data){
    var i=0;

    (function loop(index){
        if(typeof data[index]=='undefined'){
            connection.close();
            console.log("end:"+new Date());
            return false;

        }
        that.get_lowest_price(data[index].pzn,data[index].price,data[index].user_email,function(price,user_price,domain_id,pzn,email){
            console.log(price);
            console.log(user_price);
            console.log('domain id: '+domain_id)
            if(price<user_price){
                console.log('price is lower , send email!')
                that.send_email(pzn,price,domain_id,email);


            }else{
                console.log("don't send email, price is higher")
            }
        })
        setTimeout(function(){
            loop(++index);
        },3000)



    })(i)



  //  for(var i= 0,l=data.length;i<l;i++){

   // }


})
}
EmailAlert.prototype.get_email_alert_table_data=function(callback){


    connection.query('SELECT * from email_alerts', function(err, rows, fields) {
        if (err) throw err;
        callback(rows);
    });

}

EmailAlert.prototype.send_email=function(pzn,price,domain_id,email){
var that=this;

    //fs.readFile('EmailTemplates/alert.html', 'utf8', function (err,html) {
      //  if (err)throw err;
        that.get_domain_name(domain_id,function(domain_name){
            that.get_product_title(pzn,function(product_name){
                var html="<h3>Hallo,</h3>  <p>der Preis des Produkts <b>"+product_name+"</b> mit der PZN <b>"+pzn+"</b> ist aktuell bei <b>€"+price+"</b> " +
                    "in der Versandapotheke <b>"+domain_name+"</b>.</p><br>Beste Grüße,<br> Das Dr. Kaske VA-Monitor Team";


                var mailOptions={
                    from : "monitor@drkaske.de",
                    to : email,
                    subject : "VA-Monitor: Preisalarm für PZN "+pzn,
                    text : "",
                    html : html,

                }
              //  console.log(mailOptions);
                smtpTransport.sendMail(mailOptions, function(error, response){
                    if(error){
                        console.log(error);

                    }else{
                     //   console.log(response.response.toString());


                    }
                });


            })
        })








 //   });




    /*

*/

}



EmailAlert.prototype.get_lowest_price=function(pzn,user_price,email,callback){
    connection.query(' SELECT MIN(price) as price,domain FROM crawler_data where pzn="'+pzn+'"', function(err, rows, fields) {
        if (err) throw err;
       // console.log(rows);
        callback(rows[0].price,user_price,rows[0].domain,pzn,email);
    });



}

EmailAlert.prototype.get_product_title=function(pzn,callback){
    connection.query('Select product_name from products_new where pzn=? or zero_pzn=? ',[pzn,pzn], function(err, rows, fields) {
        if (err) throw err;
        // console.log(rows);
        callback(rows[0].product_name);
    });



}

EmailAlert.prototype.get_domain_name=function(domain_id,callback){
    connection.query('Select name from domains where id='+domain_id, function(err, rows, fields) {
        if (err) throw err;
        // console.log(rows);
        callback(rows[0].name);
    });



}

module.exports=EmailAlert;
