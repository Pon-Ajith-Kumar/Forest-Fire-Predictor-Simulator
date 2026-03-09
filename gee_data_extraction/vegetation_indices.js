// Monthly Vegetation Indices Extraction

// 1. Define AOIs
var stateAois = {
  'MadhyaPradesh': ee.FeatureCollection('projects/gee-01-pons/assets/Madhya_Pradesh_AOI'),
  'Odisha': ee.FeatureCollection('projects/gee-01-pons/assets/Orissa_AOI'),
  'Chhattisgarh': ee.FeatureCollection('projects/gee-01-pons/assets/Chhattisgarh_AOI'),
  'Maharashtra': ee.FeatureCollection('projects/gee-01-pons/assets/Maharashtra_AOI'),
  'AndhraPradesh': ee.FeatureCollection('projects/gee-01-pons/assets/Andhra_Pradesh_AOI')
};

// 2. Year
var year = 2022; //Can change from 2021 to 2025 based on the data to be collected

var startDate = ee.Date.fromYMD(year,1,1);
var endDate = ee.Date.fromYMD(year,12,31);

// 3. Sentinel-2
var s2 = ee.ImageCollection('COPERNICUS/S2_SR')
            .filterDate(startDate, endDate)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30));

// 4. Indices
function addIndices(image){

  var ndvi = image.normalizedDifference(['B8','B4']).rename('NDVI');

  var nbr = image.normalizedDifference(['B8','B12']).rename('NBR');

  var ndwi = image.normalizedDifference(['B3','B8']).rename('NDWI');

  return image.addBands([ndvi,nbr,ndwi]);
}

var s2WithIndices = s2.map(addIndices)
                      .select(['NDVI','NBR','NDWI']);


// Visualization (January for all states)

var sampleStart = ee.Date.fromYMD(year,1,1);
var sampleEnd = sampleStart.advance(1,'month');

var sampleComposite = s2WithIndices
                        .filterDate(sampleStart,sampleEnd)
                        .median();


// visualization
var ndviVis = {min:-0.5,max:0.8,palette:['blue','white','green']};
var nbrVis  = {min:-0.5,max:0.8,palette:['white','orange','red']};
var ndwiVis = {min:-0.5,max:0.8,palette:['brown','white','blue']};


// Loop through states and show samples
for (var stateName in stateAois){

  var aoi = stateAois[stateName];

  var clipped = sampleComposite.clip(aoi);

  Map.addLayer(clipped.select('NDVI'), ndviVis, stateName + ' NDVI');

  Map.addLayer(clipped.select('NBR'), nbrVis, stateName + ' NBR');

  Map.addLayer(clipped.select('NDWI'), ndwiVis, stateName + ' NDWI');

}

// center map on India
Map.setCenter(80,20,5);

// Monthly Export
var months = ee.List.sequence(1,12);

months.evaluate(function(monthList){

  monthList.forEach(function(m){

    var start = ee.Date.fromYMD(year,m,1);
    var end = start.advance(1,'month');

    var monthlyComposite = s2WithIndices
                            .filterDate(start,end)
                            .median();

    for (var stateName in stateAois){

      var aoi = stateAois[stateName];

      var monthlyClipped = monthlyComposite.clip(aoi);

      Export.image.toDrive({

        image: monthlyClipped,

        description: stateName + '_' + (m<10?'0'+m:m) + '_' + year,

        folder: 'ForestFire_Indices',

        scale: 375,

        region: aoi.geometry(),

        crs: 'EPSG:4326',

        maxPixels: 1e13

      });

    }

  });

});
