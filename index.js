'use strict'

const getFilePath = require('./lib/getFilePath')
const storeFile = require('./lib/storeFile')

const filePath = getFilePath()
storeFile(filePath)
