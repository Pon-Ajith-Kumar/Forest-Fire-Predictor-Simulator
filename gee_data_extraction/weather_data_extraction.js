// ERA5-Land Fire Weather Variables 

// 1. Import AOIs
var stateAois = {
  'MadhyaPradesh': ee.FeatureCollection('projects/gee-01-pons/assets/Madhya_Pradesh_AOI'),
  'Odisha': ee.FeatureCollection('projects/gee-01-pons/assets/Orissa_AOI'),
  'Chhattisgarh': ee.FeatureCollection('projects/gee-01-pons/assets/Chhattisgarh_AOI'),
  'Maharashtra': ee.FeatureCollection('projects/gee-01-pons/assets/Maharashtra_AOI'),
  'AndhraPradesh': ee.FeatureCollection('projects/gee-01-pons/assets/Andhra_Pradesh_AOI')
};

// 2. Define date range
var start = ee.Date('2022-01-01');
var end   = ee.Date('2022-12-31');

// 3. Load ERA5-Land Hourly
var era5 = ee.ImageCollection("ECMWF/ERA5_LAND/HOURLY")
              .filterDate(start, end)
              .select([
                'total_precipitation',
                'temperature_2m',
                'dewpoint_temperature_2m',
                'u_component_of_wind_10m',
                'v_component_of_wind_10m'
              ]);

// 4. Function to aggregate hourly → daily
function dailyAggregate(date) {

  date = ee.Date(date);

  var dayCol = era5.filterDate(date, date.advance(1, 'day'));

  var rain = dayCol.select('total_precipitation')
                   .sum()
                   .multiply(1000)
                   .rename('Rain_mm');

  var tmax = dayCol.select('temperature_2m')
                   .max()
                   .subtract(273.15)
                   .rename('Tmax_C');

  var tmin = dayCol.select('temperature_2m')
                   .min()
                   .subtract(273.15)
                   .rename('Tmin_C');

  var tmean = dayCol.select('temperature_2m')
                    .mean()
                    .subtract(273.15)
                    .rename('Tmean_C');

  var tdew = dayCol.select('dewpoint_temperature_2m')
                   .mean()
                   .subtract(273.15)
                   .rename('Tdew_C');

  var es = tmean.expression(
      '6.112 * exp((17.67 * T) / (T + 243.5))', {'T': tmean});

  var e_dew = tdew.expression(
      '6.112 * exp((17.67 * Td) / (Td + 243.5))', {'Td': tdew});

  var rh = e_dew.divide(es)
                .multiply(100)
                .clamp(0,100)
                .rename('RH');

  var u = dayCol.select('u_component_of_wind_10m').mean();
  var v = dayCol.select('v_component_of_wind_10m').mean();

  var wspd = u.pow(2).add(v.pow(2)).sqrt().rename('WindSpeed');

  var wdir = u.atan2(v).multiply(180/Math.PI).rename('WindDir');

  return ee.Image.cat([rain, tmax, tmin, tmean, tdew, rh, wspd, wdir])
                 .set('date', date.format('YYYY-MM-dd'));
}

// 5. Generate list of dates
var nDays = end.difference(start, 'day');

var dates = ee.List.sequence(0, nDays.subtract(1))
                  .map(function(d){
                    return start.advance(d, 'day');
                  });

// 6. Build daily collection
var dailyCollection = ee.ImageCollection(dates.map(dailyAggregate));

// 7. Flatten to single multi-band image
var bandNames = dailyCollection.aggregate_array('date').map(function(d){

  d = ee.Date(d).format('YYYYMMdd');

  return ee.List([
      'Rain_mm','Tmax_C','Tmin_C','Tmean_C',
      'Tdew_C','RH','WindSpeed','WindDir'
  ]).map(function(v){
      return ee.String(v).cat('_').cat(d);
  });

}).flatten();

var stackedImage = dailyCollection.toBands().rename(bandNames);


// 8. Preview sample day
var sampleDate = '20220101';

var sampleBands = [
  'Rain_mm_' + sampleDate,
  'Tmax_C_' + sampleDate,
  'Tmin_C_' + sampleDate,
  'Tmean_C_' + sampleDate,
  'Tdew_C_' + sampleDate,
  'RH_' + sampleDate,
  'WindSpeed_' + sampleDate,
  'WindDir_' + sampleDate
];

var visParams = {};
visParams['Rain_mm_' + sampleDate] = {min:0, max:20, palette:['white','blue']};
visParams['Tmax_C_' + sampleDate] = {min:20, max:45, palette:['blue','yellow','red']};
visParams['Tmin_C_' + sampleDate] = {min:5, max:30, palette:['blue','cyan','green']};
visParams['Tmean_C_' + sampleDate] = {min:10, max:35, palette:['blue','green','yellow']};
visParams['Tdew_C_' + sampleDate] = {min:-5, max:25, palette:['white','green']};
visParams['RH_' + sampleDate] = {min:0, max:100, palette:['white','blue']};
visParams['WindSpeed_' + sampleDate] = {min:0, max:15, palette:['white','orange','red']};
visParams['WindDir_' + sampleDate] = {min:0, max:360, palette:['blue','green','yellow','red']};


// Display samples for all states
for (var stateName in stateAois){

  var aoi = stateAois[stateName];

  sampleBands.forEach(function(band){

    Map.addLayer(
      stackedImage.select(band).clip(aoi),
      visParams[band],
      stateName + '_' + band
    );

  });

}

Map.setCenter(80,20,5);


// 9. Export for each state
for (var stateName in stateAois){

  var aoi = stateAois[stateName];

  Export.image.toDrive({

    image: stackedImage.clip(aoi),

    description: stateName + '_Weather_2022_FullYear',

    folder: 'ForestFire_Weather',

    scale: 10000,

    region: aoi.geometry(),

    crs: 'EPSG:4326',

    maxPixels: 1e13

  });

}
