var county_list = "/counties";

function init() {
    // Grab a reference to the dropdown select element  
    var selector = d3.select("#selDataset");
    // Use the list of sample names to populate the select options
    d3.json(county_list, function(sampleNames) {

        sampleNames.forEach((sample) => {
            selector
                .append("option")
                .text(sample.substring(0, sample.length - 7))
                .property("value", sample);
        });

    });
}

init();








// getting county boundries for layers
var url = "https://raw.githubusercontent.com/TNRIS/tx.geojson/master/counties/tx_counties.geojson";
var geojson_unempl;
var geojson_income;
var info = L.control();

// creating base map
var myMap = L.map("txmap", {
    center: [31.3, -98.9018],
    zoom: 6
});


// creating function to highlite county boundries

function highlightFeature(e) {
    var layer = e.target;
    info.update(layer.feature.properties);

    layer.setStyle({
        weight: 2,
        color: '#000000',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// functions to restyle map when mouse is out 
function resetHighlightUNEMP(e) {
    geojson_unempl.resetStyle(e.target);
    info.update();
}

function resetHighlightINCOME(e) {
    geojson_income.resetStyle(e.target);
    info.update();
}

// function to zoom to county when selected from dropdown or clicked with mouse
function zoomToFeature(e) {
    myMap.fitBounds(e.target.getBounds());
    d3.select("#sample-metadata").html('<strong>' + e.target.feature.properties.COUNTY + '</strong><br>Personal Income: $' + e.target.feature.properties.INCOME + '<br><br>Unemployment Rate:' + (e.target.feature.properties.UNEMPLOYMENT).toFixed(2) + '%<br><br>Population: ' + e.target.feature.properties.POPULATION);

}

// assining functions to events
function onEachFeatureINCOME(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlightINCOME,
        click: zoomToFeature
    });
    layer.bindPopup('<h3>' + feature.properties.COUNTY + '</h3>');

}

function onEachFeatureUNEMP(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlightUNEMP,
        click: zoomToFeature
    });
    layer.bindPopup('<h3>' + feature.properties.COUNTY + '</h3>');


}





