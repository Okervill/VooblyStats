const Discord = require('discord.js')
const afterLoad = require('after-load')

const dclient = new Discord.Client()
const vtoken = process.env.vtoken
const dtoken = process.env.dtoken



dclient.on('ready', () => {
    console.log(`Logged in as ${dclient.user.tag}!`);
  });

dclient.on('message', message => {

    if(message.author.bot || message.author.id != '113091864776675328') return

    switch(message.content.split(' ')[0]){
        case '!rank':
            handleStats(message)
            break
        default:
            break
    }
})

dclient.login(dtoken).catch(err => console.log(err))

function handleStats(message){
	args = message.content.split(' ')
    user = args[1]

    var html = afterLoad('https://https://www.voobly.com/api/ladder/10?key=' + process.env.vtoken)
    console.log(html)

}