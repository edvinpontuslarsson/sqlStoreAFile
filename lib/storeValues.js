'use strict'

require('dotenv').config()
const mySql = require('mysql')
const arrayChunk = require('array-chunk')

module.exports = (values, startTime) => {
  const dbConnection = getDbConnection()
  storeValues(dbConnection, values, startTime)
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

function storeValues (connection, valueObj, startTime) {
  connection.connect(async err => {
    if (err) throw err

    const max = getMaxInsertAmount()
    
    const commentsChunks = arrayChunk(valueObj.comments, max)
    const subredditsChunks = arrayChunk(valueObj.subreddits, max)
    const authorsChunks = arrayChunk(valueObj.authors, max)

    for(const arr of commentsChunks) {
      const result = await insert(connection, getSqlCommentsQuery(), arr)
      console.log(`${result.affectedRows} rows inserted`)
    }

    for(const arr of subredditsChunks) {
      const result = await insert(connection, getSqlSubredditsQuery(), arr)
      console.log(`${result.affectedRows} rows inserted`)
    }

    for(const arr of authorsChunks) {
      const result = await insert(connection, getSqlAuthorsQuery(), arr)
      console.log(`${result.affectedRows} rows inserted`)
    }

    connection.end(() => {
      let endTime = new Date()
      let timeDifference = endTime - startTime

      const seconds = Math.round(timeDifference / 1000)

      console.log(
        `${valueObj.comments.length} lines inserted in ${seconds} seconds`
      )
    })
  })
}

function getSqlCommentsQuery () {
  return `
    INSERT INTO Comments (
        id, parent_id, link_id, name, author, body, subreddit_id, score, created_utc
    )

    VALUES ?
    `
}

function getSqlSubredditsQuery() { // key does nothing because now I don't have a key
  /**
    ON DUPLICATE KEY UPDATE
    subreddit_id = VALUES(subreddit_id),
    subreddit = VALUES(subreddit)
   */

  return `
    INSERT INTO Subreddits (subreddit_id, subreddit) VALUES ?
  `
}

function getSqlAuthorsQuery() {
  return `
    INSERT INTO Authors (
      author, latest_subreddit_id, combined_score, subreddit_specialist
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
