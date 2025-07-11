const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('./custom-api-error')

class Forbidden extends CustomAPIError {
   constructor(message) {
      super(message)
      this.StatusCodes = StatusCodes.Forbidden
   }
}

module.exports = Forbidden