// requesting geoJson data and creating layers
d3.json(url, function(new_data) {


    // Adding a tile layer (the background map image) to our map
    // We use the addTo method to add default object to our map
    var mapbox_streets = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 20,
        id: "mapbox.streets-satellite",
        accessToken: API_KEY
    });

    var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 20,
        id: "mapbox.light",
        accessToken: API_KEY
    }).addTo(myMap);

    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 20,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });


    // path to RESTfull APIs 
    var unempURL = "/unemp";
    var incomeURL = "/income";
    var populationURL = "/population";
    var schoolURL = "/school";
    var airURL = "/air_quality";

    // defining arrays for markers and layer groups
    var markerGroup = [];
    var schoolLayer;
    var markerGroupAir = [];
    var AirLayer;

    // styling marker for AirQuality
    var greenIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // styling marker for school data
    var VioletIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });


    // getting data from RESTfull API for unemployment
    d3.json(unempURL, function(unemp_data) {

        // adding unemployment info into geoJson object
        for (i = 0; i < new_data.features.length; i++) {
            Object.entries(unemp_data).forEach(([key, value]) => {
                if (key == new_data.features[i].properties.COUNTY) {
                    new_data.features[i].properties.UNEMPLOYMENT = value;
                }
            })
        }


        // getting data from RESTfull API for income
        d3.json(incomeURL, function(income_data) {

            // adding income info into geoJson object
            for (i = 0; i < new_data.features.length; i++) {
                Object.entries(income_data).forEach(([key, value]) => {
                    if (key == new_data.features[i].properties.COUNTY) {
                        new_data.features[i].properties.INCOME = value;
                    }
                })
            }

            // getting data from RESTfull API for population
            d3.json(populationURL, function(population_data) {

                // adding income info into geoJson object
                for (i = 0; i < new_data.features.length; i++) {
                    Object.entries(population_data).forEach(([key, value]) => {
                        if (key == new_data.features[i].properties.COUNTY) {
                            new_data.features[i].properties.POPULATION = value;
                        }
                    })
                }




                // getting data for schools from RESTfull API 
                d3.json(schoolURL, function(schoolData) {
                    // looping through array of objects and creating new array with markers
                    for (var i = 0; i < schoolData.length; i++) {
                        markerGroup.push(
                            L.marker([schoolData[i].LAT, schoolData[i].LONG], { icon: VioletIcon }).bindPopup("<h4>" + schoolData[i].CampusName + "</h4> <hr>School District: " + schoolData[i].DistrictName + "<br>Overall Grade: " + schoolData[i].OverallGrade + '<br>School Type: ' + schoolData[i].SchoolType + '<br> Zip code: ' + schoolData[i].ZIP)
                        )
                    }
                    // creating layer of markers
                    schoolLayer = L.layerGroup(markerGroup);

                    // getting data for air quality from RESTfull API
                    d3.json(airURL, function(airData) {
                        // looping through array of objects and creating new array with markers
                        for (var i = 0; i < airData.length; i++) {
                            markerGroupAir.push(
                                L.marker([airData[i].Latitude, airData[i].Longitude], { icon: greenIcon }).bindPopup("<h4>" + airData[i].SiteName + "</h4> <br>" + airData[i].AgencyName + "<br>AQI: " + airData[i].AQI + " (0-50 Good; 50< Acceptable)<br> Time Stamp: " + airData[i].UTC)
                            )
                        }
                        // creating layer of markers
                        AirLayer = L.layerGroup(markerGroupAir);





                        // creating layer for unemployment
                        geojson_unempl = L.choropleth(new_data, {

                            valueProperty: "UNEMPLOYMENT",

                            // Set color scale
                            scale: ["#ffffb2", "#b10026"],

                            // Number of breaks in step range
                            steps: 10,

                            // q for quartile, e for equidistant, k for k-means
                            mode: "q",
                            style: {
                                // Border color
                                color: "#fff",
                                weight: 1,
                                fillOpacity: 0.8
                            },
                            onEachFeature: onEachFeatureUNEMP

                        });



                        // creating layer for income
                        geojson_income = L.choropleth(new_data, {

                            valueProperty: "INCOME",

                            // Set color scale
                            scale: ["#ffffb2", "#016703"],

                            // Number of breaks in step range
                            steps: 10,

                            // q for quartile, e for equidistant, k for k-means
                            mode: "q",
                            style: {
                                // Border color
                                color: "#fff",
                                weight: 1,
                                fillOpacity: 0.8
                            },
                            onEachFeature: onEachFeatureINCOME

                        }).addTo(myMap);





                        // adding few basemaps
                        var baseMaps = {
                            "Satellite": mapbox_streets,
                            "Light map": light,
                            "Outdoors": outdoors
                        };

                        // Overlays that may be toggled on or off
                        var overlayMaps = {
                            "Unemployment": geojson_unempl,
                            "Income": geojson_income,
                            "Best Schools": schoolLayer,
                            "Air Stations": AirLayer
                        };






                        // div object will be located in top right corner and have additional info

                        info.onAdd = function(map) {
                            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
                            this.update();
                            return this._div;
                        };

                        info.update = function(props) {
                            this._div.innerHTML = '<h4>Texas County Info</h4>' + (props ?
                                '<b>' + props.COUNTY + '</b><br />Personal Income: $' + props.INCOME + '<br>Unemployment Rate:' + (props.UNEMPLOYMENT).toFixed(2) + '%' + '<br>Population:' + props.POPULATION :
                                'Hover over a county');
                        };

                        info.addTo(myMap);



                        // Pass our map layers into our layer control
                        // Add the layer control to the map
                        L.control.layers(baseMaps, overlayMaps, { collapsed: false, position: 'bottomright' }).addTo(myMap);
                        // closing d3 call for air 
                    });
                    // closing d3 call for schools
                });
                //closing d3 call to population 
            });




            //closing d3 call to income
        });



        //closing d3 call to unemployment
    });


    //closing d3 call to original geojson
});