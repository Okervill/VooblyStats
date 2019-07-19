const Discord = require('discord.js')
const afterLoad = require('after-load')
const https = require('https');
const rp = require('request-promise')

const dclient = new Discord.Client()

const vtoken = 'y58rt04okmw2xjpvncpaoi2wp6jnnduj'
const dtoken = 'NjAxNTkxNTA1MTI3MzQyMDgx.XTEhxA.G03B5EXPajsxLAcn6eYDTkSikN0'

dclient.on('ready', () => {
    console.log(`Logged in as ${dclient.user.tag}!`);
  });

dclient.on('message', message => {

    if(message.author.bot || message.author.id != '113091864776675328') return

    switch(message.content.split(' ')[0]){
        case '!rank':
            handleGetRating(message)
            break
        default:
            break
    }
})

dclient.login(dtoken).catch(err => console.log(err))

function handleGetRating(message){
	args = message.content.split(' ')
    user = args[1]

    html = ''
    uid = ''
    userDetails = ''

    var html=afterLoad('http://www.voobly.com/api/finduser/' + user + '?key=' + vtoken)
    uid = html.split('\n')[1].split(',')[0]
    
    var html=afterLoad('https://www.voobly.com/api/ladder/10?key=' + vtoken + '&uid=' + uid)
    console.log(html)
    
}