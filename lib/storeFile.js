'use strict'

require('dotenv').config()
const fs = require('fs')
const readline = require('readline')
const mySql = require('mysql')

module.exports = filePath => {
    const dbConnection = getDbConnection()
    const reader = getRunningReader(filePath)
    
    storeFile(dbConnection, reader)
}

function getDbConnection() {
    return mySql.createConnection({
        host: process.env.hostname,
        user: process.env.mysql_username,
        password: process.env.mysql_password,
        database: process.env.database_name
    })
}

function getRunningReader(filePath) {
    return readline.createInterface({
        input: fs.createReadStream(filePath)
    })
}

function storeFile(connection, reader) {
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

        connection.end(() => // moved, try again
        { console.log('Operation completed succesfully!') })
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