'use strict'

require('dotenv').config()
const mySql = require('mysql')

module.exports = (values, startTime) => {
  const dbConnection = getDbConnection()
  storeObjects(dbConnection, values, startTime)
}

function getDbConnection () {
  return mySql.createConnection({
    host: process.env.hostname,
    user: process.env.mysql_username,
    password: process.env.mysql_password,
    database: process.env.database_name,
    charset: 'utf8mb4',
    debug: false
  })
}

const getMaxInsertAmount = () => 9999

function storeObjects (connection, objects, startTime) {
  connection.connect(async err => {
    if (err) throw err

    const commentsSqlQuery = getSqlCommentsQuery()
    const valuesToInsert = []

    for (const row of objects) {
      valuesToInsert.push(row)

      if (valuesToInsert.length === getMaxInsertAmount() ||
            objects.length < getMaxInsertAmount()) {
        const result = await insert(connection, commentsSqlQuery, valuesToInsert)
        valuesToInsert.length = 0

        console.log(`${result.affectedRows} rows inserted`)
      }
    }

    connection.end(() => {
      let endTime = new Date()
      let timeDifference = endTime - startTime

      const seconds = Math.round(timeDifference / 1000)

      console.log(
        `${objects.length} lines inserted in ${seconds} seconds`
      )
    })
  })
}

function getSqlCommentsQuery () {
  return `
        INSERT INTO Comments (
            id, 
            parent_id, 
            link_id, 
            name, 
            author, 
            body, 
            subreddit_id, 
            score, 
            created_utc
        )

        VALUES ?
    `
}

function getSqlSubredditsQuery () {
  return `
        INSERT INTO Subreddits (
            subreddit_id, 
            subreddit
        )

        VALUES ?
    `
}

function getSqlAuthorsQuery () {
  return `
        INSERT INTO Authors (
          author, 
          combined_score, 
          subreddit_specialist, 
          latest_subreddit_id
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
function insert (connection, sqlQuery, values) {
  return new Promise(resolve => {
    connection.query(sqlQuery, [values], (err, result) => {
      if (err) throw err
      resolve(result)
    })
  })
}
