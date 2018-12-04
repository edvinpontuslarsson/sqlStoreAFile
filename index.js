'use strict'

const getFilePath = require('./lib/getFilePath')
const getValues = require('./lib/getValues')
const storeValues = require('./lib/storeValues')

;(async () => {
  let startTime = new Date()

  const filePath = getFilePath()
  const values = await getValues(filePath)
  storeValues(values, startTime)
})()
