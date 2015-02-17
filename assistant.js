var fs = require('fs');
var request = require("request");

var credentials = require('./credentials')
var client = require('twilio')(credentials.accountSid, credentials.authToken); 
var cookie = request.cookie(credentials.cookie);

var jar = request.jar();
var url = "http://triton.ironhelmet.com/grequest/order";
 
var playerNameMap = {
  0: "Blue",
  1: "Cyan",
  2: "Green",
  3: "Yellow",
  4: "Orange",
  5: "Red",
  6: "Pink",
  7: "Purple"
};

var playerSelf = 1;

fs.readFile('./orders/order.resp', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  var oldOrders = JSON.parse(data);

  jar.setCookie(cookie, url);
  request({
    url: "http://triton.ironhelmet.com/grequest/order",
    method: "POST",
    jar: jar,
    form: {
      type: "order",
      order: "full_universe_report",
      version: "7",
      game_number: credentials.game_number,
    }
  }, function(error, response, body) {
    var newOrders = JSON.parse(body);

    // checks if any ships are set to attack one of own stars
    // if so, send a text
    for(var index in newOrders.report.fleets) { 
      var fleet = newOrders.report.fleets[index]; 
      if (fleet.puid !== playerSelf) {
        var o = newOrders.report.fleets[index].o;
        if (o.length > 0){
          var pdestinationid = o[0][1];
          if (newOrders.report.stars[pdestinationid].puid === playerSelf) {
            message =
                newOrders.report.stars[pdestinationid].n +
                " is under attack by " +
                playerNameMap[fleet.puid] +
                " with " +
                fleet.st +
                " ships!";
            console.log(message);

            // costs money!
            //client.messages.create({
              //to: credentials.twilioTo, 
              //from: credentials.twilioFrom,
              //body: message,   
            //}, function(err, message) {
              //console.log(message.sid); 
            //});

          }
        }
      }
    }
    //fs.writeFile("./orders/order.resp", JSON.stringify(newOrders), function(err) {
      //if(err) {
        //console.log(err);
      //} else {
        //console.log("The file was saved!");
      //}
    //}); 
  });
});
