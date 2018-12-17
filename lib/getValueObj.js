'use strict'

const readline = require('readline')
const fs = require('fs')

module.exports = filePath => {
  const reader = readline.createInterface({
    input: fs.createReadStream(filePath)
  })

  return getPromiseValueObj(reader)
}

function getPromiseValueObj (reader) {
  return new Promise(resolve => {
    reader.on('error', err => { throw err })

    let lineIndex = 0
    let linesThisRound = 0

    const valueObj = {
      comments: [],
      subreddits: [],
      authors: []
    }

    reader.on('line', line => {
      linesThisRound += 1

      if (linesThisRound === 100000) {
        linesThisRound = 0

        reader.pause()
        setTimeout(() => {
          reader.resume()
        }, 1)
      } else {
        lineIndex += 1
        console.log(`${lineIndex} lines read`)

        const obj = JSON.parse(line)
        valueObj.comments.push(getCommentsValues(obj))
        valueObj.subreddits.push(getSubredditsValues(obj))
        valueObj.authors.push(getAuthorsValues(obj))
      }
    })

    reader.on('close', () => {
      resolve(valueObj)
    })
  })
}

function getCommentsValues (obj) {
  const values = []

  values.push(obj.id)
  values.push(obj.parent_id)
  values.push(obj.link_id)
  values.push(obj.name)
  values.push(obj.author)
  values.push(obj.body)
  values.push(obj.subreddit_id)
  values.push(obj.score)
  values.push(obj.created_utc)

  escapeAllStrings(values)

  return values
}

function getSubredditsValues (obj) {
  const values = []

  values.push(obj.subreddit_id)
  values.push(obj.subreddit)

  escapeAllStrings(values)

  return values
}

function getAuthorsValues(obj) {
  const values = []

  values.push(obj.author)
  values.push(obj.subreddit_id)
  values.push(obj.score)

  escapeAllStrings(values)

  return values
}

function escapeAllStrings(values) {
  values.forEach(item => {
    if (typeof item === 'string') {
      item = customSqlEscape(item)
    }
  })
}

/**
 * Uses method described here:
 * https://stackoverflow.com/questions/7744912/making-a-javascript-string-sql-friendly
 * @param {*} string
 */
function customSqlEscape (string) {
  return string.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, char => {
    switch (char) {
      case '\0':
        return '\\0'
      case '\x08':
        return '\\b'
      case '\x09':
        return '\\t'
      case '\x1a':
        return '\\z'
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char
    }
  })
}
