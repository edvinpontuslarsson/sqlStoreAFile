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
    connection.connect(async err => {
        if (err) throw err
        
        const sqlQuery = getSqlQuery()
        /*
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
        })*/

        const valuesToInsert = []

        for (const row of values) {
            valuesToInsert.push(row)

            if(valuesToInsert.length === 9999) {
                await insert(connection, sqlQuery, valuesToInsert)
                valuesToInsert.length = 0
            }
        }

        connection.end(() => {
            let endTime = new Date()
            let timeDifference = endTime - startTime

            const seconds = Math.round(timeDifference / 1000)

            console.log(
                `${values.length} lines inserted in ${seconds} seconds`
            )
        })
    })
}

function getSqlQuery() {
    return `
        INSERT IGNORE INTO Comments (
            id, parent_id, link_id, name, author, body, subreddit_id, subreddit, score, created_utc
        )

        VALUES ?
    `
}

/**
 * 
 * @param {*} connection 
 * @param {*} sqlQuery 
 * @param {*} values - array with arrays, max 10 000
 */
function insert(connection, sqlQuery, values) {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, [values], (err, insertion) => {
            if (err) throw err
            resolve(insertion)
        })
    })
}
