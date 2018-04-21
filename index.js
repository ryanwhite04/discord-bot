const importChannel = require('./importChannel');
const channels = require('./slack/current');

channels.slice(0, 2).map(importChannel)


