
const fs = require('fs');
const path = require('path');
const { guild: id } = require('./config');

const names = require(`./${process.argv[2]}/users`).reduce((names, { id, profile: { real_name } }) => {
    names[id] = real_name;
    return names;
}, {});

const sequential = require('promise-sequential');
const clientPromise = require('./client');

module.exports = async ({ name, archived, topic, purpose }) => {
    const client = await clientPromise.catch(console.error)
    const guild = client.guilds.get(id);
    const archive = guild.channels.get('437896479533826048')
    const channel = await guild.createChannel(name, 'text', archive.permissionOverwrites);
    await channel.setTopic(`${topic} \n ${purpose}`)
    console.log(`created channel ${name}`)
    await sendChannelMessages(channel).catch(console.error)
    console.log(`finished uploading messages to channel ${name}`)
    archived ? await channel.setParent(archive) : await channel.overwritePermissions('413251361367654400', {
        READ_MESSAGES: true,
    })
    return channel;
}

async function sendChannelMessages(channel) {

    async function sendDaysMessages({ date, messages }) {

        function format({ user, text, subtype, file }) {
            if (subtype === "file_share") {
                const { name, url_private } = file;
                text = text.replace(/<https[^>]+>/g, (str, p1, offset, s) => `**${name}: ${url_private}**`)
            }
            text = text.replace(/<@([^>]+)>/g, (str, p1, offset, s) => `@**${names[p1]}**`)
            return subtype ? (text + "\n") : `**${names[user]}**: ${text} \n`;
        }
    
        await channel.send(`__Importing ${messages.length} Messages from ${date}__`);
    
        const promises = messages
            .map(format)
            .map(message => () => channel.send(message).catch(console.error))
    
        return await sequential(promises)
    }

    const { name } = channel;
    const days = await readdirAsync(`${process.argv[2]}/${name}`).catch(console.error);
    console.log('sendMessages in Channel: ', name);

    return await sequential(days
        .sort()
        .map(date => ({
            date: new Date(date.split('.')[0]).toDateString(),
            messages: require(`./${process.argv[2]}/${name}/${date}`)
        }))
        .map(object => () => sendDaysMessages(object)))
}

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
