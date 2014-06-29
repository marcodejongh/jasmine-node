(function() {

// patch for JUnitXmlReporter.writeFile
function _writeFile (path, filename, text) {
    var errors = [];

    function getQualifiedFilename(separator) {
        if (separator && path && path.substr(-1) !== separator && filename.substr(0) !== separator) {
            return path + separator + filename;
        }
        return path + filename;
    }


    function rhinoWrite (path, filename, text) {
        // turn filename into a qualified path
        if (path) {
            filename = getQualifiedFilename(java.lang.System.getProperty("file.separator"));
            // create parent dir and ancestors if necessary
            var file = java.io.File(filename);
            var parentDir = file.getParentFile();
            if (!parentDir.exists()) {
                parentDir.mkdirs();
            }
        }
        // finally write the file
        var out = new java.io.BufferedWriter(new java.io.FileWriter(filename));
        out.write(text);
        out.close();
    }

    function phantomWrite (path, filename, text) {
        // turn filename into a qualified path
        filename = getQualifiedFilename(window.fs_path_separator);

        // PhantomJS, via a method injected by phantomjs-testrunner.js
        __phantom_writeFile(filename, text);
    }

    function nodeWrite (path, filename, text) {
        var fs = require("fs");
        var nodejs_path = require("path");
        var filepath = nodejs_path.join(path, filename)
        var fd = fs.openSync(filepath, "w");
        fs.writeSync(fd, text, 0);
        fs.closeSync(fd);
    }

    try {
        rhinoWrite(path, filename, text);
        return;
    } catch (e) {
        errors.push('  Rhino attempt: ' + e.message);
    }

    try {
        phantomWrite(path, filename, text);
        return;
    } catch (f) {
        errors.push('  PhantomJs attempt: ' + f.message);
    }

    try {
        nodeWrite(path, filename, text);
        return;
    } catch (g) {
        errors.push('  NodeJS attempt: ' + g.message);
    }

    this.log("Warning: writing junit report failed for '" + path + "', '" +
             filename + "'. Reasons:\n" +
             errors.join("\n"))
}


exports.writeFile = _writeFile;

})();
