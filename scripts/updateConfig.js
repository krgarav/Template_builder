const fs = require("fs");
const path = require("path");

// Read package.json
const packageJson = require(path.join(__dirname, '..', 'package.json'));


// Read the config.json file
const configPath = path.join(__dirname,"..", "public", "config.json"); // Assuming config.json is in the 'public' folder

fs.readFile(configPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading config.json:", err);
    return;
  }

  // Parse the JSON data
  let config = JSON.parse(data);

  // Update the version from package.json
  config.version = packageJson.version;

  // Write the updated config back to config.json
  fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
    if (err) {
      console.error("Error writing to config.json:", err);
    } else {
      console.log("config.json updated with version:", packageJson.version);
    }
  });
});
