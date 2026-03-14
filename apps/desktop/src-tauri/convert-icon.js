const fs = require('fs');
const path = require('path');

// Read the PNG file
const pngPath = path.join(__dirname, 'icons', 'vaybooks.png');
const icoPath = path.join(__dirname, 'icons', 'icon.ico');

// Read PNG and create a simple ICO wrapper
// This is a minimal ICO file that wraps the PNG data
const pngData = fs.readFileSync(pngPath);

// ICO header for a single image
const icoHeader = Buffer.from([
  0x00, 0x00, // Reserved
  0x01, 0x00, // Type (1 = ICO)
  0x01, 0x00, // Number of images
]);

// Image directory entry (32x32 at 32-bit color)
const imageDir = Buffer.from([
  0x20, 0x20, // Width
  0x20, 0x20, // Height
  0x00,       // Color count
  0x00,       // Reserved
  0x01, 0x00, // Color planes
  0x20, 0x00, // Bits per pixel
  0x00, 0x04, 0x00, 0x00, // Size of image data
  0x16, 0x00, 0x00, 0x00, // Offset to image data
]);

// Combine header, directory, and PNG data
const icoData = Buffer.concat([icoHeader, imageDir, pngData]);

// Write ICO file
fs.writeFileSync(icoPath, icoData);
console.log('Icon created successfully at', icoPath);
