var url = "https://raw.githubusercontent.com/TNRIS/tx.geojson/master/counties/tx_counties.geojson";
var geojson_unempl;
var geojson_income;

d3.json(url, function (new_data) {

  var myMap = L.map("txmap", {
    center: [31.3, -98.9018],
    zoom: 6
  });


  // Adding a tile layer (the background map image) to our map
  // We use the addTo method to add objects to our map
  var mapbox_streets = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.streets",
    accessToken: API_KEY
  }).addTo(myMap);

  var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });


  // path to data from DB
  var unempURL = "/unemp";
  var incomeURL = "/income";

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
        // console.log(new_data.features[i]);
      }



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

        onEachFeature: function (feature, layer) {
          layer.bindPopup(feature.properties.COUNTY + '<bh>' + feature.properties.INCOME + '<br>' + feature.properties.UNEMPLOYMENT)
        }

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
        onEachFeature: function (feature, layer) {          
          layer.bindPopup(feature.properties.COUNTY + '<br>' + feature.properties.INCOME + '<br>' + feature.properties.UNEMPLOYMENT)
        }

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
        "Income": geojson_income
      };


      // Pass our map layers into our layer control
      // Add the layer control to the map
      L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);
      
      
      
      
      //closing d3 call to income
    });



    //closing d3 call to unemployment
  });


  //closing d3 call to original geojson
});