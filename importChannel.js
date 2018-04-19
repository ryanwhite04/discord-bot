
const fs = require('fs');
const names = require('./slack/usernames');
const sequential = require('promise-sequential');

require('./client')
    .then(client => require('./slack/current')
        .slice(0, 2)
        .map(createChannel(client.guilds.array()[0]))
    )
    .catch(console.log)


function createChannel(guild) {
    console.log('createChannel', guild.name)
    return ({ name, topic, purpose }) => {
        return guild.createChannel(name, 'text', [], 'Imported from Slack')
            .then(channel => channel.setTopic(`${topic}\n\n${purpose}`))
            .then(sendMessages)
            .catch(console.log)
    }
}

function sendMessages(channel) {
    console.log('sendMessages', channel.name)
    return getMessages(channel)
        .then(console.log)
        .catch(console.log)
}

function getMessages(channel) {
    const name = channel.name;
    console.log('getMessages', name);
    return new Promise((resolve, reject) => {
        fs.readdir(`./slack/${name}`, (err, days) => {
            err && reject(err);
            
            const promises = days.sort()
                .map(date => ({
                    date: new Date(date.split('.')[0]).toDateString(),
                    messages: require(`./slack/${channel.name}/${date}`)
                }))
                .map(({ date, messages }) => {
                    return () => {
                        return channel.send(`__Importing ${messages.length} Slack Messages from ${date}__`)
                            .then(() => {
                                return Promise.all(messages
                                    .filter(({ type, subtype }) => type)
                                    .map(post(channel)))
                            })
                            .then(messages => {
                                console.log(`Finished Importing ${messages.length} Slack Messages form ${date}`);
                                return channel.send(`__Finished Importing ${messages.length} Slack Messages from ${date}__`)
                            })
                    }
                    
                })
            
            return sequential(promises);
            
        })
    })
}

function post(channel) {
    return ({ user, text, subtype }) => {
        text = text.replace(/<@([^>]+)>/g, (str, p1, offset, s) => `@**${names[p1]}**`)
        channel.send(subtype ? `**${names[user]}**, *${subtype}*: ${text}`: `**${names[user]}**: ${text}`)
    }
}
