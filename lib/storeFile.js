'use strict'

require('dotenv').config()
const LineByLineReader = require('line-by-line')
const mySql = require('mysql')
const sqlString = require('sqlstring')

module.exports = filePath => {
    const reader = new LineByLineReader(filePath)
    const dbConnection = getDbConnection()
    
    storeFile(reader, dbConnection)
}

function getDbConnection() {
    return mySql.createConnection({
        host: process.env.hostname,
        user: process.env.mysql_username,
        password: process.env.mysql_password,
        database: process.env.database_name
    })
}

function storeFile(reader, connection) {
    reader.on('error', err => { throw err })

    connection.connect(err => {
        if (err) throw err

        reader.on('line', line => {
            const obj = JSON.parse(line)
            
            const sqlQuery = getSqlQuery(obj)
            console.log(sqlQuery)
            
            // do multiple queries later with multiple insert statements
            connection.query(sqlQuery, (err, result) => {
                if (err) throw err
                console.log(`Number of records inserted: ${result.affectedRows}`)
            })    
        })

        reader.on('end', () => {
            connection.end(() => {
                console.log('Operation completed succesfully!')
            })
        })
    })
}

function getSqlQuery(obj) {
    let insert = "INSERT INTO Comments (id, parent_id, link_id, name, author, body, subreddit_id, subreddit, score, created_utc)"
    let valueStart = "VALUES ("
    
    valueStart += sqlString.escape(obj.id) + ", "
    valueStart += sqlString.escape(obj.parent_id) + ", "
    valueStart += sqlString.escape(obj.link_id) + ", "
    valueStart += sqlString.escape(obj.name) + ", "
    valueStart += sqlString.escape(obj.author) + ", "
    valueStart += sqlString.escape(obj.body) + ", "
    valueStart += sqlString.escape(obj.subreddit_id) + ", "
    valueStart += sqlString.escape(obj.subreddit) + ", "
    valueStart += sqlString.escape(obj.score) + ", "
    valueStart += sqlString.escape(obj.created_utc)

    let valueEnd = ")"
    
    return `${insert} ${valueStart}${valueEnd}`
}
