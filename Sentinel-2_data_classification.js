// Load S-2 imagery and filter it to all images in May-August 2023.
var S2data = ee.ImageCollection('COPERNICUS/S2_SR')
    .filterDate('2023-05-01', '2023-08-01')
    .filterBounds(poi)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 40));
var region = poi

var count = S2data.size();
print('Number of images in the collection:', count);

// Check the band names of the first image in the collection
var firstImage = ee.Image(S2data.first());
print('Band names of the first image:', firstImage.bandNames());

// Take median
var S2composite = S2data.median();
    
// Create Land mask
var B8 = S2composite.select('B8');
var NIR_thres = 500;
var landmask = B8.where(B8.gt(NIR_thres), 0).where(B8.lt(NIR_thres), 1);

// Take median of the land mask
var landmaskMedian = landmask.reduce(ee.Reducer.median());

// Add the median land mask to the map
var rgbVis = {min: 0, max: 3000, bands: ['B8']};
Map.addLayer(S2composite, rgbVis, 'S2 NIR Band');
Map.addLayer(landmaskMedian.clip(poi), {palette: ['000000', 'FFFFFF'], opacity: 0.5}, 'Land Mask Median');

// Export seagrasses FeatureCollection to an asset
Export.table.toAsset({
  collection: seagrass,
  description: 'seagrass_asset', 
  assetId: 'users/urasdefne/path/to/seagrasses', 
});

// Export sand FeatureCollection to an asset
Export.table.toAsset({
  collection: sand,
  description: 'sand_asset', 
  assetId: 'users/urasdefne/path/to/sand', 
});


// Classification

// Training data
var seagrass = ee.FeatureCollection('users/urasdefne/seagrass');
var sand = ee.FeatureCollection('users/urasdefne/sand');
var trainingPolygons = seagrass.merge(sand);

// Define the bands to use for classification
var bands = ['B2', 'B3', 'B4', 'B8'];

// Print the band names of the Sentinel-2 image
print('Band names:', S2composite.bandNames());

// Sample the Sentinel-2 image at the locations of  training data
var training = S2composite.select(bands).sampleRegions({
  collection: trainingPolygons,
  properties: ['class'],  
  scale: 10  
});

// Print the first feature to check if it has the sampled bands
print('First sampled feature:', training.first());

// Train a Random Forest classifier
var classifier = ee.Classifier.smileRandomForest({
  numberOfTrees: 10,
  minLeafPopulation: 1
}).train({
  features: training,
  classProperty: 'class',
  inputProperties: bands
});

// Classify the Sentinel-2 image
var classified = S2composite.select(bands).classify(classifier);

// Mask out non-coastal areas using the land mask
var landmaskClipped = landmask.clip(poi).eq(1);
var classifiedMasked = classified.updateMask(landmaskClipped);

// Add the masked classification to the map with an improved color palette
Map.centerObject(poi, 10);
Map.addLayer(classifiedMasked, {
  min: 0,
  max: 2,
  palette: ['00FF00', 'FF0000'],  // Blue for sand, Green for seagrass, Red for unclassified
}, 'Seagrass and Sand Classification (Coastal Only)');
Map.addLayer(poi, {}, 'POI');

// Display the map
Map;


// Classify the Sentinel-2 image
var classified = S2composite.select(bands).classify(classifier);

// Add the classified image to the map with an improved color palette
Map.centerObject(poi, 10);
Map.addLayer(classified, {
  min: 0,
  max: 2,
  palette: ['0000FF', '00FF00', 'FF0000'],  // Blue for sand, Green for seagrass, Red for unclassified
}, 'Seagrass and Sand Classification');
Map.addLayer(poi, {}, 'POI');

// Display the map
Map;

// Print and inspect the classified image to see the pixel values and identify any patterns or issues
print('Number of features in seagrass:', seagrass.size());
print('Number of features in sand:', sand.size());
print('Training Data:', trainingPolygons);
print('Classifier:', classifier);
print('Classified Image:', classified);
var landmask = B8.where(B8.gt(NIR_thres), 0).where(B8.lt(NIR_thres), 1);

// Inspect Training Data Properties
var firstTrainingFeature = trainingPolygons.first();
print('Training Feature Properties:', firstTrainingFeature);

// Class distribution
var classDistribution = classified.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: poi,
  scale: 10,
});

print('Class distribution:', classDistribution.get('classification'));

// Set a threshold to convert continuous values to binary (e.g., 1 if value > threshold, else 0)
var threshold = 1;
var binaryClassification = classified.gt(1);

// Add the binary classification map to the map
Map.addLayer(binaryClassification, {
  min: 0,
  max: 1,
  palette: ['0000FF', '00FF00'],  // Blue for class 0, Green for class 1
}, 'Binary Seagrass and Sand Classification');

// Splitting the datasets for training and validation
var split = 0.7; // 70% for training, 30% for validation
var seagrassSplit = seagrass.randomColumn().filter(ee.Filter.lt('random', split));
var sandSplit = sand.randomColumn().filter(ee.Filter.lt('random', split));

// Assuming 'seagrass' and 'sand' are your reference data
var validationData = seagrass.merge(sand).filter(ee.Filter.gte('random', split));

// Get validation accuracy
var validated = validationData.classify(classifier);
var errorMatrix = validated.errorMatrix('classification', 'classification'); // Use 'classification' for both actual and predicted class labels
print('Error Matrix', errorMatrix);
print('Accuracy', errorMatrix.accuracy());

