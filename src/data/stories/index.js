var normalizedPath = require("path").join(__dirname, "stories");

require("fs")
  .readdirSync(normalizedPath)
  .forEach(function(file) {
    require("./" + file);
  });
