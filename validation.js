// Load the sixth orthoimage for validation
var orthoimage6_validation = ee.Image('projects/ee-urasdefne/assets/7196afce-0c7c-4f0c-95e3-2abdd69d0d98');

// Specify the region of interest for validation
var region_validation = ee.Geometry.Rectangle([28.0375041858530913, 36.8298056636676421, 28.0377384655304311, 36.8298958465831276]);

// Center the map view on the specified region
Map.centerObject(region_validation, 15);

// Calculate the scale based on pixel size information
var pixelSizeX_validation = 2.241910787940662737e-08;
var pixelSizeY_validation = -1.802216536482223263e-08;
var scale_validation = Math.max(pixelSizeX_validation, pixelSizeY_validation);

// Add the validation orthoimage to the map
Map.addLayer(orthoimage6_validation, {bands: ['b1'], min: 0, max: 255}, 'Validation Orthoimage');

// Set threshold values for each band for seagrasses in orthoimage6_validation
var threshold_seagrass_b1_6 = 109.5;  
var threshold_seagrass_b2_6 = 125.833;
var threshold_seagrass_b3_6 = 123.66;

// Set threshold values for each band for non-seagrasses (sand) in orthoimage6_validation
var threshold_sand_b1_6 = 217.0196;  
var threshold_sand_b2_6 = 214.176;
var threshold_sand_b3_6 = 202.137;

// Create binary masks for each band for seagrasses in orthoimage6_validation
var mask_seagrass_b1_6 = orthoimage6_validation.select('b1').gt(threshold_seagrass_b1_6);
var mask_seagrass_b2_6 = orthoimage6_validation.select('b2').gt(threshold_seagrass_b2_6);
var mask_seagrass_b3_6 = orthoimage6_validation.select('b3').gt(threshold_seagrass_b3_6);

// Create binary masks for each band for non-seagrasses (sand) in orthoimage6_validation
var mask_sand_b1_6 = orthoimage6_validation.select('b1').gt(threshold_sand_b1_6);
var mask_sand_b2_6 = orthoimage6_validation.select('b2').gt(threshold_sand_b2_6);
var mask_sand_b3_6 = orthoimage6_validation.select('b3').gt(threshold_sand_b3_6);

// Combine the binary masks into a single mask
var seagrassMask_6 = ee.Image(mask_seagrass_b1_6).and(mask_seagrass_b2_6).and(mask_seagrass_b3_6);
var sandMask_6 = ee.Image(mask_sand_b1_6).and(mask_sand_b2_6).and(mask_sand_b3_6);

// Display the seagrass and sand masks for orthoimage6_validation
Map.addLayer(seagrassMask_6, {min: 0, max: 1, palette: ['000000', '00FF00']}, 'Seagrass Mask (Orthoimage 6)');
Map.addLayer(sandMask_6, {min: 0, max: 1, palette: ['000000', 'FFFF00']}, 'Sand Mask (Orthoimage 6)');
