'use strict'

require('dotenv').config()
const mySql = require('mysql')

module.exports = (values, startTime) => {
    const dbConnection = getDbConnection()
    storeValues(dbConnection, values, startTime)
}

function getDbConnection() {
    return mySql.createConnection({
        host: process.env.hostname,
        user: process.env.mysql_username,
        password: process.env.mysql_password,
        database: process.env.database_name,
        charset: 'utf8mb4',
        debug: false
    })
}

function storeValues(connection, values, startTime) {
    connection.connect(err => {
        if (err) throw err
        
        const sqlQuery = getSqlQuery()

        // later do multiple queries (with received object) and end in last one
        connection.query(sqlQuery, [values], err => {
            if (err) console.log(err)

            connection.end(() => {
                let endTime = new Date()
                let timeDifference = endTime - startTime

                const seconds = Math.round(timeDifference / 1000)

                console.log(
                    `${values.length} lines inserted in ${seconds} seconds`
                )
            })
        })
    })
}

function getSqlQuery() {
    return `
        INSERT INTO Comments (
            id, parent_id, link_id, name, author, body, subreddit_id, subreddit, score, created_utc
        )

        VALUES ?
    `
}
