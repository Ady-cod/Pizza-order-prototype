const { readFile } = require("fs/promises");

const fileReaderAsync = async (filePath) => {
  try {
    return await readFile(filePath);
  } catch (error) {
    console.error(`File reading error: ${error.message}`);
  }
};

const { writeFile } = require("fs/promises");

const fileWriterAsync = async (filePath, content) => {
  try {
    return await writeFile(filePath, content);
  } catch (error) {
    console.error(`File writing error: ${error.message}`);
  }
};

module.exports = { fileReaderAsync, fileWriterAsync };
