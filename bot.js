const csv = require('csv-string')
const Discord = require('discord.js')
const request = require('request')

const dclient = new Discord.Client()

const vtoken = process.env.vtoken
const dtoken = process.env.dtoken
const stoken = process.env.stoken

dclient.on('ready', () => {
    console.log(`Logged in as ${dclient.user.tag}!`);
});

dclient.on('message', message => {

    if (message.author.bot) return

    switch (message.content.split(' ')[0]) {
        case '!voobly':
            if (message.content.split(' ').length == 2) {
                getVooblyInfo(message)
            } else if (message.content.split(' ').length > 2) {
                message.reply('Invalid Syntax, correct usage: !voobly <user>')
            }
            break
        case '!steam':
            if (message.content.split(' ').length == 2) {
                getSteamInfo(message)
            } else if (message.content.split(' ').length > 2) {
                message.reply('Invalid Syntax, correct usage: !steam <user>')
            }
            break
        case '!steamid':
            if (message.content.split(' ').length == 2) {
                getSteamInfoID(message)
            } else if (message.content.split(' ').length > 2) {
                message.reply('Invalid Syntax, correct usage: !steamid <user>')
            }
            break
        case '!online':
            if (message.content.split(' ').length == 1) {
                getOnlinePlayers(message)
            } else if (message.content.split(' ').length !== 1) {
                message.reply('Invalid Syntax, correct usage: !online')
            }
            break
        case '!compare':
            if (message.content.split(' ').length == 3) {
                comparePlayers(message)
            } else if (message.content.split(' ').length !== 3) {
                message.reply('Invalid Syntax, correct usage: !compare <user1> <user2>')
            }
            break
        case '!info':
            displayInfo(message)
            break
        case '!help':
            displayHelp(message)
            break
        default:
            break
    }
})

dclient.login(dtoken).catch(err => console.log(err))

function comparePlayers(message) {

    args = message.content.split(' ')
    player1 = args[1]
    player2 = args[2]

    var uid1;
    var uid2;

    var rating1v11;
    var rating1v12;

    var ratingTG1;
    var ratingTG2;

    var initializePromiseUID1 = getUid(player1)
    initializePromiseUID1.then(function (result) {
        uid1 = result
    })
        .then(function (result) {
            var initializePromiseUID2 = getUid(player2)
            return initializePromiseUID2.then(function (result) {
                uid2 = result
            })
        })
        .then(function (result) {
            var initializePromise1v11 = get1v1Rating(uid1)
            return initializePromise1v11.then(function (result) {
                rating1v11 = result
            })
                .catch(function (error) {
                    message.channel.send(error)
                    console.log(error)
                    return
                })
        })
        .then(function (result) {
            var initializePromise1v12 = get1v1Rating(uid2)
            return initializePromise1v12.then(function (result) {
                rating1v12 = result
            })
                .catch(function (error) {
                    message.channel.send(error)
                    console.log(error)
                    return
                })
        })
        .then(function (result) {
            var initializePromiseTG1 = getTGRating(uid1)
            return initializePromiseTG1.then(function (result) {
                ratingTG1 = result
            })
                .catch(function (error) {
                    message.channel.send(error)
                    console.log(error)
                    return
                })
        })
        .then(function (result) {
            var initializePromiseTG2 = getTGRating(uid2)
            return initializePromiseTG2.then(function (result) {
                ratingTG2 = result
            })
                .catch(function (error) {
                    message.channel.send(error)
                    console.log(error)
                    return
                })
        })
        .then(() => {
            message.channel.send(buildCompareOutput(rating1v11, rating1v12, ratingTG1, ratingTG2))
            return Promise.resolve()
        })
        .catch(function (error) {
            message.channel.send(error)
            console.log(error)
            return
        })
}

function buildCompareOutput(rating1v11, rating1v12, ratingTG1, ratingTG2) {
    const compareOutput = new Discord.RichEmbed()
        .setColor('#0099ff')
        .setTitle('AoE Ratings: ' + player1 + ' | ' + player2)
        .addField('1v1 Ratings', rating1v11 + ' | ' + rating1v12, false)
        .addField('Team Game Rating', ratingTG1 + ' | ' + ratingTG2, false)
        .setTimestamp()
    return compareOutput
}

function getVooblyInfo(message) {

    user = message.content.split(' ')[1]

    var uid;
    var rating1v1;
    var ratingTG;

    var initializePromiseUID = getUid(user)
    initializePromiseUID.then(function (result) {
        uid = result
    })
        .then(function (result) {
            var initializePromise1v1 = get1v1Rating(uid)
            return initializePromise1v1.then(function (result) {
                rating1v1 = result
            })
                .catch(function (error) {
                    message.channel.send(error)
                    console.log(error)
                    return
                })
        })
        .then(function (result) {
            var initializePromiseTG = getTGRating(uid)
            return initializePromiseTG.then(function (result) {
                ratingTG = result
            })
                .catch(function (error) {
                    message.channel.send(error)
                    console.log(error)
                    return
                })
        })
        .then(() => {
            message.channel.send(buildOutput(user, rating1v1, ratingTG))
            return Promise.resolve()
        })
        .catch(function (error) {
            message.channel.send(error)
            console.log(error)
            return
        })
}

