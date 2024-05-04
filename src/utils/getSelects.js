const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exceptions = []) => {
  let selects = [];
  const selectFiles = getAllFiles(path.join(__dirname, "..", "components", "selects"));

  for (const selectFile of selectFiles) {
    const selectObject = require(selectFile);

    if (exceptions.includes(selectObject.name)) continue;
    selects.push(selectObject);
  }

  return selects;
};
