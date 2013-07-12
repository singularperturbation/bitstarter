#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var rest = require('restler');

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

function checkUrl(result){
  if (result instanceof Error){
    console.error(result.message);
    process.exit(1);
  }
  else{
    console.log(result);
  }
}

// Horrible coding practice: I'm copying from function block above.
// However, this is near deadline for this HW so I'mm doing it anyway.
// How to fix in future (if ever): rewrite checkHtmlFile to be checkFunc() with optional file parameter
var buildUrlFunc = function(checkFile){
  var urlCheck = function(result){
     if (result instanceof Error){
       console.error(result.message);
       process.exit(1);
     }
     else{
       var checks = loadChecks(checkFile);
       var $ = cheerio.load(result);
       console.log($);
       var checkJson = {};
       for (var ii in checks){
         var present = $(checks[ii]).length > 0;
         checkJson[checks[ii]] = present;
       }
       console.log(JSON.stringify(checkJson,null,4));
     }
  }
  return urlCheck;
}

if(require.main == module) {
    program
      // Syntax here is: flags (as well as text to be displayed with --help), function to run on input, default value 
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <url_address>', 'Path of url to pull in') 
        .parse(process.argv);
    if (program.url != null){ 
      var urlCheck = buildUrlFunc(program.checks); 
      rest.get(program.url).on('complete',urlCheck);
    }
    else{
      var checkJson = checkHtmlFile(program.file, program.checks);
      var outJson = JSON.stringify(checkJson, null, 4);
      console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
