/**
 * Modules
 */

var aws = require('aws-sdk')
var fs = require('fs')
var Promise = require('bluebird')


/**
 * Upload documents to domain
 *
 * @param {String} domain Search endpoint
 * @param {Array}  documents Array of document objects to upload
 * @return {promise}
 *
 * Upload document schema:
 *
 * {
 * 	"type": {"enum": ["add", "delete"]}, // add or delete document
 * 	"id": {"type": "string"}, // document id
 * 	"fields": {"type": "object"} // fields to upload
 * }
 *
 */

exports.upload = function (domain, documents) {
  var csd = new aws.CloudSearchDomain({endpoint: domain})
  return Promise.promisify(csd.uploadDocuments.bind(csd))({contentType: 'application/json', documents: documents})
}


/**
 * Search domain
 *
 * @param  {String} domain  Search endpoint
 * @param  {Object} options Search options
 * @return {Promise}
 *
 * Options
 * 	- query: search criteria
 * 	- cursor: id used for pagination (starts with initial)
 * 	- expr: numeric expression used for sort and filtering (JSON string)
 * 	- filterQuery: user to filter results of query (key:value)
 * 	- queryOptions: (JSON String)
 * 		- defaultOperator: used to combine terms (or,and,%)
 * 		- fields: array of fields to search
 * 	 	- operators: an array of operators to disable
 * 	 	- phraseField: an array of fields to use for phrase search (["title^3", "plot"])
 * 	 	- phraseSlop: an integer value that specifies how much a match can deviate from search phrase
 * 	 	- explicitPhraseSlop: same as phrase slop, but only applies when phrase is in double quotes
 * 	 	- tieBreaker: a number that specifies how much non max score fields contribute to score
 * 	 - queryParser: specify query parser to use (simple)
 * 	 - return: specifies fields to return (all)
 * 	 - size: specifies max number of hits to include
 * 	 - sort: specifies the fields to sort (e.g year des,title asc)
 * 	 - start: first search hit to return
 */

exports.search = function (domain, options) {
  var csd = new aws.CloudSearchDomain({endpoint: domain})
  return Promise.promisify(csd.search.bind(csd))(options)
}