function getUid(user) {
    // Setting URL and headers for request
    var options = {
        url: 'https://www.voobly.com/api/finduser/' + user + '?key=' + vtoken,
        headers: {
            'User-Agent': 'request'
        }
    };
    // Return new promise 
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get(options, function (err, resp, body) {
            data = csv.parse(body)
            if (data.length !== 2 || data[1][0] == '' || data[1][1] == '') {
                reject('Player ' + user + ' not found')
            } else {
                for (i = 0; i < data[0].length; i++) {
                    if (data[0][i] === 'uid') {
                        uid = data[1][i]
                        resolve(uid);
                    }
                }
            }
        })
    })
}

function get1v1Rating(uid) {
    // Setting URL and headers for request
    var options = {
        url: 'https://www.voobly.com/api/ladder/131?key=' + vtoken + '&uid=' + uid,
        headers: {
            'User-Agent': 'request'
        }
    };
    // Return new promise 
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get(options, function (err, resp, body) {
            if (body == '' || body == null) {
                reject('No ranked 1v1 games found')
            }
            data = csv.parse(body)
            for (i = 0; i < data[0].length; i++) {
                if (data[0][i] === 'rating') {
                    output = data[1][i] + ' (' + (parseInt(data[1][i + 1]) + parseInt(data[1][i + 2])) + ')'
                    resolve(output);
                }
            }
            reject(err);
        })
    })
}

function getTGRating(uid) {
    // Setting URL and headers for request
    var options = {
        url: 'https://www.voobly.com/api/ladder/132?key=' + vtoken + '&uid=' + uid,
        headers: {
            'User-Agent': 'request'
        }
    };
    // Return new promise 
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get(options, function (err, resp, body) {
            if (body == '' || body == null) {
                reject('No ranked team games found')
            }
            data = csv.parse(body)
            for (i = 0; i < data[0].length; i++) {
                if (data[0][i] === 'rating') {
                    output = data[1][i] + ' (' + (parseInt(data[1][i + 1]) + parseInt(data[1][i + 2])) + ')'
                    resolve(output);
                }
            }
            reject(err);
        })
    })
}

function getSteamInfo(message) {

    var steamid;
    var rmgames;
    var dmgames;
    var rmrating;
    var dmrating;

    user = message.content.split(' ')[1]

    var initializePromiseSteam = userExistsSteam(user)
    initializePromiseSteam.then(function (result) {
        steamid = result
    })
        .then(function (result) {
            var initializePromiseSteamStats = getHDStats(steamid)
            return initializePromiseSteamStats.then(function (result) {
                console.log(result)
                dmrating = result[0]
                rmrating = result[1]
                dmgames = result[2]
                rmgames = result[3]
            })
        })
        .then(() => {
            const steamoutput = new Discord.RichEmbed()
                .setColor('#0099ff')
                .setTitle('AoE Ratings: ' + user)
                .addField('RM Rating', rmrating + '(' + rmgames + ')', true)
                .addField('DM Rating', dmrating + '(' + dmgames + ')', true)
                .setTimestamp()
            message.channel.send(steamoutput)
            console.log(steamoutput)
        })
        .catch(function (error) {
            message.channel.send(error)
            console.log(error)
            return
        })
}
function getSteamInfoID(message) {
    var rmgames;
    var dmgames;
    var rmrating;
    var dmrating;

    steamid = message.content.split(' ')[1]

    var initializePromiseSteam = userExistsSteamID(steamid)
    initializePromiseSteam.then(function (result) {
        user = result
        console.log(user)
    })
        .then(function (result) {
            var initializePromiseSteamStats = getHDStats(steamid)
            return initializePromiseSteamStats.then(function (result) {
                if (result.length < 3) {
                    console.log('No steam information found')
                    return
                }

                dmrating = result[0]
                rmrating = result[1]
                dmgames = result[2]
                rmgames = result[3]


            })
        })
        .then(() => {
            const steamoutputid = new Discord.RichEmbed()
                .setColor('#0099ff')
                .setTitle('AoE Ratings: ' + user)
                .addField('RM Rating', rmrating + '(' + rmgames + ')', true)
                .addField('DM Rating', dmrating + '(' + dmgames + ')', true)
                .setTimestamp()
            message.channel.send(steamoutputid)
            console.log(steamoutput)
            return Promise.resolve()
        })
        .catch(function (error) {
            message.channel.send(error)
            console.log(error)
            return
        })
}

function userExistsSteamID(id) {
    var options = {
        url: 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=' + stoken + '&format=json&steamids=' + id,
        headers: {
            'User-Agent': 'request'
        }
    }
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get(options, function (err, resp, body) {
            data = JSON.parse(body)
            if (data.response.length < 5) {
                console.log('Unable to locate player on steam')
                reject('Unable to locate player on steam')
                return
            }
            resolve(data.response.players[0].personaname)
        })
    })
}

