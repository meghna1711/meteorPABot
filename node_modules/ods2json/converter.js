var parsers    = require('./parsers')
  , xmlvars    = require('./xmlvars').vars
  , Promise    = require('node-promise')
  , _          = require('underscore')
  , xml2js     = require('xml2js')
  , Parser     = require('svmconv')
  , unzip      = require('unzip2')
  , fs         = require('fs')
  , defer      = Promise.defer
  , when       = Promise.when
  , all        = Promise.all
  , objectsxy  = []
  , pictures   = {}
  , multimedia = {};

var ods2json = function() {};

ods2json.prototype.convert = function(path) {
    this.extractFiles(path).then(
        function(files) { parseXML(files);    },
        function(err)   { console.error(err); }
    );
};

/**
 * ODS file contents
 * 
 * @param {array} files
 * 
 */
parseXML = function(files) {
    var parser  = new xml2js.Parser()
      , results = {};

    // CSS defaults
    parser.parseString(files['styles.xml'].contents, function(err, data) {
        results.styles = parsers.parseSTYLES(data[xmlvars.documentStyles]);
    });

    // ODS sheet contents
    parser.parseString(files['content.xml'].contents, function(err, data) {
        results.body = parsers.parseBODY(data[xmlvars.documentContent], results.styles, pictures, multimedia);
    });

    // Sheet and pages settings
    parser.parseString(files['settings.xml'].contents, function(err, data) {
        results.settings = parsers.parseSETTINGS(data[xmlvars.documentSettings]);
    });

    // Write to JSON file
    fs.writeFile('parsed.json', JSON.stringify(results));
};

/**
 * Extract data from ODS
 * 
 * @param {string} path
 * 
 * @returns {promise}
 */
ods2json.prototype.extractFiles = function(path) {
    var deferred  = defer()
      , svmconv   = new Parser()
      , srcStream = fs.createReadStream(path)
      , deferr_ls = {}
      , files     = {
          'styles.xml'  : { deferred: defer() },
          'content.xml' : { deferred: defer() },
          'settings.xml': { deferred: defer() }
        };

    console.log('==============STARTED==============');

    srcStream.pipe(unzip.Parse())
        .on('error', function(err) {
            deferred.reject(err);
        })
        .on('entry', function(entry) {
            console.log('Current file: %s', entry.path);

            if (files[entry.path]) { // xml files
                var contents = '';

                entry
                    .on('data', function(data) {
                        contents += data.toString();
                    })
                    .on('end', function() {
                        files[entry.path].contents = contents;
                        files[entry.path].deferred.resolve();
                    });
            } else if (/Object\s\d\/content.xml/ig.test(entry.path)) { // SVM files data
                var object_id = /\d/g.exec(entry.path)[0];
                contents      = '';

                entry
                    .on('data', function(data) {
                        contents += data.toString();
                    })
                    .on('end', function() {
                        var parser = new xml2js.Parser();

                        parser.parseString(contents, function(err, data) {
                            var chart = data[xmlvars.documentContent][xmlvars.body][0][xmlvars.chart];
                            data      = chart ? chart[0][xmlvars.chartData][0][xmlvars.plot][0][xmlvars.svmChartCoords][0][xmlvars.root] : false;
                            objectsxy['ObjectReplacements/Object ' + object_id] = {
                                x: data ? data[xmlvars.shapeLeft] : 0,
                                y: data ? data[xmlvars.shapeTop]  : 0
                            };
                        });
                    });
            } else if (entry.path.indexOf('Pictures/') !== -1) { // Regular images
                var contents;

                entry
                    .on('data', function(data) {
                        contents = contents ? Buffer.concat([contents, data]) : data;
                    })
                    .on('end', function() {
                        pictures[entry.path] = 'data:image/png;base64,' + contents.toString('base64');
                    });
            } else if (entry.path.indexOf('Media/') !== -1) { // Audio / Video files
                var contents;

                entry
                    .on('data', function(data) {
                        contents = contents ? Buffer.concat([contents, data]) : data;
                    })
                    .on('end', function() {
                         var mmm   = require('mmmagic')
                           , Magic = mmm.Magic
                           , magic = new Magic(mmm.MAGIC_MIME_TYPE);

                        magic.detect(contents, function(err, result) {
                            if (err) throw err;
                            multimedia[entry.path] = 'data:' + result + ';base64,' + contents.toString('base64');
                        });
                    });
            } else if (entry.path.indexOf('ObjectReplacements/') !== -1) { // SVM files
                var dataset = '';
                deferr_ls[entry.path] = { deferred: defer() };

                entry
                    .on('data', function(data) {
                        dataset = dataset ? Buffer.concat([dataset, data]) : data;
                    })
                    .on('end', function() {
                        pictures[entry.path] = dataset;
                        deferr_ls[entry.path].deferred.resolve();
                    });
            } else {
                entry.on('data', function () {});
            }
        }).on('close', function() {
            // When resolved images
            when(all(_.pluck(files, 'deferred')), function() {
                // When resolved objects (charts)
                when(all(_.pluck(deferr_ls, 'deferred')), function() {
                    _.each(pictures, function(picture, key) {
                        if (key.indexOf('ObjectReplacements/') !== -1) {
                            pictures[key] = svmconv.parse(picture, key, false, objectsxy[key]);
                        }
                    });
                    deferred.resolve(files);
                });
            });

            console.log('==============FINISHED==============');
        });

    return deferred.promise;
};

module.exports = ods2json;