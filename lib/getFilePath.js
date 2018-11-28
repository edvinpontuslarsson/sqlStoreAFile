'use strict'

module.exports = () => {
    const filePath = process.argv[2]
    
    if (!filePath) {
        console.log('Please enter file path')
        process.exit()
    }

    return filePath
}
