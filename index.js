const Discord = require('discord.js')
mysql = require('mysql')
credentials = require('./credentials.json')
const rp = require('request-promise')
port = process.env.PORT || 1337;
var async = require("async");
//const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor

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
			var abilityinfo = '';
			var abilities = '';
			var stats = '';
			pokemongeninfo(msg, pokemon, function(result){
				info = result;
				pokemonabilitiesinfo(msg, info, info.id, function(result){
					var abilityinfo = result
					geteachability(msg, info, abilityinfo, function(result){
						abilities = result
						//console.log(result)
						//sendpokemon(msg, info, result);
						pokemonstatinfo(msg, info, abilities, function(result){
							stats = result
							pokemontypeinfo(msg, info, abilities, stats, function(result){
								sendpokemon(msg, info, abilities, stats, result);
							})
						})
					})
					//result.forEach(function(item, index){
					//abilityarr[index] = getabilities(item.ability_id);
					//})
					//var abilities = processabilities(abilityarr)
					//console.log(abilities)
					//console.log(abilityarr);
					//console.log(abilityarr[0]);
					//console.log(abilityarr[1]);
					//sendpokemon(msg, info);
				})
			})
		}

		if (args[0] === "moves" && args[1]) {
			//msg.channel.send("http://play.pokemonshowdown.com/sprites/xyani/" + args[1] + ".gif")
			//check404(msg, args[1]);
			var pokemon = args[1];
			var x = 3;
			var info = '';
			var abilityinfo = '';
			pokemongeninfo(msg, pokemon, function(result){
				info = result;
				moves(msg, info, function(result){
					sendmoves(msg, info, result)
				})
			})
		}
		if (args[0] === "shiny" && args[1]){
			msg.channel.send("http://play.pokemonshowdown.com/sprites/xyani-shiny/" + args[1] + ".gif")
		}
	}
})

function moves(msg, info, callback) {
	var sql = 'SELECT distinct identifier from new_moves where pokemon_id = ?';
	connection.query(sql, info.id, function(err,rows,fields){
		var dbfarr = new Array(rows.length);
		// Loop over the response rows and put the information into an array of maps
		// We can then use this to create our buttons

		rows.forEach(function (item, index) {
			dbfarr[index] = {"identifier" : item.identifier};
	});
	//console.log(dbfarr[0])
	if(err){
		console.log("We have an error:");
		console.log(err);
	}
	return callback(dbfarr)
});
}

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
			"species_id" : item.species_id,
			"id" : item.id
		};
	});
	//console.log(dbfarr[0])
	if(err){
		console.log("We have an error:");
		console.log(err);
	}
	return callback(dbfarr[0])
});
}

function pokemonstatinfo(msg, info, abilities, callback){
	var sql = 'SELECT * FROM pokemon_stats where pokemon_id = ?';
	connection.query(sql, info.id,function(err,rows,fields){
		var dbfarr = new Array(rows.length);
		// Loop over the response rows and put the information into an array of maps
		// We can then use this to create our buttons

		rows.forEach(function (item, index) {
			dbfarr[index] = {"base_stat" : item.base_stat,
			"identifier" : item.identifier
		};
	});
	//console.log(dbfarr[0])
	if(err){
		console.log("We have an error:");
		console.log(err);
	}
	return callback(dbfarr)
});
}

function pokemontypeinfo(msg, info, abilities, stats, callback){
	var sql = 'SELECT * FROM pokemon_types where pokemon_id = ?';
	connection.query(sql, info.id,function(err,rows,fields){
		var dbfarr = new Array(rows.length);
		// Loop over the response rows and put the information into an array of maps
		// We can then use this to create our buttons

		rows.forEach(function (item, index) {
			dbfarr[index] = {"identifier" : item.type}
	});
	//console.log(dbfarr[0])
	if(err){
		console.log("We have an error:");
		console.log(err);
	}
	return callback(dbfarr)
});
}

