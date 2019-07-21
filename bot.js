const csv = require('csv-string')
const Discord = require('discord.js')
const request = require('request')

const dclient = new Discord.Client()

const vtoken = 'y58rt04okmw2xjpvncpaoi2wp6jnnduj'
const dtoken = 'NjAxNTkxNTA1MTI3MzQyMDgx.XTEhxA.G03B5EXPajsxLAcn6eYDTkSikN0'
const stoken = '52154F819CCC15824124A611C5970721'

dclient.on('ready', () => {
    console.log(`Logged in as ${dclient.user.tag}!`);
});

dclient.on('message', message => {

    if (message.author.bot) return

    switch (message.content.split(' ')[0]) {
        case '!rank':
            if (message.content.split(' ').length == 2) {
                getInfo(message)
            } else if (message.content.split(' ').length > 2) {
                message.reply('Invalid Syntax, correct usage: !rank <user>')
            }
            break
        case '!comp':
            if (message.content.split(' ').length == 3) {
                comparePlayers(message)
            } else if (message.content.split(' ').length !== 3) {
                message.reply('Invalid Syntax, correct usage: !comp <user1> <user2>')
            }
            break
        case '!info':
            displayInfo(message)
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
    output = player1 + '  |  ' + player2 + '\n1v1: ' + rating1v11 + '  |  ' + rating1v12 + '\nTG: ' + ratingTG1 + '  |  ' + ratingTG2
    console.log(output)
    return output
}

function getInfo(message) {

    user = message.content.split(' ')[1]

    var uid;
    var rating1v1;
    var ratingTG;

    var steamid;
    var rmgames;
    var dmgames;
    var rmrating;
    var dmrating;
    var steamoutput;

    var initializePromiseUID = getUid(user)
    initializePromiseUID.then(function (result) {
        uid = result
    })
        .then(function (result) {
            var initializePromise1v1 = get1v1Rating(uid)
            return initializePromise1v1.then(function (result) {
                console.log(result)
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
                console.log(result)
                ratingTG = result
            })
                .catch(function (error) {
                    message.channel.send(error)
                    console.log(error)
                    return
                })
        })
        .then(function (result) {
            var initializePromiseSteam = userExistsSteam(user)
            return initializePromiseSteam.then(function (result) {
                steamid = result
            })
                .catch(function (error) {
                    message.channel.send(error)
                    console.log(error)
                    return
                })
        })
        .then(function (result) {
            var initializePromiseSteamStats = getHDStats(steamid)
            return initializePromiseSteamStats.then(function (result) {
                dmrating = result[0]
                rmrating = result[1]
                dmgames = result[2]
                rmgames = result[3]
                steamoutput = user + '\n' + 'RM: ' + rmrating + ' (' + rmgames + ')' + '\nDM: ' + dmrating + ' (' + dmgames + ')'
            })
        })
        .then(() => {
            message.channel.send(buildOutput(user, rating1v1, ratingTG))
            message.channel.send(steamoutput)
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

function userExistsSteam(username) {
    var options = {
        url: 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=52154F819CCC15824124A611C5970721&vanityurl=' + username,
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
        url: 'http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=221380&key=52154F819CCC15824124A611C5970721&steamid=' + steamid + '&format=json',
        headers: {
            'User-Agent': 'request'
        }
    }
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get(options, function (err, resp, body) {
            if (body.includes('Internal Server Error')) {
                reject('No steam information')
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

function buildOutput(user, rating1v1, ratingTG) {
    output = user + '\n' + '1v1: ' + rating1v1 + '\n' + 'TG: ' + ratingTG
    console.log(output)
    return output
}

function displayInfo(message) {
    output = 'Name: VooblyStats\nOwner: Okkervill\nUsage:\n   !rank <username> gets 1v1 and TG ratings for a given user\n   !comp <user1> <user2> compare ratings of two given players'
    message.channel.send(output)
}