# 🔥 Forest Fire Prediction & Spread Simulator 🔥

A geospatial artificial intelligence system for **predicting next-day forest fire probability and simulating wildfire spread** using satellite imagery, terrain information, vegetation indices, and meteorological variables.

This project integrates **remote sensing**, **geospatial analysis**, and **deep learning** to build a **high-resolution wildfire risk prediction framework**.

---

# Project Motivation

Forest fires are among the most destructive natural hazards affecting ecosystems, biodiversity, and human settlements. Each year, large forest areas are damaged due to uncontrolled wildfire events, leading to ecological imbalance, loss of wildlife habitat, and economic impacts on surrounding communities.

The occurrence and spread of forest fires depend on several environmental factors, including:

* Vegetation type and fuel load
* Terrain elevation and slope
* Weather conditions
* Vegetation moisture
* Human land use patterns

These factors interact in complex ways, making wildfire prediction a challenging spatio-temporal problem. Most existing wildfire monitoring systems rely on **post-event satellite detection**, identifying fires only **after ignition has occurred**. While useful for monitoring active fires, such systems have limited capability for **early risk prediction and prevention**.

This project is motivated by the **ISRO Bharatiya Antariksh Hackathon (BAH) 2025 problem statement**, which encourages the use of satellite data, geospatial analytics, and artificial intelligence to address real-world environmental challenges. In particular, it highlights the need for innovative solutions that leverage Earth observation data to improve monitoring and prediction of natural hazards such as forest fires.

In response to this challenge, this project aims to develop a **satellite-driven wildfire prediction and simulation framework** that integrates environmental variables, remote sensing data, and deep learning models.

The system focuses on:

1. Predicting the **probability of wildfire occurrence** using deep learning models.
2. Simulating **spatial fire spread dynamics** using Cellular Automata.
3. Supporting **wildfire risk analysis and decision-making** through geospatial modeling.

By combining **satellite data, environmental variables, and machine learning**, this project aims to contribute toward improved **early wildfire risk detection and disaster preparedness**.

---

# 🌍 Study Area

The study area includes **five wildfire-prone states in India**:

* Madhya Pradesh
* Maharashtra
* Chhattisgarh
* Odisha
* Andhra Pradesh

These regions contain large areas of:

* Tropical dry deciduous forests
* Seasonal grasslands
* Agricultural land
* Dense vegetation cover

These ecosystems experience **seasonal wildfire activity during dry months**.

---

## Combined Study Region

The five states were merged to create a single **combined Area of Interest (AOI)** for analysis.

Image placeholder:

```
docs/images/combined_aoi.png
```

---

# System Architecture

The wildfire prediction system follows a **multi-stage geospatial machine learning pipeline**.

```
Satellite Data
      ↓
Geospatial Data Processing
      ↓
Environmental Feature Engineering
      ↓
Multi-band Raster Stack Generation
      ↓
U-Net Deep Learning Model
      ↓
Fire Probability Prediction
      ↓
Cellular Automata Spread Simulation
      ↓
Interactive Visualization Dashboard
```

---

# 🛰 Data Collection Pipeline

The predictive model requires a variety of environmental datasets.

Data was collected using **Google Earth Engine** and processed into raster layers.

The following data categories were collected:

1. Terrain Data
2. Fuel Type Classification
3. Vegetation Indices
4. Meteorological Data

---

# 1 Terrain Data Collection

Terrain features significantly influence wildfire behavior.

For example:

* Fires spread faster on steep slopes
* South-facing slopes are drier
* Higher elevations may contain different vegetation types

Three terrain variables were extracted:

* Elevation
* Slope
* Aspect

---

## Digital Elevation Model (DEM)

Elevation represents the height of terrain above sea level.

Dataset used:

```
COPERNICUS DEM GLO-30
```

Spatial resolution:

```
30 meters
```

The DEM dataset provides global terrain elevation information.

---

### Processing Steps

