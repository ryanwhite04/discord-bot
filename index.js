const importChannel = require('./importChannel');
const channels = require('./slack/current');

const path = require('path');

console.log(process.argv);

require(`./${process.argv[2]}/channels`)

.filter(({ is_general }) => !is_general)
.map(({
    name,
    is_archived: archived,
    topic: { value: topic },
    purpose: { value: purpose },
}) => ({
    name, archived, topic, purpose
})).slice(...process.argv.slice(3)).map(importChannel)