function pokemonabilitiesinfo(msg, info, id, callback){
	var sql = 'SELECT * FROM pokemon_abilities where pokemon_id = ?';
	connection.query(sql, id,function(err,rows,fields){
		var dbfarr = new Array(rows.length);
		// Loop over the response rows and put the information into an array of maps
		// We can then use callbackthis to create our buttons

		rows.forEach(function (item, index) {
			dbfarr[index] = item.ability_id
		});
		//console.log(dbfarr)
		if(err){
			console.log("We have an error:");
			console.log(err);callback
		}
		return callback(dbfarr)
	});
}

function processabilities(abilityarr){
	var abilityout = ''
	abilityarr.forEach(function (item, index){
		abilityout = abilityout + item.identifier + "\n"
	})
	return abilityout;
}

/*function geteachability(msg, info, abilityarr, callback){
var abilities = new Array(callbackabilityarr.length)
var itemsProcessed = 0;
abilityarr.forEach((item, index) => {
AsyncFunction(item, index, () => {
abilities[index] = getabilities(item.ability_id);
itemsProcessed++;
if(itemsProcessed === abilityarr.length){return callback(abilities)}
})callback
})
}*/

function geteachability(msg, info, abilityarr, callback){
	var abilities = new Array(abilityarr.length)
	/*abilityarr.forEach(function(item, index){
	console.log(item.ability_id)
	/*getabilities(item.ability_id, index, function(result){
	//console.log("Hello")
	abilities[index] = result
	//console.log(index)
	//console.log(result)
	//console.log(abilities[index])
	console.log(abilities)
})
abilities[index] = getabilities(item.ability_id);
var i = getabilities(item.ability_id);
console.log(i)
console.log(getabilities(item.ability_id))
})
console.log(abilities)*/
getabilities(abilities, abilityarr, function(result){
	return callback(result);
})
}

function getabilities(abilities, id, callback){
	var sql = 'SELECT * FROM abilities where';
if(id.length = 3){
	var sql = 'SELECT * FROM abilities where id = ? or id = ? or id = ?';
} else if (id.length = 2){
var sql = 'SELECT * FROM abilities where id = ? or id = ?';
} else if (id.length = 1){
var sql = 'SELECT * FROM abilities where id = ?';
}

console.log(id)
//console.log(id)
connection.query(sql, id, function(err,rows,fields){
	//console.log(sql)
	var dbfarr = new Array(rows.length);
	// Loop over the response rows and put the information into an array of maps
	// We can then use this to create our buttons

	rows.forEach(function (item, index) {
		dbfarr[index] = {"identifier" : item.identifier};
	});
	//console.log(dbfarr)
	if(err){
		console.log("We have an error:");
		console.log(err);
	}
	console.log(dbfarr)
	return callback(dbfarr);
	//return dbfarr[0]
});
}

function sendpokemon(msg, pokemon, abilities, stats, types){
	console.log(pokemon)
	var embedmsg = new Discord.RichEmbed()
	.setTitle(pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1))
	.setImage("http://play.pokemonshowdown.com/sprites/xyani/" + pokemon.name + ".gif")
	.addField("Stats:", statsstr(stats), true)
	.addField("Abilities:", abilitiesstr(abilities), true)
	.addField("Types:", abilitiesstr(types), true)

	msg.channel.send(embedmsg)
}

function sendmoves(msg, pokemon, moves){
	console.log(pokemon)
	var movesmsg = abilitiesstr(moves)

	msg.channel.send(movesmsg)
}

function abilitiesstr(arr){
	var abilities = ''
	arr.forEach(function(item, index){
		abilities = abilities + item.identifier + '\n';
	})
	console.log(abilities)
	console.log(arr)
	return abilities;
}

function statsstr(arr){
	var stats = ''
	arr.forEach(function(item, index){
		stats = stats + item.identifier + ': ' + item.base_stat + "\n";
	})
	console.log(stats)
	console.log(arr)
	return stats;
}
