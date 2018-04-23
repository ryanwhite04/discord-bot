
const fs = require('fs');
const path = require('path');
const { guild: id } = require('./config');

const names = require(`./${process.argv[2]}/users`).reduce((names, { id, profile: { real_name } }) => {
    names[id] = real_name;
    return names;
}, {});

const sequential = require('promise-sequential');
const clientPromise = require('./client');

module.exports = async ({ name, topic, purpose }) => {
    const { guilds } = await clientPromise.catch(console.error)
    const [ guild ] = guilds.array() // The only guild is the ACYA guild/server
    channel = await createChannel(guild, { name, topic, purpose })
    return await sendChannelMessages(channel).catch(console.error)
}

/**
 * Create a channel in Discord using details from slack
 * @param {Object} guild - The guild/server to create the channel within
 * @param {} slackChannel - The name, topic and purpose of the slack channel to import  
 */
async function createChannel(guild, { name, topic, purpose }) {
    console.log('createChannel in Guild: ', guild.name);
    const channel = await guild.createChannel(name, 'text', [], 'Imported from Slack').catch(console.error)
    await channel.setTopic(`${topic}\n\n${purpose}`).catch(console.error)
    return channel;
}

async function sendChannelMessages(channel) {

    const { name } = channel;
    const days = await readdirAsync(`./slack/${name}`).catch(console.error);
    console.log('sendMessages in Channel: ', name);

    return await sequential(days
        .sort()
        .map(date => ({
            date: new Date(date.split('.')[0]).toDateString(),
            messages: require(`./slack/${name}/${date}`)
        }))
        .map(object => () => sendDaysMessages(object)))
}

async function sendDaysMessages({ date, messages }) {

    function format({ user, text }) {
        return `**${names[user]}**: ${text.replace(/<@([^>]+)>/g, (str, p1, offset, s) => `@**${names[p1]}**`)}
            `
    }

    await channel.send(`__Importing ${messages.length} Messages from ${date}__`);

    const promises = messages
        .map(format)
        .map(message => () => channel.send(message).catch(console.error))

    return await sequential(promises)
}

    const days = await readdirAsync(`${process.argv[2]}/${name}`).catch(console.error);
    console.log('sendMessages in Channel: ', name);
/**
 * Same as readFile, but returns a promise
 * @param {string} path - Path to a directory
 * @returns {string[]} A list of paths in the directories
 */
function readFileAsync(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, file) => {
            err ? reject(err) : resolve(file)
        })
    })
}

/**
 * Same as readDir, but returns a promise
 * @param {string} path - Path to a file
 * @returns {string} The contents of the file
 */
function readdirAsync(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, paths) => {
            err ? reject(err) : resolve(paths);
        })
    })
}
