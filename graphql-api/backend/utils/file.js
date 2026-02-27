const path = require('path');
const fs = require('fs');

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', 'images', filePath);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(`clearImage - err`, err);
      throw err;
    }
  });
};

const renameImage = (originalFilename, newFilename) => {
  fs.rename(`images/${originalFilename}`, `images/${newFilename}`, (err) => {
    if (err) {
      throw err;
    }
    console.log('Rename complete!');
  });
};

module.exports = { clearImage, renameImage };
