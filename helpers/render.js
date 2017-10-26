// use mustache to render html pages
// ---


var fs = require('fs'),
    mustache = require('mustache');


exports.view = function(templateName, values, respone){
  var fileContents = fs.readFileSync("./views/"+templateName+".html", {encoding: "utf8"});
  fileContents = mustache.render(fileContents, values);
  respone.write(fileContents);
}

exports.compile = function(templateName, values, cb){
  var fileContents = fs.readFileSync("./views/"+templateName+".html", {encoding: "utf8"});
  fileContents = mustache.render(fileContents, values);
  cb(fileContents);
}
