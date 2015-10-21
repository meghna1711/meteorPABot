var xmlvars = require('./xmlvars').vars
  , _       = require('underscore')
  , xml2js  = require('xml2js');


module.exports.parseSTYLES = function(json_data) {
    var defaults = json_data[xmlvars.styles][0][xmlvars.styleDefaults]
      , styles   = {};

    _.each(defaults, function (value) {
        var cssRoot = value[xmlvars.textCss][0][xmlvars.root];

        styles[value[xmlvars.root][xmlvars.styleName]] = {
            'font-family': cssRoot[xmlvars.graphicFont] || cssRoot[xmlvars.fontName],
            'font-size'  : cssRoot[xmlvars.fontSize]    || false
        };
    });

    return styles;
};

module.exports.parseSETTINGS = function(json_data) {
    var config   = {}
      , route    = json_data[xmlvars.settingsBody][0][xmlvars.configList][0][xmlvars.indexedConfigMap][0][xmlvars.configMap][0]
      , settings = route[xmlvars.configItem]
      , pages    = route[xmlvars.namedMap][0][xmlvars.configMap];

    _.each(pages, function(page) {
        config[page[xmlvars.root][xmlvars.configName]] = {};
        _.each(page[xmlvars.configItem], function (value) {
            switch (value[xmlvars.root][xmlvars.configName]) {
                case 'CursorPositionX':
                    config[page[xmlvars.root][xmlvars.configName]]['CursorPositionX'] = parseInt(value['_']) + 1;
                    break;
                case 'CursorPositionY':
                    config[page[xmlvars.root][xmlvars.configName]]['CursorPositionY'] = parseInt(value['_']) + 1;
                    break;
            };
        });
    });

    _.each(settings, function (value) {
        switch (value[xmlvars.root][xmlvars.configName]) {
            case 'ActiveTable':
                config['ActiveTable'] = value['_'];
                break;
            case 'GridColor':
                config['GridColor'] = {
                    a: value['_'] >> 24 & 255,
                    r: value['_'] >> 16 & 255,
                    g: value['_'] >> 8  & 255,
                    b: value['_'] >> 0  & 255
                };
                break;
            case 'ShowGrid':
                config['ShowGrid'] = value['_'];
                break;
            case 'HasColumnRowHeaders':
                config['HasColumnRowHeaders'] = value['_'];
                break;
            case 'HasSheetTabs':
                config['HasSheetTabs'] = value['_'];
                break;
        }
    });

    return config;
};

