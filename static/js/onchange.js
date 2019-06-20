
// when drop-down changed this functions run
function optionChanged(newCounty) {

    // filtering counties and selecting layer which has the same name
    geojson_unempl.eachLayer(function (layer) {
        if (layer.feature.properties.COUNTY == newCounty) {
            layer.fireEvent('click');
        }
    });

    // need to do this on both layers because not sure which is curently selected otherwise bindPopup will not show up on second layer
    geojson_income.eachLayer(function (layer) {
        if (layer.feature.properties.COUNTY == newCounty) {
            layer.fireEvent('click');
        }
    });   

}