function userExistsSteam(username) {
    var options = {
        url: 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + stoken + '&vanityurl=' + username,
        headers: {
            'User-Agent': 'request'
        }
    }
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get(options, function (err, resp, body) {
            data = JSON.parse(body)
            if (data.response.success !== 1) {
                console.log('Unable to locate players vanity url on steam')
                reject('Unable to locate players vanity url on steam')
                return
            }
            resolve(data.response.steamid)
        })
    })
}

function getHDStats(steamid) {
    var output = [];
    var options = {
        url: 'http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=221380&key=' + stoken + '&steamid=' + steamid + '&format=json',
        headers: {
            'User-Agent': 'request'
        }
    }
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get(options, function (err, resp, body) {
            if (body.includes('Internal Server Error') || body == '{}') {
                reject('No steam information found')
                return
            }
            data = JSON.parse(body)
            playerStats = data.playerstats.stats
            for (i = 0; i < playerStats.length; i++) {
                if (playerStats[i].name === 'STAT_ELO_RM_BEGIN') {
                    output.push(playerStats[i].value)
                }
                if (playerStats[i].name === 'STAT_ELO_DM_BEGIN') {
                    output.push(playerStats[i].value)
                }
                if (playerStats[i].name === 'STAT_ELO_RM') {
                    output.push(playerStats[i].value)
                }
                if (playerStats[i].name === 'STAT_ELO_DM') {
                    output.push(playerStats[i].value)
                }
            }
            resolve(output)
        })
    })
}

function getOnlinePlayers(message) {
    var getTeam = getTeamDetails()
    var peoples = '';
    getTeam.then(function (result) {
        if (result.length === 0) {
            message.channel.send('No online players')
            return
        }
        const onlinePlayers = new Discord.RichEmbed()
            .setColor('#0099ff')
        for (i = 0; i < result.length; i++) {
            if (i < result.length - 1) {
                peoples += result[i] + ', '
            } else {
                peoples += result[i]
            }
        }
        onlinePlayers.addField('Online players', peoples, true)
        onlinePlayers.setTimestamp()
        message.channel.send(onlinePlayers)
    })
}

function getTeamDetails() {
    // Setting URL and headers for request

    onlineUsers = []

    var options = {
        url: 'https://anvil.voobly.com',
        headers: {
            'User-Agent': 'request'
        }
    };
    // Return new promise 
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get(options, function (err, resp, body) {
            if (err) {
                console.log(err)
                return
            }
            body = body.split('<a href="https://voobly.com/profile/view/')
            body.shift()
            body.shift()
            body.shift()
            for (i = 0; i < body.length; i++) {
                username = body[i].split('\n')[0].substring(body[i].split('\n')[0].indexOf('>') + 1, body[i].split('\n')[0].indexOf('<'))
                if (body[i].split('\n')[3].includes('Online now')) {
                    online = true
                    onlineUsers.push(username)
                }
            }
            resolve(onlineUsers)
        })
    })
}

function buildOutput(user, rating1v1, ratingTG) {
    const embedOutput = new Discord.RichEmbed()
        .setColor('#0099ff')
        .setTitle('AoE Ratings: ' + user)
        .addField('1v1 Rating', rating1v1, true)
        .addField('Team Game Rating', ratingTG, true)
        .setTimestamp()
    return embedOutput
}

function displayInfo(message) {
    const infoEmbed = new Discord.RichEmbed()
        .setColor('#0099ff')
        .setTitle('AoE Info Bot')
        .setDescription('This bot accesses both Voobly and Steam to get ratings for a given user. Type !help for a list of commands')
        .setTimestamp()
        .setFooter('Created by Okkervill');
    message.channel.send(infoEmbed)
}

function displayHelp(message) {
    const infoEmbed = new Discord.RichEmbed()
        .setColor('#0099ff')
        .setTitle('AoE Info Bot')
        .setDescription('This bot accesses both Voobly and Steam to get ratings for a given user')
        .addField('!voobly <username>', 'This will get the Voobly 1v1 and Team Game ratings for a given user', true)
        .addField('!compare <username> <username>', 'This will compare the Voobly 1v1 and Team Game ratings for two given users', true)
        .addField('!steam <username>', 'This will get the Steam RM and DM ratings for a given steam user', true)
        .addField('!steamid <username>', 'This will get the Steam RM and DM ratings for a given steam user id', true)
        .addField('!online', 'This will get all the players in the Anvil clan currently online on Voobly', true)
        .addBlankField()
        .addField('Steam Requirement', 'To get any information from steam users need to have your Profile and Game Details set to public\nProfile > Edit Profile > My Privacy Settings > "My Profile: Public" > "Game Details: Public"', true)
        .setTimestamp()
        .setFooter('Created by Okkervill');
    message.author.send(infoEmbed)

}