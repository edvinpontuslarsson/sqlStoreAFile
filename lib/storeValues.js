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
      const result = await queryDB(connection, getSqlCommentsQuery(), arr)
      console.log(`${result.affectedRows} rows inserted`)
    }

    for(const arr of subredditsChunks) {
      const result = await queryDB(connection, getSqlSubredditsQuery(), arr)
      console.log(`${result.affectedRows} rows inserted`)
    }
    
    for(const arr of authorsChunks) {
      // arr[3] = 1/0
      // [ 'Nikola_S', 'programming', 6 ]
      for(const row of arr) {
        const author = row[0]
        const subredditId = row[1]

        // for loop later, fast 
        const sqlCommentsByAuthor = 
          `SELECT * FROM Comments where author = '${author}' AND subreddit_id <> '${subredditId}'`
        
        const comments = await queryDB(connection, sqlCommentsByAuthor)

        let subSpecialist = 1

        // for loop
      }

      const result = await queryDB(connection, getSqlAuthorsQuery(), arr)
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

function getSqlSubredditsQuery() {
  return `
    INSERT INTO Subreddits (subreddit_id, subreddit) VALUES ?
    ON DUPLICATE KEY UPDATE
    subreddit_id = VALUES(subreddit_id),
    subreddit = VALUES(subreddit)
  `
}

// https://stackoverflow.com/questions/20413064/multiple-separate-if-conditions-in-sql-server
// https://www.w3schools.com/sql/func_mysql_if.asp
function getSqlAuthorsQuery(subSpecialist) {
  return `
    INSERT INTO Authors (
      author, latest_subreddit_id, combined_score, subreddit_specialist
    )
    VALUES ?
    ON DUPLICATE KEY UPDATE
    author = VALUES(author),
    latest_subreddit_id = VALUES(latest_subreddit_id),
    combined_score = combined_score + VALUES(combined_score)
    subreddit_specialist = ${subSpecialist}
  `
}

/**
 *
 * @param {*} connection
 * @param {*} sqlQuery
 * @param {*} values - array with arrays, max 10 000
 */
function queryDB (connection, sqlQuery, values) {
  return new Promise(resolve => {
    if (values) {
      connection.query(sqlQuery, [values], (err, result) => {
        if (err) throw err
        resolve(result)
      })
    } else {
      console.log('gets here?')
      connection.query(sqlQuery, (err, result) => {
        if (err) console.log(err)
        resolve(result)
      })
    }
  })
}
