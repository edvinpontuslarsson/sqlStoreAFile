'use strict'

const getFilePath = require('./lib/getFilePath')
const getObjects = require('./lib/getObjects')
const storeValues = require('./lib/storeValues')

;(async () => {
  let startTime = new Date()

  const filePath = getFilePath()
  const objects = await getObjects(filePath)
  storeValues(objects, startTime)
})()
