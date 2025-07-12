const CustomAPIError = require('./custom-api-error')
const BadRequestError = require('./bad-request')
const NotFoudn = require('./not-found')
const Unauthenticated = require('./unauthenticated')
const Unauthorized = require('./unauthorized')
const Forbidden = require('./forbidden')
const Conflict = require('./conflict')

module.exports = {
   CustomAPIError,
   BadRequestError,
   NotFoudn,
   Unauthenticated,
   Unauthorized,
   Forbidden,
   Conflict
}