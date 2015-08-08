/**
 * Modules
 */

var aws = require('aws-sdk')
var fs = require('fs')
var Promise = require('bluebird')
var is = require('@weo-edu/is')

/**
 * Create domain
 * @param  {String} domain
 * @return {Promise}
 */

exports.create = function (domain) {
  var cs = new aws.CloudSearch()
  return Promise.promisify(cs.createDomain.bind(cs))({DomainName: domain})
}

/**
 * Get analysis schems
 *
 * @param  {String} domain
 * @param  {Array|String} names
 * @return {Promise}
 */

exports.getAnalysisSchemes = function(domain, names) {
  var cs = new aws.CloudSearch()
  if (!is.array(names))
    names = [names]
  var params = {
    DomainName: domain,
    AnalysisSchemeNames: names
  }
  return Promise.promisify(cs.describeAnalysisSchemes.bind(cs))(params)
}

/**
 * Configure an analysis scheme that can be applied to an index
 *
 * @param  {String}  domain
 * @param  {String}  name
 * @param  {Object}  options
 * @return {Promise}
 */

exports.setAnalysisScheme = function (domain, name, options) {
  var cs = new aws.CloudSearch()
  var params = {
    DomainName: domain,
    AnalysisSchemeLanguage: 'en',
    AnalysisSchemeName: name,
    AnalysisOptions: {
      AlgorithmicStemming: options.stemming,
      Stopwords: options.stopwords,
      Synonyms: options.synonyms
    }
  }
  return Promise.promisify(cs.defineAnalysisScheme.bind(cs))(params)
}

/**
 * Get indexes
 * @param  {String} domain
 * @param  {Array} fields List of fields to include (optional)
 * @return {Promise}
 */

exports.getIndexes = function (domain, fields) {
  var cs = new aws.Cloudsearch()
  var params = {DomainName: domain}
  if (fields) {
    params.FieldNames = fields
  }
  return Promise.promisify(cs.describeIndexFields.bind(cs))(params)
}

/**
 * Set index
 * @param  {String} domain
 * @param  {String} field
 * @params {Object} options
 * @return {Promise}
 */

exports.setIndex = function (domain, field, options) {
  var cs = new aws.Cloudsearch()
  var params = {
    DomainName: domain,
    IndexField: {
      IndexFieldName: field,
      IndexFieldType: options.type || 'text'
    }
  }

  var tOptions = R.zipObj(
    R.keys(options).map(function(key) {
      switch (key) {
        case 'default': return 'DefaultValue'
        case 'facet': return 'FacetEnabled'
        case 'return': return 'ReturnEnabled'
        case 'search': return 'SearchEnabled'
        case 'sort': return 'SortEnabled'
        case 'source': return 'SourceField'
        case 'analysis': return 'AnalysisScheme'
        case 'highlight': return 'HighlightEnabled'
      }
    }),
    R.values(options)
  )

  if (R.keys(tOptions).length) {
    var optionsKey = pascalCase(type + '_options')
    params.IndexField[optionsKey] = tOptions
  }

  return Promise.promisify(cs.defineIndexField.bind(cs))(params)
}

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
 * @param  {String} query   Search query
 * @param  {Object} options Search options
 * @return {Promise}
 *
 * Options
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

exports.search = function (domain, query, options) {
  options = options || {}
  options.query = query
  var csd = new aws.CloudSearchDomain({endpoint: domain})
  return Promise.promisify(csd.search.bind(csd))(options)
}
