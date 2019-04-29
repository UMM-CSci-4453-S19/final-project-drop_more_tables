const Discord = require('discord.js')
mysql = require('mysql')
credentials = require('./credentials.json')
const rp = require('request-promise')
port = process.env.PORT || 1337;

credentials.database = "create_tables"
credentials.host='ids.morris.umn.edu'; //setup database credentials

var connection = mysql.createConnection(credentials); // setup the connection

connection.connect(function(err){if(err){console.log(err)}});

const bot = new Discord.Client()
var prefix = "!pd"

bot.login(credentials.botid)

bot.on('ready', function () {
	console.log('The bot is online!')
	bot.user.setActivity(`playing pokemon in ${bot.guilds.size} servers`)
})

bot.on('message', function (msg) {
	if (msg.content.startsWith(prefix)) {
		msgcon = msg.content.toLowerCase()
		const args = msgcon.slice(prefix.length).trim().split(/ +/g)
		console.log(args)
		if (args[0] === "pokemon" && args[1]) {
			//msg.channel.send("http://play.pokemonshowdown.com/sprites/xyani/" + args[1] + ".gif")
      //check404(msg, args[1]);
			var pokemon = args[1];
			var x = 3;
			var info = '';
			pokemongeninfo(msg, pokemon, function(result){
				info = result;
				//msg.channel.send(result);
				sendpokemon(msg, info);
			})
		}
    if (args[0] === "shiny" && args[1]){
      msg.channel.send("http://play.pokemonshowdown.com/sprites/xyani-shiny/" + args[1] + ".gif")
    }
	}
})

function check404(msg, pokemon){
  const options = {
    uri: "http://play.pokemonshowdown.com/sprites/xyani/" + pokemon + ".gif"
  }

  rp(options)
    .then(($) => {
        msg.channel.send("http://play.pokemonshowdown.com/sprites/xyani/" + pokemon + ".gif")
    }).catch((err) => {
      msg.channel.send("Pokemon not found")
    })
}

function pokemongeninfo(msg, pokemon, callback){
	var sql = 'SELECT * FROM pokemon where stat_identifier = ?';
	connection.query(sql, pokemon,function(err,rows,fields){
		     var dbfarr = new Array(rows.length);
		     // Loop over the response rows and put the information into an array of maps
		     // We can then use this to create our buttons

		     rows.forEach(function (item, index) {
		       dbfarr[index] = {"name" : item.stat_identifier,
		       					"id" : item.species_id
		      				   };
		  });
			console.log(dbfarr[0])
		     if(err){
		       console.log("We have an error:");
		       console.log(err);
		     }
				 return callback(dbfarr[0])
		  });
}

function sendpokemon(msg, pokemon){
	console.log(pokemon)
	var embedmsg = new Discord.RichEmbed()
		.setTitle(pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1))
		.setImage("http://play.pokemonshowdown.com/sprites/xyani/" + pokemon.name + ".gif")

	msg.channel.send(embedmsg)
}