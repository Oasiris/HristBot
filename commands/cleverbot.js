// MONTHLY query limit of 5000.

// Library dependencies
const request = require("request");
const fs = require("fs");
  const buf = new Buffer(1024);

// Get API key
const CLEVERBOT_API_KEY = require("./../auth").cleverbot_api_key;

// Imported local libraries
const sLib = require("./../lib/stringLib");

module.exports = {
  "chat": {
    description: "Chats with Cleverbot. Type `$chat NEW` to reset the conversation.",
    usage: "<input>",
    help: function(){},
    process: (bot, oMsg, args) => {
      // User didn't enter an actual message to send
      if (args.length == 0) {
        oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, please supply either a Dex number or a Pokemon name.`);
        return;
      }

      // Bot will print the contents of ./commands/log/cleverbot_log.txt.
      if (args[0] == "--log") {      
        let logBuffer = fs.readFileSync("./commands/log/cleverbot_log.txt");
        let logString = logBuffer.toString().trim();  
        oMsg.channel.sendMessage(`The contents of the log currently list: "${logString}".`);
        return;
      }

      // Resets chat conversation
      if (args[0] === "NEW" || args[0] === "-N") {
        fs.writeFile("./commands/log/cleverbot_log.txt", "", function(err) {
          if (err) return console.error(err);
          oMsg.channel.sendMessage(`Chat conversation reset!`);
          return;
        })
        return;
      }

      let input = encodeURIComponent(args.join(" "));

      // Grabs previous chat conversation ID from log/cleverbot_log.txt
      // Use synchronous read because file will be tiny.
      // Asynchronous version is commented out for now
      let logBuffer = fs.readFileSync("./commands/log/cleverbot_log.txt");
      let cs = logBuffer.toString().trim();
      queryChatbot(input, cs, function(err, botResponse) {
        oMsg.channel.sendMessage(botResponse);
      })
      // Sends the data off to the chatbot.

      // fs.open("./log/cleverbot_log.txt", "", function(err, fd) {
      //   if (err) return console.error(err);

      //   console.log("Opened cleverbot_log.txt successfully.");

      //   fs.read(fd, buf, 0, buf.length, 0, function(err, bytes) {
      //     if (err) return console.error(err);

      //     // If file is empty or something in Buffer went wrong
      //     if (bytes <= 0) return console.error("0 bytes - not reading file.");
      //     console.log(bytes + " bytes read");

      //     // If data exists, store it in variable cs. 
      //     let cs = buf.slice(0, bytes).toString().trim();
      //     // Now close the file. It's no longer needed.
      //     // TODO - CLOSE FILE

      //   })
      // })
    }
  }
};

var queryChatbot = (encodedInput, cs, callback) => {
  let url = 'https://www.cleverbot.com/getreply?key=' + CLEVERBOT_API_KEY;
  url += '&input=' + encodedInput;
  if (cs) url += '&cs=' + cs;

  var options = {
    url: url,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'NPM Request for Oasiris\'s Discord Bot HristBot'
    }
  };

  request.get(options, function(err, res, data) {
    if (err) {
      callback(err, null);
      return;
    } else if (res.statusCode != 200) {
      callback(res.statusCode, null);
      return;
    }

    // Meaning response was 200 -- success.
    let dataJSON = JSON.parse(data);
    let newCs = dataJSON.cs;
    let botResponse = dataJSON.output;

    // Write the new CS to cleverbot_log.txt.
    fs.writeFile("./commands/log/cleverbot_log.txt", newCs, function(err) {
      if (err) return console.error(err);
      else console.log("CS (cleverbot state) written successfully to cleverbot_log.txt.");
      
      callback(null, botResponse);
    })
  }) 
}

// queryChatbot(encodeURIComponent("hello"), null, function(){});