1. Load DEM dataset
2. Mosaic multiple tiles
3. Clip data to each AOI
4. Export terrain raster

Example code snippet:

```
var dem = demCollection.filterBounds(aoi)
                       .mosaic()
                       .clip(aoi);
```

---

### DEM Visualization

Image placeholder:

```
docs/images/dem_visualization.png
```

---

## Slope

Slope represents the **steepness of terrain**.

It is measured in **degrees** and calculated from the elevation dataset.

Steeper slopes allow fire to spread more rapidly because:

* Heat rises uphill
* Flames preheat vegetation upslope

Slope was calculated using:

```
ee.Terrain.slope()
```

---

### Slope Visualization

Image placeholder:

```
docs/images/slope_visualization.png
```

---

## Aspect

Aspect represents the **direction a slope faces**.

It ranges from:

```
0° → North
90° → East
180° → South
270° → West
```

Aspect affects wildfire behavior because:

* South-facing slopes receive more sunlight
* Vegetation becomes drier
* Fire risk increases

Aspect was calculated using:

```
ee.Terrain.aspect()
```

---

### Aspect Visualization

Image placeholder:

```
docs/images/aspect_visualization.png
```

---

# 2 Fuel Type Mapping

Wildfire spread depends heavily on **fuel availability**.

Fuel refers to **vegetation that can burn**.

Fuel maps were created using the **ESA WorldCover 2020 dataset**.

Dataset:

```
ESA/WorldCover/v100/2020
```

Spatial resolution:

```
10 meters
```

---

## Land Cover to Fuel Mapping

The original land cover classes were converted into **fire fuel categories**.

| Land Cover | Fuel Category     |
| ---------- | ----------------- |
| Tree Cover | Forest            |
| Shrubland  | Shrub             |
| Grassland  | Grass             |
| Cropland   | Agricultural fuel |
| Built-up   | Non-flammable     |
| Bare land  | Non-flammable     |
| Water      | Non-flammable     |

---

## Fuel Classes Used in the Model

| Fuel Class | Description           |
| ---------- | --------------------- |
| 1          | Forest                |
| 2          | Shrub                 |
| 3          | Grass                 |
| 4          | Agricultural / Grass  |
| 5          | Urban / Non-flammable |
| 6          | Non-flammable         |

---

### Fuel Classification Map

Image placeholder:

```
docs/images/fuel_classification.png
```

---

# 3 Vegetation Indices

Vegetation indices help measure:

* vegetation health
* biomass
* vegetation moisture
* burn severity

Satellite imagery from **Sentinel-2** was used.

Dataset:

```
COPERNICUS/S2_SR
```

Spatial resolution:

```
10 meters
```

Cloud filtering threshold:

```
CLOUDY_PIXEL_PERCENTAGE < 30
```

---

# NDVI (Normalized Difference Vegetation Index)

NDVI measures **vegetation greenness and density**.

Formula:

```
NDVI = (NIR − Red) / (NIR + Red)
```

Bands used:

```
B8 → Near Infrared
B4 → Red
```

Higher NDVI values indicate:

* dense vegetation
* higher biomass
* potential fuel load

---

### NDVI Visualization

Image placeholder:

```
docs/images/ndvi_visualization.png
```

---

# NBR (Normalized Burn Ratio)

NBR measures **burn severity and vegetation dryness**.

Formula:

```
NBR = (NIR − SWIR) / (NIR + SWIR)
```

Bands used:

```
B8 → Near Infrared
B12 → Shortwave Infrared
```

Lower NBR values indicate:

* burned areas
* vegetation stress
* increased fire susceptibility

---

### NBR Visualization

Image placeholder:

```
docs/images/nbr_visualization.png
```

---

# NDWI (Normalized Difference Water Index)

NDWI measures **vegetation water content**.

Formula:

```
NDWI = (Green − NIR) / (Green + NIR)
```

Bands used:

```
B3 → Green
B8 → Near Infrared
```

Lower NDWI values indicate:

* dry vegetation
* increased fire risk

