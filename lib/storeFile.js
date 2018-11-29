'use strict'

require('dotenv').config()
const LineByLineReader = require('line-by-line')
const mySql = require('mysql')

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

        let lineIndex = 0

        reader.on('line', line => {
            lineIndex += 1

            const obj = JSON.parse(line)

            const sqlQuery = getSqlQuery()
            const values = getValuesFromObj(obj)

            // do multiple queries later with multiple insert statements
            connection.query(sqlQuery, [values], err => { // or (err, result)
                if (err) throw err
                console.log(`${lineIndex} lines read & stored`)
            })
        })

        reader.on('end', () => { console.log('All files read succesfully!') })
        
        /*
        connection.end(() =>
            { console.log('Database operation completed succesfully!') })
        */
    })
}

function getSqlQuery() {
    return `
        INSERT INTO Comments (
            id, 
            parent_id, 
            link_id, 
            name, 
            author, 
            body, 
            subreddit_id, 
            subreddit, 
            score, 
            created_utc
        )

        VALUES ?
    `
}

function getValuesFromObj(obj) {
    const values = []

    values.push(obj.id) // string
    values.push(obj.parent_id) // string
    values.push(obj.link_id)
    values.push(obj.name) // string
    values.push(obj.author) // string
    values.push(obj.body) // string
    values.push(obj.subreddit_id) // string
    values.push(obj.subreddit) // string
    values.push(obj.score) // int
    values.push(obj.created_utc) // string

    return values
}
