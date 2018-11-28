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

            const sqlQuery = getSqlQuery(lineIndex)
            const values = getValuesFromObj(obj, lineIndex)

            connection.query(sqlQuery, [values], (err, result) => {
                if (err) throw err
                console.log(`Successfully inserted line ${lineIndex}`)
            })
        })
    })

    connection.end(() => 
        { console.log('Operation completed succesfully!') })
}

const postQuery = ''
const subredditQuery = ''

function getSqlQuery(lineIndex) {
    // loop based on lineIndex
}

function getValuesFromObj(obj, lineIndex) {
    // select based on lineIndex
}
