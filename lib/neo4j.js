var neo4j = require('neo4j-io')(process.env.NEO4J_URL || 'http://localhost:7474')

module.exports = {
    neo4j: neo4j
};