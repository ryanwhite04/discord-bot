const { token } = require('./config').bot;

// require the discord.js module
const Discord = require('discord.js');

// create a new Discord client
const client = new Discord.Client();

// login to Discord with your app's token
client.login(token);

module.exports = async () => new Promise((resolve, reject) => {
    // when the client is ready, run this code
    // this event will trigger whenever your bot:
    // - finishes logging in
    // - reconnects after disconnecting
    client.on('ready', () => {
       resolve(client);
    });
    client.on('error', error => {
        reject(error);
    })
})