---

### NDWI Visualization

Image placeholder:

```
docs/images/ndwi_visualization.png
```

---

# Monthly Vegetation Composites

Vegetation indices were aggregated into **monthly composites**.

Processing workflow:

1. Filter Sentinel-2 imagery by date
2. Apply cloud filtering
3. Compute vegetation indices
4. Generate monthly median composite
5. Clip to AOI
6. Export raster stack

---

# 4 Meteorological Data

Weather conditions strongly influence wildfire ignition and spread.

Meteorological data was obtained from:

Dataset:

```
ERA5-Land Hourly
```

Provider:

```
ECMWF (European Centre for Medium-Range Weather Forecasts)
```

Spatial resolution:

```
~9 km
```

Temporal resolution:

```
Hourly
```

---

# 🌦 Weather Variables Collected

Eight weather parameters were extracted.

---

# 1 Total Precipitation (Rainfall)

Represents daily rainfall accumulation.

Rainfall affects wildfire probability by:

* increasing vegetation moisture
* reducing fire ignition probability

Unit:

```
millimeters
```

---

### Rainfall Visualization

Image placeholder:

```
docs/images/weather_rainfall.png
```

---

# 2 Maximum Temperature

Daily maximum temperature influences:

* vegetation dryness
* evaporation rates
* fire ignition potential

Unit:

```
degrees Celsius
```

---

### Maximum Temperature Visualization

Image placeholder:

```
docs/images/weather_tmax.png
```

---

# 3 Minimum Temperature

Minimum temperature affects:

* nighttime moisture recovery
* vegetation drying patterns

Unit:

```
degrees Celsius
```

---

### Minimum Temperature Visualization

Image placeholder:

```
docs/images/weather_tmin.png
```

---

# 4 Mean Temperature

Mean daily temperature represents the **overall heat conditions of the day**.

Higher mean temperatures typically correlate with increased fire risk.

---

### Mean Temperature Visualization

Image placeholder:

```
docs/images/weather_tmean.png
```

---

# 5 Dew Point Temperature

Dew point represents **air moisture content**.

Higher dew point values indicate:

* moist air
* reduced wildfire risk

Lower dew point values indicate:

* dry air
* increased fire risk

---

### Dew Point Visualization

Image placeholder:

```
docs/images/weather_dewpoint.png
```

---

# 6 Relative Humidity

Relative humidity represents **moisture in the atmosphere**.

Lower humidity levels allow vegetation to dry out more quickly.

Relative humidity is calculated using:

```
dew point temperature
air temperature
```

Unit:

```
percentage
```

---

### Relative Humidity Visualization

Image placeholder:

```
docs/images/weather_humidity.png
```

---

# 7 Wind Speed

Wind speed is one of the most important wildfire spread drivers.

Higher wind speeds cause:

* faster fire spread
* longer flame lengths
* spotting behavior

Unit:

```
meters per second
```

---

### Wind Speed Visualization

Image placeholder:

```
docs/images/weather_windspeed.png
```

---

# 8 Wind Direction

Wind direction determines **fire spread direction**.

It is calculated from wind vector components:

```
U component
V component
```

Values range from:

```
0° – 360°
```

---

### Wind Direction Visualization

Image placeholder:

```
docs/images/weather_winddir.png
```

---

# Multi-Band Weather Stack

All daily weather variables were combined into a **multi-band raster stack**.

Example band naming:

```
Rain_mm_20220101
Tmax_C_20220101
RH_20220101
WindSpeed_20220101
```

This dataset contains **365 days × 8 weather variables**.

---

## Dataset Summary

The wildfire prediction model relies on multiple geospatial datasets representing terrain, vegetation conditions, fuel availability, and meteorological variables.  
These datasets were collected and processed using **Google Earth Engine** and exported as raster layers for model training.