module.exports.parseBODY = function(json_data, defaultStyles, pictures, multimedia) {
    var fontFace   = json_data[xmlvars.font_face_section][0][xmlvars.font_face]
      , docCss     = json_data[xmlvars.css_section][0][xmlvars.css]
      , docContent = json_data[xmlvars.body][0][xmlvars.spreadsheet][0][xmlvars.table]
      , compiledDocument = {
            styles  : [],
            fonts   : [],
            tables  : [],
            pictures: pictures,
            media   : multimedia
        };

    /**
     * Check 'default' styles
     *
     * @param {string} cssSection
     * @param {string} cssKey
     *
     * @returns {Boolean|String}
     */
    checkForDefaults = function(cssSection, cssKey) {
        if (cssSection === 'display' && defaultStyles[cssKey]) {
            var result_str = [];
            _.each(defaultStyles[cssKey], function(value, key) {
                if (value) {
                    result_str.push(key + ':' + value);
                }
            });

            return result_str.join(';');
        }
        return false;
    };

    /**
     * Compile css data as string
     *
     * @param {string} wrapped_item
     * @param {stringf} alias
     */
    compileStyle = function(wrapped_item, alias) {
    	var css_str = [];
        if (docCss[idx][alias]) {
            _.each(docCss[idx][alias][0][xmlvars.root], function(value, key) {
                if (key !== xmlvars.textRotation) {
                    value = (value === 'transparent' || value === 'rgba(0, 0, 0, 0)') ? '#fff' : value;
                    if (xmlvars[key] != null) {
                        if (xmlvars[key] === 'width') {
                            css_str.push('min-width:' + value + ' !important');
                        }
                        css_str.push(checkForDefaults(xmlvars[key], value) || xmlvars[key] + ': ' + value + ' !important');
                    }
                }
            });
            compiledDocument.styles.push(wrapped_item + '.' + docCss[idx][xmlvars.root][xmlvars.class] + ' {' + css_str.join(';') + '}');
        }
    };

    /**
     * Validate CSS rule
     * 
     * @param {string}  key
     * @param {string}} value
     * @param {boolean} checkAlias
     * 
     * @returns {Boolean}
     */
    isValidCSS = function(key, value, checkAlias) {
        if (checkAlias) {
            return xmlvars[key] != null && key !== xmlvars.class && key !== xmlvars.parentClass && value !== 'Default';
        } else {
            return key !== xmlvars.class && key !== xmlvars.parentClass && value !== 'Default';
        }
    };

    // get FONT-FACE params
    for (var idx = 0, fontsLen = fontFace.length; idx < fontsLen; idx++) {
        compiledDocument.fonts.push(
            '@font-face "' + fontFace[idx][xmlvars.root][xmlvars.class] + '" { font-family: ' + fontFace[idx][xmlvars.root][xmlvars.fontFamily] + '; }'
        );
    }

    // get CSS params
    for (var idx = 0, cssLen = docCss.length; idx < cssLen; idx++) {
        compileStyle('td',    xmlvars.tableColProps);
        compileStyle('td',    xmlvars.tableCellProps);
        compileStyle('tr',    xmlvars.tableRowProps);
        compileStyle('table', xmlvars.tableProps);

        if (docCss[idx][xmlvars.root]) {
            var css_str = [];

            // images / objects css
            if (docCss[idx][xmlvars.shapeCssProps]) {
                _.each(docCss[idx][xmlvars.shapeCssProps][0][xmlvars.root], function(value, key) {
                    if (isValidCSS(key, value) && xmlvars[key]) {
                        css_str.push(xmlvars[key] + ': ' + value);
                    }
                });
            }

            // page css
            _.each(docCss[idx][xmlvars.root], function(value, key) {
                if (isValidCSS(key, value)) {
                    css_str.push(checkForDefaults(xmlvars[key], value) || xmlvars[key] + ': ' + value);
                }
            });

            // P
            _.each(docCss[idx][xmlvars.paragraphCss], function() {
                if (docCss[idx][xmlvars.paragraphCss][0]) {
                    _.each(docCss[idx][xmlvars.paragraphCss][0][xmlvars.root], function(value, key) {
                        if (isValidCSS(key, value, true)) {
                            css_str.push(checkForDefaults(xmlvars[key], value) || xmlvars[key] + ': ' + value);
                        }
                    });
                }
            });

            // default text styles
            _.each(docCss[idx][xmlvars.textCss], function() {
                if (docCss[idx][xmlvars.textCss][0]) {
                    _.each(docCss[idx][xmlvars.textCss][0][xmlvars.root], function(value, key) {
                        if (isValidCSS(key, value, true)) {
                            css_str.push(checkForDefaults(xmlvars[key], value) || xmlvars[key] + ': ' + value);
                        }
                    });
                }
            });

            compiledDocument.styles.push('.' + docCss[idx][xmlvars.root][xmlvars.class] + ' {' + css_str.join(';') + '}');
        }
    }

    // Get TABLES
    for (var idx = 0; idx < docContent.length; idx++) {
        var shapes = docContent[idx][xmlvars.shapes] || []
          , rows   = docContent[idx][xmlvars.tr]
          , cols   = docContent[idx][xmlvars.table_column]
          , table  = {
                title    : docContent[idx][xmlvars.root][xmlvars.tableName],
                className: docContent[idx][xmlvars.root][xmlvars.table_class_name],
                shapes   : [],
                media    : [],
                svg      : [],
                rows     : [],
                columns  : [],
                colscnt  : 0
            };

        for (var column_id = 0; column_id < cols.length; column_id++) {
            var column  = cols[column_id][xmlvars.root]
              , repeats = column[xmlvars.td_repeats] || 1;

            for (var i = 0; i < repeats; i++) {
                table.columns.push({
                    className: column[xmlvars.cell_default_class] + ' ' + column[xmlvars.table_class_name]
                });
            }
        }

        // Images and shapes
        if (shapes.length) {
            var images = shapes[0][xmlvars.shapesFrame]
              , vector = shapes[0][xmlvars.customShapes];

            // Media (audio / video / plots)
            for (var i = 0; i < images.length; i++) {
                if (!images[i][xmlvars.mediaPlugin]) {
                    // Plots
                    var wrapper  = images[i][xmlvars.root]
                      , shapeObj = images[i][xmlvars.shapesObject]
                      , image    = images[i][xmlvars.shapesImage][0][xmlvars.root]
                      , isPlot   = !!shapeObj
                      , shapeTxt = isPlot ? false : images[i][xmlvars.shapesImage][0][xmlvars.text_value][0][xmlvars.textSpan]
                      , plotRng  = isPlot ? (shapeObj ? shapeObj[0][xmlvars.root][xmlvars.shapesObjectRange] : false) : false
                      , caption  = isPlot ? false : (shapeTxt ? shapeTxt[0]['_'] : '') || ''
                      , textCss  = isPlot ? false : (shapeTxt ? shapeTxt[0][xmlvars.root][xmlvars.textClass] : '') || '';

                    table.shapes.push({
                        wrapper: {
                            'z-index'  : wrapper[xmlvars.z_index],
                            'className': wrapper[xmlvars.annotationClass],
                            'name'     : wrapper[xmlvars.block_title],
                            'width'    : parseFloat(wrapper[xmlvars.shapeWidth]),
                            'height'   : parseFloat(wrapper[xmlvars.shapeHeight]),
                            'left'     : parseFloat(wrapper[xmlvars.shapeLeft]),
                            'top'      : parseFloat(wrapper[xmlvars.shapeTop])
                        },
                        image  : isPlot ? image[xmlvars.shapeImageURI].substr(2, image[xmlvars.shapeImageURI].length - 2) : image[xmlvars.shapeImageURI],
                        imgtext: isPlot ? '' : caption,
                        textCss: isPlot ? '' : textCss,
                        plotRng: isPlot ? plotRng : '',
                        isPlot : isPlot
                    });
                } else {
                    var wrapper = images[i][xmlvars.root];
                    // Audio / video
                    table.media.push({
                        wrapper: {
                            'z-index': wrapper[xmlvars.z_index],
                            'width'  : parseFloat(wrapper[xmlvars.shapeWidth]),
                            'height' : parseFloat(wrapper[xmlvars.shapeHeight]),
                            'left'   : parseFloat(wrapper[xmlvars.shapeLeft]),
                            'top'    : parseFloat(wrapper[xmlvars.shapeTop])
                        },
                        title: images[i][xmlvars.mediaPlugin][0][xmlvars.root][xmlvars.shapeImageURI],
                        type : compiledDocument.media[images[i][xmlvars.mediaPlugin][0][xmlvars.root][xmlvars.shapeImageURI]].indexOf('audio') !== -1 ? 'audio' : 'video'
                    });
                }
            }

            // SVG
            for (var i = 0; i < vector.length; i++) {
                var svgShape  = vector[i]
                  , shapeTxt  = svgShape[xmlvars.text_value][0]['_'] || svgShape[xmlvars.text_value][0]
                  , textCss   = (svgShape[xmlvars.text_value][0]['_'] ? svgShape[xmlvars.text_value][0][xmlvars.root][xmlvars.textClass] : '') || ''
                  , formula   = svgShape[xmlvars.shapesGeometry][0][xmlvars.root][xmlvars.shapePath]
                  , viewBox   = svgShape[xmlvars.shapesGeometry][0][xmlvars.root][xmlvars.shapeViewBox].split(' ')
                  , modifiers = svgShape[xmlvars.shapesGeometry][0][xmlvars.root][xmlvars.shapeModifiers] ? svgShape[xmlvars.shapesGeometry][0][xmlvars.root][xmlvars.shapeModifiers].split(' ') : [0, 0]
                  , width     = parseFloat(svgShape[xmlvars.root][xmlvars.shapeWidth])  * 38
                  , height    = parseFloat(svgShape[xmlvars.root][xmlvars.shapeHeight]) * 38
                  , mwidth    = modifiers[0] - 26000
                  , mheight   = modifiers[1] - 26000
                  , tailpos   = {
                        up  : modifiers[1] < 0,
                        left: modifiers[0] < 0
                    };

                if (svgShape[xmlvars.shapesGeometry][0][xmlvars.svgEquations]) {
                    formula = extractPath(svgShape, [modifiers[0], modifiers[1]]);
                }

                if (parseInt(viewBox[3]) < parseInt(modifiers[1])) {
                    viewBox[3] = modifiers[1];
                }

                if (parseInt(viewBox[2]) < parseInt(modifiers[0])) {
                    viewBox[2] = modifiers[0];
                }

                if (modifiers[0] < 0 || modifiers[1] < 0) {
                    var data = formula.split(' ')
                      , isX  = true;

                    for (var dataLen = 0; dataLen < data.length; dataLen++) {
                        if (!isNaN(parseFloat(data[dataLen]))) {
                            if (modifiers[0] < 0 && modifiers[1] < 0) {
                                data[dataLen] = parseFloat(data[dataLen]) + Math.abs(parseFloat(isX ? modifiers[0] : modifiers[1]));
                                isX           = !isX;
                            } else if (modifiers[0] < 0 && modifiers[1] >= 0 && isX) {
                                data[dataLen] = parseFloat(data[dataLen]) + Math.abs(parseFloat(modifiers[0]));
                                isX           = !isX;
                            } else if (modifiers[1] < 0 && modifiers[0] >= 0 && !isX) {
                                data[dataLen] = parseFloat(data[dataLen]) + Math.abs(parseFloat(modifiers[1]));
                                isX           = !isX;
                            }
                        }
                    }
                    formula = data.join(' ');
                }

                var notdivided = false;
                if (modifiers[0] < 0 && modifiers[1] < 0) {
                    mwidth     = 70.4 * parseFloat(svgShape[xmlvars.root][xmlvars.shapeWidth]);
                    mheight    = 70.4 * parseFloat(svgShape[xmlvars.root][xmlvars.shapeHeight]);
                    notdivided = true;
                }

                if (modifiers[0] < 0) {
                    viewBox[2]   = parseFloat(viewBox[2]) + Math.abs(modifiers[0]);
                    modifiers[0] = 0;
                }

                if (modifiers[1] < 0) {
                    viewBox[3]   = parseFloat(viewBox[3]) + Math.abs(modifiers[1]);
                    modifiers[1] = 0;
                }

                var left = parseFloat(svgShape[xmlvars.root][xmlvars.shapeLeft]) * 38
                  , top  = parseFloat(svgShape[xmlvars.root][xmlvars.shapeTop])  * 38;

                if (notdivided) {
                    left -= Math.abs(width - mwidth);
                    top  -= Math.abs(height - mheight);
                }

                table.svg.push({
                    wrapper: {
                        'z-index': svgShape[xmlvars.root][xmlvars.z_index],
                        className: svgShape[xmlvars.root][xmlvars.annotationClass],
                        srcwidth : Math.floor(width),
                        srcheight: Math.floor(height),
                        width    : Math.floor(mwidth  > 0 ? (notdivided ? mwidth  : Math.floor(mwidth  / 79.7 + width )) : width),
                        height   : Math.floor(mheight > 0 ? (notdivided ? mheight : Math.floor(mheight / 79.7 + height)) : height),
                        left     : left,
                        top      : top
                    },
                    text     : shapeTxt,
                    formula  : formula,
                    textCss  : textCss,
                    classNmae: svgShape[xmlvars.root][xmlvars.annotationClass] || '',
                    viewBox  : viewBox.join(' '),
                    tailpos  : tailpos
                });
            }
        }

        // Get ROWS
        for (var row_id = 0; row_id < rows.length; row_id++) {
            var cells = rows[row_id][xmlvars.table_cell]
              , row   = {
                    className: rows[row_id][xmlvars.root][xmlvars.table_class_name],
                    cells    : []
                };

            if (rows[row_id][xmlvars.table_cell].length > table.colscnt) {
                table.colscnt = rows[row_id][xmlvars.table_cell].length;
            }

            // Get CELLS
            for (var cell_id = 0; cell_id < cells.length; cell_id++) {
                if (cells.length && cells[cell_id]) {
                	var annotation = ''
                      , anno_root  = cells[cell_id][xmlvars.annotation]
                      , cell_root  = cells[cell_id][xmlvars.root];

	                if (anno_root) {
	                	annotation = {
	                		className: anno_root[0][xmlvars.root][xmlvars.annotationClass],
	                		textClass: anno_root[0][xmlvars.root][xmlvars.annotationTextClass],
	                		date     : anno_root[0][xmlvars.annotationDate][0],
	                		text     : anno_root[0][xmlvars.text_value][0][xmlvars.textSpan][0]['_']
	                	};
	                }

                	// No annotation
                	if (cell_root) {
	                	// Empty cells
	                    if (cell_root[xmlvars.td_repeats]) {
                            var text  = cells[cell_id][xmlvars.text_value]
                              , value = text ? text[0] : cell_root[xmlvars.calculated_value] || '';

                            if (typeof value !== 'string') {
                                value = value['_'];
                            }

                            if (text && text[0][xmlvars.textSpan]) {
                                var spanNode = text[0][xmlvars.textSpan][0];
                                value       += '<span class="' + spanNode[xmlvars.root][xmlvars.textClass] + '">' + spanNode['_'] + '</span>';
                            }

                            if (cell_id !== cells.length - 1) {
                                for (var n = 0; n < cell_root[xmlvars.td_repeats]; n++) {
                                    row.cells.push({
                                        type     : 'string',
                                        value    : value,
                                        className: cell_root[xmlvars.table_class_name] || ''
                                    });
                                }
                            }
	                    // Not empty cells
	                    } else {
                            var text  = cells[cell_id][xmlvars.text_value]
                              , value = text ? text[0] : cell_root[xmlvars.calculated_value] || '';

                            if (typeof value !== 'string') {
                                if (value[xmlvars.ahref]) {
                                    value = '<a href="' + value[xmlvars.ahref][0][xmlvars.root][xmlvars.shapeImageURI] + '" target="_blank">' + value[xmlvars.ahref][0]['_'] + '</a>';
                                } else {
                                    value = value['_'];
                                    if (text && text[0][xmlvars.textSpan]) {
                                        var spanNode = text[0][xmlvars.textSpan][0];
                                        value       += '<span class="' + spanNode[xmlvars.root][xmlvars.textClass] + '">' + spanNode['_'] + '</span>';
                                    }
                                }
                            }

	                        row.cells.push({
	                            value     : value,
	                            type      : cell_root[xmlvars.cell_content_type] || '',
	                            formula   : cell_root[xmlvars.formula]           || '',
	                            className : cell_root[xmlvars.table_class_name]  || '',
	                            colspan   : cell_root[xmlvars.colspan]           || '',
	                            rowspan   : cell_root[xmlvars.rowspan]           || '',
	                            annotation: annotation                           || ''
	                        });
	                    }
	                } else {
	                	// Empty cell with annotation
	                	if (cells[cell_id][xmlvars.annotation]) {
	                        row.cells.push({
	                            type      : 'string',
	                        	value     : '',
	                            annotation: annotation || '',
	                            className : cells[cell_id][xmlvars.root][xmlvars.table_class_name] || ''
	                        });
	                    }
	                }
                } else {
                    row.cells.push({
                        type      : 'string',
                        value     : '',
                        annotation: ''
                    });
                }
            }

            if (rows[row_id][xmlvars.root][xmlvars.tr_repeats] < 100) {
                for (var i = 0; i < rows[row_id][xmlvars.root][xmlvars.tr_repeats]; i++) {
                    table.rows.push({
                        className: rows[row_id][xmlvars.root][xmlvars.table_class_name] || '',
                        cells    : []
                    });
                }
            } else {
                table.rows.push(row);
            }
        }

        compiledDocument.tables.push(table);
    }

    return compiledDocument;
};

