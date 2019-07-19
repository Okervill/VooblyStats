const Discord = require('discord.js')
var request = require("request");

var uid;
var rating;

const dclient = new Discord.Client()

const vtoken = process.env.vtoken
const dtoken = process.env.dtoken

dclient.on('ready', () => {
    console.log(`Logged in as ${dclient.user.tag}!`);
  });

dclient.on('message', message => {

    if(message.author.bot) return

    switch(message.content.split(' ')[0]){
        case '!rank':
            getRank(message)
            break
        case '!info':
            displayInfo(message)
            break
        default:
            break
    }
})

dclient.login(dtoken).catch(err => console.log(err))

function getUid(username) {
    // Setting URL and headers for request
    var options = {
        url: 'http://www.voobly.com/api/finduser/' + username + '?key=' + vtoken,
        headers: {
            'User-Agent': 'request'
        }
    };
    // Return new promise 
    return new Promise(function(resolve, reject) {
    	// Do async job
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                    resolve(body.split('\n')[1].split(',')[0]);
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
    return new Promise(function(resolve, reject) {
    	// Do async job
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
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
    return new Promise(function(resolve, reject) {
    	// Do async job
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        })
    })
}

function getUsername(uid){
    // Setting URL and headers for request
    var options = {
        url: 'https://www.voobly.com/api/ladder/131?key=' + vtoken +'&uid=' + uid,
        headers: {
            'User-Agent': 'request'
        }
    };
    // Return new promise 
    return new Promise(function(resolve, reject) {
    	// Do async job
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body.split(',')[8]);
            }
        })
    })
}

function getRank(message) {

    let args = message.content.split(' ')
    let output = ''
    let found = true
    let founduser = ''

    username = args[1].toLowerCase()

    var initializePromise = getUid(username);
    initializePromise.then(function(result) {

        uid = result;

        var initializePromise = getUsername(uid);
        initializePromise.then(function(result) {
            founduser = result.toLowerCase()
            if (username !== founduser){
                found = false
                message.channel.send('User not found')
            }
        }, function(err) {
            console.log(err);
        })

        if (!found) {
            exit
        }

        var initializePromise = getTGRating(uid);
        initializePromise.then(function(result) {
            if (username !== founduser){
                return
            }
            if(result == "") {
                message.channel.send(username + ' not found or no rated games have been played')
                return
            }
            rating = result.split('\n')[1].split(',')[3];
            output = username + ' Team Game Rating: ' + rating
        }, function(err) {
            console.log(err);
        })


        var initializePromise = get1v1Rating(uid);
        initializePromise.then(function(result) {
            if (username !== founduser){
                return
            }
            rating = result.split('\n')[1].split(',')[3];
            message.channel.send(output + '\n' + username + ' 1v1 Rating: ' + rating)
        }, function(err) {
            console.log(err);
        })



    }, function(err) {
        console.log(err);
    })


}

function displayInfo(message){
    output = 'Name: VooblyStats\n Owner: Okkervill\n Usage: !rank <username> gets 1v1 and TG ratings from voobly for a given user'
    message.channel.send(output)
}