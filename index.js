'use strict'

const getFilePath = require('./lib/getFilePath')
const getValueObj = require('./lib/getValueObj')
const storeValues = require('./lib/storeValues')

;(async () => {
  let startTime = new Date()

  const filePath = getFilePath()
  const valueObj = await getValueObj(filePath)
  storeValues(valueObj, startTime)
})()
