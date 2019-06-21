var county_list = "/counties";
function init() {
  // Grab a reference to the dropdown select element  
  var selector = d3.select("#selDataset");
  // Use the list of sample names to populate the select options
  d3.json(county_list, function (sampleNames) {

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample.substring(0, sample.length - 7))
        .property("value", sample);
    });

  });
}

init();









var url = "https://raw.githubusercontent.com/TNRIS/tx.geojson/master/counties/tx_counties.geojson";
var geojson_unempl;
var geojson_income;
var info = L.control();

var myMap = L.map("txmap", {
  center: [31.3, -98.9018],
  zoom: 6
});



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

function resetHighlightUNEMP(e) {
  geojson_unempl.resetStyle(e.target);
  info.update();
}

function resetHighlightINCOME(e) {
  geojson_income.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  myMap.fitBounds(e.target.getBounds());
  d3.select("#sample-metadata").html('<strong>' + e.target.feature.properties.COUNTY + '</strong><br>Personal Income: $' + e.target.feature.properties.INCOME + '<br><br>Unemployment Rate:' + (e.target.feature.properties.UNEMPLOYMENT).toFixed(2) + '%<br><br>Population: ' + e.target.feature.properties.POPULATION);
  // console.log(e.target.feature.properties.COUNTY);
  // console.log(e);
  // d3.select("#sample-metadata").html("test");

}

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






d3.json(url, function (new_data) {


  // Adding a tile layer (the background map image) to our map
  // We use the addTo method to add objects to our map
  var mapbox_streets = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.streets",
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


  // path to data from DB
  var unempURL = "/unemp";
  var incomeURL = "/income";
  var populationURL = "/population";
  var schoolURL = "/school";
  var markerGroup = [];
  var schoolLayer;
  var airURL = "/air_quality";
  var markerGroupAir = [];
  var AirLayer;


  // getting data from RESTfull API for unemployment
  d3.json(unempURL, function (unemp_data) {

    // adding unemployment info into geoJson object
    for (i = 0; i < new_data.features.length; i++) {
      Object.entries(unemp_data).forEach(([key, value]) => {
        if (key == new_data.features[i].properties.COUNTY) {
          new_data.features[i].properties.UNEMPLOYMENT = value;
        }
      })
    }


    // getting data from RESTfull API for income
    d3.json(incomeURL, function (income_data) {

      // adding income info into geoJson object
      for (i = 0; i < new_data.features.length; i++) {
        Object.entries(income_data).forEach(([key, value]) => {
          if (key == new_data.features[i].properties.COUNTY) {
            new_data.features[i].properties.INCOME = value;
          }
        })
      }

      // getting data from RESTfull API for population
      d3.json(populationURL, function (population_data) {

        // adding income info into geoJson object
        for (i = 0; i < new_data.features.length; i++) {
          Object.entries(population_data).forEach(([key, value]) => {
            if (key == new_data.features[i].properties.COUNTY) {
              new_data.features[i].properties.POPULATION = value;
            }
          })
        }




        // getting data for schools
        d3.json(schoolURL, function (schoolData) {    


          for (var i = 0; i < schoolData.length; i++) {
            markerGroup.push(
              L.marker([schoolData[i].LAT, schoolData[i].LONG]).bindPopup("<h4>" + schoolData[i].CampusName + "</h4> <hr>School District: " + schoolData[i].DistrictName + "<br>Overall Grade: " + schoolData[i].OverallGrade + '<br>School Type: ' + schoolData[i].SchoolType + '<br> Zip code: ' + schoolData[i].ZIP)
            )
          }

          schoolLayer = L.layerGroup(markerGroup);


          d3.json(airURL, function (airData) { 
            for (var i = 0; i < airData.length; i++) {
              markerGroupAir.push(
                L.marker([airData[i].Latitude, airData[i].Longitude]).bindPopup("<h4>" + airData[i].SiteName)
              )
            }
  
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

            // function (feature, layer) {
            //   layer.bindPopup('<h3>' + feature.properties.COUNTY + '</h3><hr>Per Capita Personal Income: $' + feature.properties.INCOME + '<br>Unemployment Rate: ' + (feature.properties.UNEMPLOYMENT).toFixed(2) + '%')
            // }

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
            // onEachFeature: function (feature, layer) {          
            //   layer.bindPopup('<h3>' + feature.properties.COUNTY + '</h3><hr>Per Capita Personal Income: $' + feature.properties.INCOME + '<br>Unemployment Rate: ' + (feature.properties.UNEMPLOYMENT).toFixed(2) + '%')
            // }

          }).addTo(myMap);





          // adding few basemaps
          var baseMaps = {
            "Streets map": mapbox_streets,
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


          // Pass our map layers into our layer control
          // Add the layer control to the map




          info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
          };

          info.update = function (props) {
            this._div.innerHTML = '<h4>Texas County Info</h4>' + (props ?
              '<b>' + props.COUNTY + '</b><br />Personal Income: $' + props.INCOME + '<br>Unemployment Rate:' + (props.UNEMPLOYMENT).toFixed(2) + '%' + '<br>Population:' + props.POPULATION
              : 'Hover over a county');
          };

          info.addTo(myMap);

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



