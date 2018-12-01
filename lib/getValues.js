'use strict'

const LineByLineReader = require('line-by-line')
const sqlString = require('sqlstring')

module.exports = filePath => {
    const reader = new LineByLineReader(filePath)
    return getPromiseValues(reader)
}

function getPromiseValues(reader) {
    return new Promise((resolve, reject) => {
        reader.on('error', err => { throw err })

        let lineIndex = 0
        
        const allValues = []

        reader.on('line', line => {
            lineIndex += 1
            console.log(`${lineIndex} lines read`)

            const obj = JSON.parse(line)
            allValues.push(getValueRow(obj))
        })

        reader.on('end', () => {
            resolve(allValues)
        })
    })
}

function getValueRow(obj) {
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

    row.forEach(element => {
        if(typeof element === 'string') {
            element = removeNonASCIIChars(element)
            element = customSqlEscape(element)
        }
    })

    return row
}

/**
 * Uses method described here:
 * https://stackoverflow.com/questions/7744912/making-a-javascript-string-sql-friendly
 * @param {*} string 
 */
function customSqlEscape(string) {
    return string.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, char => {
        switch (char) {
            case "\0":
                return "\\0"
            case "\x08":
                return "\\b"
            case "\x09":
                return "\\t"
            case "\x1a":
                return "\\z"
            case "\n":
                return "\\n"
            case "\r":
                return "\\r"
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\" + char
        }
    })
}

function removeNonASCIIChars(string) {
    return string.replace(/[^\x00-\x7F]/g, "")
}
