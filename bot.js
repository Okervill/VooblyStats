const csv = require('csv-string')
const Discord = require('discord.js')
const request = require('request')

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
            if(message.content.split(' ').length == 2){
                getInfo(message)
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

function getInfo(message){

    user = message.content.split(' ')[1]

    var uid;
    var rating1v1;
    var ratingTG;

    var initializePromiseUID = getUid(user)
    initializePromiseUID.then(function(result) {
        uid = result
    })
    .then(function(result){
        var initializePromise1v1 = get1v1Rating(uid)
        initializePromise1v1.then(function(result) {
            rating1v1 = result
            message.channel.send(user + ' 1v1: ' + rating1v1)
        })
        .catch(function(error){
            message.channel.send(error)
            console.log(error)
            return
        })
    })
    .then(function(result){
        var initializePromiseTG = getTGRating(uid)
        initializePromiseTG.then(function(result) {
            ratingTG = result
            message.channel.send(user + ' TG: ' + ratingTG)
        })
        .catch(function(error){
            message.channel.send(error)
            console.log(error)
            return
        })
    })
    .catch(function(error){
        message.channel.send(error)
        console.log(error)
        return
    })
}

function getUid(user){
    // Setting URL and headers for request
    var options = {
        url: 'https://www.voobly.com/api/finduser/' + user + '?key=' + vtoken,
        headers: {
            'User-Agent': 'request'
        }
    };
    // Return new promise 
    return new Promise(function(resolve, reject) {
    	// Do async job
        request.get(options, function(err, resp, body) {
            data = csv.parse(body)
            if(data.length !== 2 || data[1][0] == '' || data[1][1] == ''){
                reject('Player not found or has no ranked games')
            } else {
                for(i = 0; i< data[0].length; i++){
                    if(data[0][i] === 'uid'){
                        uid = data[1][i]
                        resolve(uid);
                    }
                }
            }
        })
    })
}

function get1v1Rating(uid){
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
            data = csv.parse(body)
            for(i = 0; i< data[0].length; i++){
                if(data[0][i] === 'rating'){
                    rating = data[1][i]
                    resolve(rating);
                }
            }
            reject(err);
        })
    })
}

function getTGRating(uid){
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
            data = csv.parse(body)
            for(i = 0; i< data[0].length; i++){
                if(data[0][i] === 'rating'){
                    rating = data[1][i]
                    resolve(rating);
                }
            }
            reject(err);
        })
    })
}

function buildOutput(user, rating1v1, ratingTG){
    output = 'User: ' + user + '\n1v1: ' + rating1v1 + '\nTG: ' + ratingTG
    console.log(output)
}

function displayInfo(message){
    output = 'Name: VooblyStats\n Owner: Okkervill\n Usage: !rank <username> gets 1v1 and TG ratings from voobly for a given user'
    message.channel.send(output)
}