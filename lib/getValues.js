'use strict'

const readline = require('readline')
const fs = require('fs')

module.exports = filePath => {
  const reader = readline.createInterface({
    input: fs.createReadStream(filePath)
  })

  return getPromiseValues(reader)
}

function getPromiseValues (reader) {
  return new Promise((resolve, reject) => {
    reader.on('error', err => { throw err })

    let lineIndex = 0
    let linesThisRound = 0

    const allValues = []

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
        allValues.push(getValueRow(obj))
      }
    })

    reader.on('close', () => {
      resolve(allValues)
    })
  })
}

function getValueRow (obj) {
  const row = []

  row.push(obj.id)
  row.push(obj.parent_id)
  row.push(obj.link_id)
  row.push(obj.name)
  row.push(obj.author)
  row.push(obj.body)
  row.push(obj.subreddit_id)
  row.push(obj.subreddit)
  row.push(obj.score)
  row.push(obj.created_utc)

  row.forEach(item => {
    if (typeof item === 'string') {
      item = customSqlEscape(item)
    }
  })

  return row
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