| Data Type | Dataset | Resolution | Variables / Features |
|----------|---------|------------|----------------------|
| Terrain | Copernicus DEM GLO-30 | 30 m | Elevation, Slope, Aspect |
| Land Cover / Fuel | ESA WorldCover 2020 | 10 m | Fuel Classes (Forest, Shrub, Grass, Agricultural, Urban, Non-flammable) |
| Vegetation | Sentinel-2 Surface Reflectance | 10 m | NDVI, NBR, NDWI |
| Meteorological | ERA5-Land Hourly | ~9 km | Rainfall, Tmax, Tmin, Mean Temperature, Dew Point, Relative Humidity, Wind Speed, Wind Direction |
| Fire Labels | Satellite Fire Detection Products | ~375 m | Historical Fire Occurrence |
| Study Region | State AOI Boundaries | Vector | Madhya Pradesh, Maharashtra, Chhattisgarh, Odisha, Andhra Pradesh |

These datasets were converted to **same spatial resolution** and then combined into **multi-band raster stacks** representing environmental conditions for each spatial location. The stacked features serve as input to the **U-Net deep learning model for fire probability prediction**.

---


# 🧠 Deep Learning Model

A **U-Net convolutional neural network** is used to generate **fire probability maps**.

Framework:

```
PyTorch
```

Architecture:

```
Encoder → Bottleneck → Decoder
```

---
# U-Net Architecture for Forest Fire Probability Prediction

The core predictive component of this project is a **U-Net based deep learning model** designed to generate **pixel-level fire probability maps** from multi-band geospatial raster inputs.

U-Net is a convolutional neural network architecture originally developed for **biomedical image segmentation**, but it has become widely used in **remote sensing, land cover classification, and environmental modeling** because of its ability to capture both **spatial patterns and contextual information**.

In this project, U-Net is used to learn complex relationships between environmental factors such as:

* vegetation health
* terrain features
* fuel types
* meteorological conditions

and predict the **probability of wildfire occurrence at each pixel location**.

---

# Input Data to the U-Net Model

The model takes **multi-band raster stacks** as input. Each pixel contains multiple environmental variables describing the local conditions.

The input tensor structure is:

```
[BATCH_SIZE, CHANNELS, HEIGHT, WIDTH]
```

For this project:

```
Channels = 9
```

These channels represent environmental features such as:

* NDVI (vegetation health)
* NBR (burn susceptibility)
* NDWI (vegetation moisture)
* Terrain slope
* Terrain aspect
* Elevation
* Fuel class
* Weather variables
* Fire history labels

Each raster patch is resized to:

```
64 × 64 pixels
```

Example input tensor:

```
[1, 9, 64, 64]
```

Where:

* **1** → batch size
* **9** → environmental variables
* **64×64** → spatial patch size

---

# Overall U-Net Structure

The U-Net architecture consists of **three main components**:

1. **Encoder (Contracting Path)**
2. **Bottleneck Layer**
3. **Decoder (Expanding Path)**

The architecture forms a **U-shaped structure**, which allows the network to capture both:

* **global contextual information**
* **fine spatial details**

```
Input Image
      │
Encoder (Downsampling)
      │
   Bottleneck
      │
Decoder (Upsampling)
      │
Fire Probability Map
```

---

# Encoder (Contracting Path)

The encoder progressively extracts **high-level spatial features** from the input image.

Each encoder block performs two operations:

1. Convolution layers
2. Downsampling via max pooling

The encoder gradually reduces spatial resolution while increasing feature depth.

### Encoder Block Structure

Each block contains:

```
Conv2D → ReLU
Conv2D → ReLU
MaxPool
```

Example progression of feature channels:

```
Input:        9 channels
Layer 1:     64 channels
Layer 2:    128 channels
Layer 3:    256 channels
Layer 4:    512 channels
```

Spatial size progression:

```
64×64
32×32
16×16
8×8
```

This process allows the model to learn:

* large scale spatial patterns
* relationships between environmental variables

---

# Double Convolution Blocks

Each encoder stage begins with a **DoubleConv block**.

This block contains two convolution layers applied sequentially.

Structure:

