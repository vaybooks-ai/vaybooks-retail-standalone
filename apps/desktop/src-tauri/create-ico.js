const fs = require('fs');
const path = require('path');

// Create a minimal valid ICO file (1x1 pixel, 32-bit RGBA)
// This is a valid ICO format that Windows Resource Compiler will accept

const icoPath = path.join(__dirname, 'icons', 'icon.ico');

// ICO file structure:
// Header (6 bytes)
// Image Directory Entry (16 bytes per image)
// Image Data

// Create a minimal 1x1 pixel image in BMP format (required for ICO)
// BMP header (40 bytes) + pixel data (4 bytes for 32-bit RGBA)

const bmpHeader = Buffer.from([
  // BITMAPINFOHEADER (40 bytes)
  0x28, 0x00, 0x00, 0x00, // Header size (40)
  0x01, 0x00, 0x00, 0x00, // Width (1)
  0x02, 0x00, 0x00, 0x00, // Height (2 - includes AND mask)
  0x01, 0x00,             // Planes (1)
  0x20, 0x00,             // Bits per pixel (32)
  0x00, 0x00, 0x00, 0x00, // Compression (0 = none)
  0x08, 0x00, 0x00, 0x00, // Image size (8 bytes)
  0x00, 0x00, 0x00, 0x00, // X pixels per meter
  0x00, 0x00, 0x00, 0x00, // Y pixels per meter
  0x00, 0x00, 0x00, 0x00, // Colors used
  0x00, 0x00, 0x00, 0x00, // Important colors
]);

// Pixel data (1x1 blue pixel in BGRA format)
const pixelData = Buffer.from([
  0xFF, 0x00, 0x00, 0xFF, // Blue pixel (BGRA)
  0x00, 0x00, 0x00, 0x00, // AND mask (transparency)
]);

const imageData = Buffer.concat([bmpHeader, pixelData]);

// ICO header
const icoHeader = Buffer.from([
  0x00, 0x00, // Reserved
  0x01, 0x00, // Type (1 = ICO)
  0x01, 0x00, // Number of images
]);

// Image directory entry
const imageDir = Buffer.from([
  0x01,                   // Width (1)
  0x01,                   // Height (1)
  0x00,                   // Color count (0 = no palette)
  0x00,                   // Reserved
  0x01, 0x00,             // Color planes (1)
  0x20, 0x00,             // Bits per pixel (32)
  imageData.length & 0xFF, (imageData.length >> 8) & 0xFF, 
  (imageData.length >> 16) & 0xFF, (imageData.length >> 24) & 0xFF, // Size
  0x16, 0x00, 0x00, 0x00, // Offset (22 = 6 + 16)
]);

// Combine all parts
const icoFile = Buffer.concat([icoHeader, imageDir, imageData]);

// Write the file
fs.writeFileSync(icoPath, icoFile);
console.log('Valid ICO file created at', icoPath);
