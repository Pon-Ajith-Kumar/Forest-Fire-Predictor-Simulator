// Area of Interest (AOI) Extraction

// 1. Define AOIs for 5 states
var stateAois = {
  'MadhyaPradesh': ee.FeatureCollection('projects/gee-01-pons/assets/Madhya_Pradesh_AOI'),
  'Odisha': ee.FeatureCollection('projects/gee-01-pons/assets/Orissa_AOI'),
  'Chhattisgarh': ee.FeatureCollection('projects/gee-01-pons/assets/Chhattisgarh_AOI'),
  'Maharashtra': ee.FeatureCollection('projects/gee-01-pons/assets/Maharashtra_AOI'),
  'AndhraPradesh': ee.FeatureCollection('projects/gee-01-pons/assets/Andhra_Pradesh_AOI')
};

// 2. Merge all AOIs into a single FeatureCollection
var combinedAOI = ee.FeatureCollection([
  stateAois['MadhyaPradesh'],
  stateAois['Odisha'],
  stateAois['Chhattisgarh'],
  stateAois['Maharashtra'],
  stateAois['AndhraPradesh']
]).flatten();

// 3. Merge geometries into a single polygon
var mergedAOI = combinedAOI.union();

// 4. Visualize on Map
Map.centerObject(mergedAOI, 5);
Map.addLayer(mergedAOI, {color: 'red'}, 'Combined AOI');

// 5. Export as GeoJSON to Drive
Export.table.toDrive({
  collection: mergedAOI,
  description: 'Combined_States_AOI',
  fileFormat: 'GeoJSON',
  folder: 'ForestFire_AOIs'
});

