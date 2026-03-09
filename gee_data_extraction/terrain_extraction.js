// DEM + Slope + Aspect Extraction for 5 states

// 1. Define AOIs for 5 states
var stateAois = {
  'MadhyaPradesh': ee.FeatureCollection('projects/gee-01-pons/assets/Madhya_Pradesh_AOI'),
  'Odisha': ee.FeatureCollection('projects/gee-01-pons/assets/Orissa_AOI'),
  'Chhattisgarh': ee.FeatureCollection('projects/gee-01-pons/assets/Chhattisgarh_AOI'),
  'Maharashtra': ee.FeatureCollection('projects/gee-01-pons/assets/Maharashtra_AOI'),
  'AndhraPradesh': ee.FeatureCollection('projects/gee-01-pons/assets/Andhra_Pradesh_AOI')
};

// 2. Visualization parameters
var demViz = {min: 0, max: 2500, palette: ['blue','green','yellow','red']};
var slopeViz = {min: 0, max: 60, palette: ['white','yellow','red']};
var aspectViz = {min: 0, max: 360, palette: ['blue','green','yellow','red']};

// 3. Load Copernicus GLO-30 DEM (ImageCollection)
var demCollection = ee.ImageCollection('COPERNICUS/DEM/GLO30').select('DEM');

// 4. Function to process each state
function processState(stateName, aoi) {
  
  // Mosaic DEM and clip to AOI
  var dem = demCollection.filterBounds(aoi).mosaic().clip(aoi);
  
  // Compute slope and aspect
  var slope = ee.Terrain.slope(dem).rename('Slope');
  var aspect = ee.Terrain.aspect(dem).rename('Aspect');
  
  // Display on Map (optional)
  Map.addLayer(dem, demViz, stateName + ' DEM');
  Map.addLayer(slope, slopeViz, stateName + ' Slope');
  Map.addLayer(aspect, aspectViz, stateName + ' Aspect');
  
  // Export DEM
  Export.image.toDrive({
    image: dem,
    description: stateName + '_DEM_30m',
    folder: 'ForestFire_DEM',
    region: aoi.geometry(),
    scale: 30,
    crs: 'EPSG:4326',
    maxPixels: 1e13
  });
  
  // Export slope
  Export.image.toDrive({
    image: slope,
    description: stateName + '_Slope_30m',
    folder: 'ForestFire_DEM',
    region: aoi.geometry(),
    scale: 30,
    crs: 'EPSG:4326',
    maxPixels: 1e13
  });
  
  // Export aspect
  Export.image.toDrive({
    image: aspect,
    description: stateName + '_Aspect_30m',
    folder: 'ForestFire_DEM',
    region: aoi.geometry(),
    scale: 30,
    crs: 'EPSG:4326',
    maxPixels: 1e13
  });
}

// 5. Loop through each state
for (var state in stateAois) {
  processState(state, stateAois[state]);
}

// 6. Center map on first state
Map.centerObject(stateAois['MadhyaPradesh'], 6);

