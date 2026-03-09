// Fuel Classification from ESA WorldCover 2020

// 1. Define AOIs for 5 states
var stateAois = {
  'MadhyaPradesh': ee.FeatureCollection('projects/gee-01-pons/assets/Madhya_Pradesh_AOI'),
  'Odisha': ee.FeatureCollection('projects/gee-01-pons/assets/Orissa_AOI'),
  'Chhattisgarh': ee.FeatureCollection('projects/gee-01-pons/assets/Chhattisgarh_AOI'),
  'Maharashtra': ee.FeatureCollection('projects/gee-01-pons/assets/Maharashtra_AOI'),
  'AndhraPradesh': ee.FeatureCollection('projects/gee-01-pons/assets/Andhra_Pradesh_AOI')
};

// 2. Load ESA WorldCover 2020
var worldCover = ee.Image('ESA/WorldCover/v100/2020');

// 3. Define fuel classification mapping
// Fuel classes: 1-Forest, 2-Shrub, 3-Grass, 4-Agricultural/Grass, 5-Urban/Non-flammable, 6-Non-flammable
var fuelMap = {
  10: 1, // Tree cover -> Forest
  20: 2, // Shrubland -> Shrub
  30: 3, // Grassland -> Grass
  40: 4, // Cropland -> Agricultural/Grass
  50: 5, // Built-up -> Urban/Non-flammable
  60: 6, // Bare / Sparse -> Non-flammable
  70: 6, // Snow / Ice -> Non-flammable
  80: 6, // Permanent water -> Non-flammable
  90: 3  // Herbaceous wetland -> Grass
};

// Fuel class names and colors
var fuelNames = [
  'Forest',
  'Shrub',
  'Grass',
  'Agricultural / Grass',
  'Urban / Non-flammable',
  'Non-flammable'
];

var fuelPalette = ['006400','ffbb22','ffff4c','f096ff','fa0000','b4b4b4'];

// Remap arrays for ee.Image.remap()
var lulcValues = Object.keys(fuelMap).map(function(k){ return parseInt(k); });
var fuelValues = Object.keys(fuelMap).map(function(k){ return fuelMap[k]; });

// 4. Process each state AOI
Object.keys(stateAois).forEach(function(stateName){
  
  var aoi = stateAois[stateName];
  
  // Clip WorldCover to AOI
  var lulcClip = worldCover.clip(aoi);
  
  // Reclassify to fuel classes
  var fuelImage = lulcClip.remap(lulcValues, fuelValues).rename('FuelClass');
  
  // Display on Map
  Map.centerObject(aoi,6);
  Map.addLayer(fuelImage, {min:1, max:6, palette:fuelPalette}, stateName + ' Fuel Class');
  
  // Export fuel image to Drive
  Export.image.toDrive({
    image: fuelImage,
    description: stateName + '_FuelMap_2020',
    folder: 'ForestFire_FuelMaps',
    scale: 10,
    region: aoi.geometry(),
    crs: 'EPSG:4326',
    maxPixels: 1e13
  });
  
  // Print pixel count per fuel class
  var fuelStats = fuelImage.reduceRegion({
    reducer: ee.Reducer.frequencyHistogram(),
    geometry: aoi,
    scale: 10,
    maxPixels: 1e13
  });
  print(stateName + ' fuel counts:', fuelStats);
  
});

// 6. Add legend panel to Map
var legend = ui.Panel({
  style: {position: 'bottom-right', padding: '8px 15px'}
});

legend.add(ui.Label({
  value: 'Fuel Classes Legend',
  style: {fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0'}
}));

for (var i = 0; i < fuelPalette.length; i++) {
  var colorBox = ui.Label({
    style: {
      backgroundColor: fuelPalette[i],
      padding: '8px',
      margin: '2px 0'
    }
  });
  var description = ui.Label({
    value: fuelNames[i],
    style: {margin: '2px 0 2px 6px'}
  });
  
  var row = ui.Panel([colorBox, description], ui.Panel.Layout.Flow('horizontal'));
  legend.add(row);
}

Map.add(legend);