```
Conv2D
BatchNorm
ReLU

Conv2D
BatchNorm
ReLU
```

Purpose of the DoubleConv block:

* extract spatial features
* improve feature representation
* stabilize training

This block increases the model's ability to capture **complex spatial relationships between environmental variables**.

---

# Downsampling Layers

Downsampling reduces spatial dimensions while increasing feature abstraction.

This is performed using:

```
MaxPool2D
```

Downsampling allows the model to:

* learn broader spatial context
* reduce computational complexity
* capture large-scale fire risk patterns

---

# Bottleneck Layer

The bottleneck represents the **deepest part of the network**.

At this stage:

* spatial resolution is smallest
* feature representation is richest

Example configuration:

```
Input features: 512
Output features: 1024
```

The bottleneck captures **high-level environmental relationships**, such as:

* terrain–vegetation interactions
* weather–fuel interactions
* spatial fire susceptibility patterns

---

# Decoder (Expanding Path)

The decoder reconstructs the spatial resolution of the image while using the learned features to produce predictions.

Decoder operations include:

```
Upsampling
Concatenation (Skip Connections)
Double Convolution
```

Spatial resolution gradually increases:

```
8×8
16×16
32×32
64×64
```

Feature depth decreases correspondingly.

---

# Upsampling Layers

Upsampling is implemented using:

```
ConvTranspose2D
```

or optionally

```
Bilinear interpolation
```

Upsampling increases spatial resolution so that the network can produce **pixel-level predictions**.

---

# Skip Connections

One of the most important components of U-Net is the **skip connection mechanism**.

Skip connections transfer feature maps from the encoder directly to the decoder.

```
Encoder Feature Map
        │
        └──► Concatenation ──► Decoder
```

Purpose of skip connections:

* preserve spatial details
* recover fine image structures
* improve segmentation accuracy

Without skip connections, the decoder would lose important spatial information during downsampling.

---

# Final Output Layer

The final layer of the U-Net is a **1×1 convolution** that converts decoder feature maps into the prediction output.

Output shape:

```
[Batch, 1, Height, Width]
```

For this project:

```
[1, 1, 64, 64]
```

Each pixel represents:

```
Fire probability score
```

Value range:

```
0 → No fire risk
1 → High fire probability
```

---

# Activation Function

The model outputs **raw logits**, which are converted into probabilities using:

```
Sigmoid activation
```

```
Fire Probability = Sigmoid(logits)
```

This produces a **continuous probability map** rather than a hard classification.

---

# Loss Function

The model uses:

```
Binary Cross Entropy with Logits Loss
```

```
BCEWithLogitsLoss
```

This loss function is suitable for **binary segmentation problems** where each pixel belongs to one of two classes:

```
0 → No Fire
1 → Fire
```

---

# Optimizer

The model is trained using:

```
AdamW optimizer
```

Advantages:

* adaptive learning rate
* weight decay regularization
* stable convergence for deep networks

Learning rate used:

```
1e-4
```

---

# Model Training Strategy

Training is performed using raster patches extracted from geospatial datasets.

Workflow:

```
Raster stacks
      ↓
Patch extraction
      ↓
Tensor conversion
      ↓
U-Net training
      ↓
Fire probability prediction
```

The model learns spatial relationships between environmental variables and wildfire occurrence.

---

# Model Output

The final model produces **high-resolution fire probability maps**.

Example output structure:

```
64 × 64 probability map
```

Each pixel represents the likelihood of fire occurrence based on:

* terrain conditions
* vegetation health
* fuel availability
* weather conditions

These probability maps are then used as input to the **Cellular Automata fire spread simulator** in the next stage of the project.

---

# 📌 Future Work

Upcoming development stages:

* Cellular Automata wildfire spread model
* Terrain-aware fire propagation simulation
* Interactive wildfire risk dashboard
* Streamlit web deployment

---
# Author

Pon Ajith Kumar P (AI/Machine Learning & Geospatial Enthusiast)

---