/**
 * Get SVG path2d value from expression
 * 
 * @param {object} dataObj
 * @param {array}  args
 * 
 * @returns {string}
 */
extractPath = function(dataObj, args) {
    var variableSource = dataObj[xmlvars.shapesGeometry][0][xmlvars.svgEquations]
      , variables      = {};

    for (var i = 0; i < variableSource.length; i++) {
        var name        = variableSource[i][xmlvars.root][xmlvars.block_title];
        variables[name] = variableSource[i][xmlvars.root]['draw:formula'];
    }

    var evaluateVariable = function(name) {
        return evaluateExpression(variables[name]);
    };

    var evaluateExpression = function(expr) {
        var literals;
        if (expr.match('if\\(([^),]+),([^),]+),([^),]+)\\)')) {
            literals = expr.match('if\\(([^),]+),([^),]+),([^),]+)\\)').slice(1);
            return (evaluateLiteral(literals[0]) > 0) ? evaluateLiteral(literals[1]) : evaluateLiteral(literals[2]);
        } else if (expr.match('abs\\(([^)]+)\\)')) {
            literals = expr.match('abs\\(([^)]+)\\)').slice(1);
            return Math.abs(evaluateLiteral(literals[0]));
        } else if (expr.match('([^()-\\s]+[\\s]?)-([^()-\\s]+[\\s]?)')) {
            literals = expr.match('([^()-\\s]+[\\s]?)-([^()-\\s]+[\\s]?)').slice(1);
            return evaluateLiteral(literals[0]) - evaluateLiteral(literals[1]);
        }
    };

    var evaluateLiteral = function(literal) {
        if (literal.match('^\\?f[\\d]+[\\s]*$')) {
            return evaluateVariable(literal.match('f[\\d]+')[0].trim());
        } else if (literal.match('^\\$[\\d]+[\\s]*$')) {
            return args[literal.match('[\\d]+')[0].trim()];
        } else if (!isNaN(parseFloat(literal.trim()))) {
            return parseFloat(literal.trim());
        }
        console.error("couldn't evaluate literal '" + literal + "'");
        return literal;
    };

    var pathSource = dataObj[xmlvars.shapesGeometry][0][xmlvars.root][xmlvars.shapePath]
      , loopLimit  = 1000 // to avoid infinite loop
      , path       = pathSource;

    while (path.match('\\?f[\\d]+')) {
        var variable        = path.match('\\?f[\\d]+')[0].slice(1)
          , calculatedValue = evaluateVariable(variable);

        path = path.replace('?' + variable, calculatedValue);
        if (loopLimit-- < 0) {
            console.error('loopLimit is out, looks like you have got an infinite loop here');
        }
    }

    // Curves converting
    var currentX  = 0
      , currentY  = 0
      , arcFactor = 0.5522847498
      , qx        = function(x, y) {
            var dx   = x - currentX
              , dy   = y - currentY
              , cp1x = currentX + dx * arcFactor // Calculate first control point
              , cp1y = currentY                  // starts out horizontal
              , cp2x = x                         // Calculate second control point
              , cp2y = y - dy * arcFactor;
            currentX = x;
            currentY = y;
            return "C " + cp1x + " " + cp1y + " " + cp2x + " " + cp2y + " " + x + " " + y;
        }
      , qy = function(x, y) {
            var dx   = x - currentX
              , dy   = y - currentY
              , cp1x = currentX           // Calculate first control point, starts out vertical
              , cp1y = currentY + dy * arcFactor
              , cp2x = x - dx * arcFactor // Calculate second control point
              , cp2y = y;
            currentX = x;
            currentY = y;
            return "C " + cp1x + " " + cp1y + " " + cp2x + " " + cp2y + " " + x + " " + y;
        };
    while (/(\d+)\s(\d+)\sX\s(\d+)\s(\d+)/.test(path)) {
        var parsed = /(\d+)\s(\d+)\sX\s(\d+)\s(\d+)/.exec(path);
        currentX   = parseFloat(parsed[1]);
        currentY   = parseFloat(parsed[2]);
        path       = path.replace(/X\s(\d+)\s(\d+)/, qx(parseFloat(parsed[3]), parseFloat(parsed[4])));
    }

    while (/(\d+)\s(\d+)\sY\s(\d+)\s(\d+)/.test(path)) {
        var parsed = /(\d+)\s(\d+)\sY\s(\d+)\s(\d+)/.exec(path);
        currentX   = parseFloat(parsed[1]);
        currentY   = parseFloat(parsed[2]);
        path       = path.replace(/Y\s(\d+)\s(\d+)/, qy(parseFloat(parsed[3]), parseFloat(parsed[4])));
    }

    return path;
};