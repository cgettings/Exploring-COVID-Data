
// plot in popup or
// plot underneath
// sticky stats on click

//=============================================================================//
// setting up
//=============================================================================//

//-----------------------------------------------------------------------------//
// renaming objects
//-----------------------------------------------------------------------------//

const map = this;
const LM = map.layerManager;

//console.log("map", map);
//console.log("LM", LM);

var case_rate_legend = map.controls.get("case_rate_legend");
var death_rate_legend = map.controls.get("death_rate_legend");
var percent_positive_legend = map.controls.get("percent_positive_legend");

map.controls.clear();


case_rate_legend.addTo(map);


$(".leaflet-control-layers-base .leaflet-control-layers-selector").on('click', function (e) {
    
    var visible_group = 
        LM.getVisibleGroups()
        .filter(
            name => 
                !(
                    name.toLowerCase().includes("map") ||
                    name.toLowerCase().includes("street") ||
                    name.toLowerCase().includes("zip")
                )
            );
    
    
    if (visible_group == "Case rate (per 100k)") {
        
        death_rate_legend.remove();
        percent_positive_legend.remove();
        case_rate_legend.addTo(map);
        
    }
    if (visible_group == "Death rate (per 100k)") {
        
        case_rate_legend.remove();
        percent_positive_legend.remove();
        death_rate_legend.addTo(map);
        
    }
    if (visible_group == "Percent positive tests") {
        
        case_rate_legend.remove();
        death_rate_legend.remove();
        percent_positive_legend.addTo(map);
        
    }
    
});

var group_names = 
    LM.getAllGroupNames()
    .filter(
        name => 
            !(
                name.toLowerCase().includes("map") ||
                name.toLowerCase().includes("street") ||
                name.toLowerCase().includes("zip")
            )
        );

group_names.forEach(group_name => {
    
    
    LM.getLayerGroup(group_name).eachLayer(layer => {
        
        
        zcta         = layer.options.layerId.split("_")[1];
        
        zcta_index   = data.MODZCTA.indexOf(zcta);
        neighborhood = data.NEIGHBORHOOD_NAME[zcta_index];
        
        
        if (group_name.toLowerCase().includes("case")) {
            
            layer.bindTooltip(
                        
                        "<span style='font-family:sans-serif;font-size:120%;font-weight:bold;'>" + 
                        data.NEIGHBORHOOD_NAME[zcta_index] + 
                        "</span>" + 
                        
                        "<br>" +
                        
                        "<span style='font-family:sans-serif;font-size:115%;'>" + 
                        zcta + 
                        "</span>" +
                        
                        "<br>" +
                        
                        "<span style='font-family:sans-serif;font-size:115%;font-weight:bold;'>" + 
                        "Case rate: " + 
                        parseFloat(data.COVID_CASE_RATE[zcta_index].toFixed(0)).toLocaleString('en-US') + 
                        "</span>" +
                        
                        "<br>" +
                        
                        "<span style='font-family:sans-serif;font-size:115%;'>" + 
                        "Case count: " + 
                        parseFloat(data.COVID_CASE_COUNT[zcta_index].toFixed(0)).toLocaleString('en-US') + 
                        "</span>" +
                        
                        "<br>" +
                        
                        "<span style='font-family:sans-serif;font-size:115%;'>" + 
                        "Population: " + 
                        parseFloat(data.POP_DENOMINATOR[zcta_index].toFixed(0)).toLocaleString('en-US') + 
                        "</span>",
                        
                        {textsize: "1.0em", direction: "top", offset: [0, -12], opacity: 0.85}
                        
                    );
            
        } else if (group_name.toLowerCase().includes("death")) {
            
            layer.bindTooltip(
                        
                        "<span style='font-family:sans-serif;font-size:120%;font-weight:bold;'>" + 
                        data.NEIGHBORHOOD_NAME[zcta_index] + 
                        "</span>" + 
                        
                        "<br>" +
                        
                        "<span style='font-family:sans-serif;font-size:115%;'>" + 
                        zcta + 
                        "</span>" +
                        
                        "<br>" +
                        
                        "<span style='font-family:sans-serif;font-size:115%;font-weight:bold;'>" + 
                        "Death rate: " + 
                        parseFloat(data.COVID_DEATH_RATE[zcta_index].toFixed(0)).toLocaleString('en-US') + 
                        "</span>" +
                        
                        "<br>" +
                        
                        "<span style='font-family:sans-serif;font-size:115%;'>" + 
                        "Death count: " + 
                        parseFloat(data.COVID_DEATH_COUNT[zcta_index].toFixed(0)).toLocaleString('en-US') + 
                        "</span>" +
                        
                        "<br>" +
                        
                        "<span style='font-family:sans-serif;font-size:115%;'>" + 
                        "Population: " + 
                        parseFloat(data.POP_DENOMINATOR[zcta_index].toFixed(0)).toLocaleString('en-US') + 
                        "</span>",
                        
                        {textsize: "1.0em", direction: "top", offset: [0, -12], opacity: 0.85}
                        
                    );
            
            
        } else if (group_name.toLowerCase().includes("percent")) {
            
            layer.bindTooltip(
                        
                        "<span style='font-family:sans-serif;font-size:120%;font-weight:bold;'>" + 
                        data.NEIGHBORHOOD_NAME[zcta_index] + 
                        "</span>" + 
                        
                        "<br>" +
                        
                        "<span style='font-family:sans-serif;font-size:115%;'>" + 
                        zcta + 
                        "</span>" +
                        
                        "<br>" +
                        
                        "<span style='font-family:sans-serif;font-size:115%;font-weight:bold;'>" + 
                        "% Positive Tests: " + data.PERCENT_POSITIVE[zcta_index].toFixed(1) + 
                        "</span>" +
                        
                        "<br>" +
                        
                        "<span style='font-family:sans-serif;font-size:115%;'>" + 
                        "Test count: " +
                        parseFloat(data.TOTAL_COVID_TESTS[zcta_index].toFixed(0)).toLocaleString('en-US') + 
                        "</span>" +
                        
                        "<br>" +
                        
                        "<span style='font-family:sans-serif;font-size:115%;'>" + 
                        "Population: " + 
                        parseFloat(data.POP_DENOMINATOR[zcta_index].toFixed(0)).toLocaleString('en-US') + 
                        "</span>",
                        
                        {textsize: "1.0em", direction: "top", offset: [0, -12], opacity: 0.85}
                        
                    );
            
        }
        
    });
});


// ----------------------------- THIS IS THE END! ---------------------------- //
