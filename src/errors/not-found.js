const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('./custom-api-error')

class NotFoudn extends CustomAPIError {
   constructor(message) {
      super(message)
      this.StatusCodes = StatusCodes.NOT_FOUND
   }
}

module.exports = NotFoudn