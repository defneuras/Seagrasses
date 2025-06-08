// Load the orthoimage
var orthoimage = ee.Image(
  "projects/ee-urasdefne/assets/cc743463-3e58-479b-a950-7cd399370faa",
);
Map.addLayer(
  orthoimage,
  { bands: ["b1", "b2", "b3"], min: 0, max: 255 },
  "Orthoimage",
);

// Specify the region of interest using the image dimensions and origin
var region = ee.Geometry.Rectangle([
  28.0377309870714058, 36.8298397339722001, 28.0377885369331317,
  36.8298932958475262,
]);

// Center the map view on the specified region
Map.centerObject(region, 15);

// Extract pixel size information from metadata
var pixelSizeX = 2.241911247600425631e-8;
var pixelSizeY = -1.802216531834611715e-8;

// Calculate scale based on pixel size
var scale = Math.max(pixelSizeX, pixelSizeY);

// Convert degrees to meters (approximately, as degrees vary with latitude)
var degreesPerPixel = 2.2419112476004256e-8;
var metersPerPixel = degreesPerPixel * 111320; // 1 degree is approximately 111320 meters
print("Scale (meters per pixel):", metersPerPixel);

// Set threshold values for each band for seagrasses
var threshold_seagrass_b1 = 157.83;
var threshold_seagrass_b2 = 147.92;
var threshold_seagrass_b3 = 134.17;

// Set threshold values for each band for non-seagrasses (sand)
var threshold_sand_b1 = 197.58;
var threshold_sand_b2 = 190.19;
var threshold_sand_b3 = 180.36;

// Create binary masks for each band for seagrasses
var mask_seagrass_b1 = orthoimage.select("b1").gt(threshold_seagrass_b1);
var mask_seagrass_b2 = orthoimage.select("b2").gt(threshold_seagrass_b2);
var mask_seagrass_b3 = orthoimage.select("b3").gt(threshold_seagrass_b3);

// Create binary masks for each band for seagrasses
var mask_sand_b1 = orthoimage.select("b1").gt(threshold_sand_b1);
var mask_sand_b2 = orthoimage.select("b2").gt(threshold_sand_b2);
var mask_sand_b3 = orthoimage.select("b3").gt(threshold_sand_b3);

// Combine the binary masks into a single mask
var seagrassMask = ee
  .Image(mask_seagrass_b1, mask_seagrass_b2, mask_seagrass_b3)
  .reduce(ee.Reducer.allNonZero());
var sandMask = ee
  .Image(mask_sand_b1, mask_sand_b2, mask_sand_b3)
  .reduce(ee.Reducer.allNonZero());

// Display the seagrass mask
Map.addLayer(
  seagrassMask,
  { min: 0, max: 1, palette: ["000000", "00FF00"] },
  "Seagrass Mask",
);
Map.addLayer(
  sandMask,
  { min: 0, max: 1, palette: ["000000", "FFFF00"] },
  "Sand Mask",
);

