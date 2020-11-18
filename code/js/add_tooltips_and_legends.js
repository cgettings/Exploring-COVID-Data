
// plot in popup or underneath

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

//=============================================================================//
// customizing lots of stuff
//=============================================================================//

//-----------------------------------------------------------------------------//
// adding date label
//-----------------------------------------------------------------------------//

var date_label = L.control({position: 'topright'});

date_label.onAdd = function (map) {
    
    // setting class and additional styles
    
    var date_div = L.DomUtil.create('div', 'leaflet-control-layers-expanded');
    
    date_div.style.setProperty("padding", "3px 7px 3px 7px");
    
    date_div.style.setProperty("text-align", "center");
    
    // creating label box
    
    date_div.innerHTML = 
        "<span style = 'font-family: sans-serif; font-size: 1.1em;font-weight: bold;'>" + 
        "Updated: " +
        "####" + 
        "</span>";

    L.DomEvent.disableClickPropagation(date_div);
    
    return date_div;
    
};

date_label.addTo(map);


//-----------------------------------------------------------------------------//
// adding legends
//-----------------------------------------------------------------------------//

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// get legends from map (added in R)
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

var case_rate_legend = map.controls.get("case_rate_legend");
var death_rate_legend = map.controls.get("death_rate_legend");
var percent_positive_legend = map.controls.get("percent_positive_legend");

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// clear legends from map
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

map.controls.clear();

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// show default layer legend
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

case_rate_legend.addTo(map);

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// show legends on layer click
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

$(".leaflet-control-layers-base .leaflet-control-layers-selector").on('click', function (e) {
    
    // removing current stats label when base layer is changed
    
    if (zcta_stats_label) zcta_stats_label.remove();
    if (LM.getLayer('shape', 'highlight')) LM.removeLayer('shape', 'highlight');
    
    //map.controls.clear();
    
    var visible_group = 
        LM.getVisibleGroups()
        .filter(
            name => 
                !(
                    name.toLowerCase().includes("map") ||
                    name.toLowerCase().includes("street") ||
                    name.toLowerCase().includes("zip") ||
                    name.toLowerCase().includes("highlight")
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


//-----------------------------------------------------------------------------//
// adding stats label `div`
//-----------------------------------------------------------------------------//

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// station stats label
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

var zcta_stats_label = L.control({position: 'bottomright'});

//-----------------------------------------------------------------------------//
// adding layer things
//-----------------------------------------------------------------------------//

var group_names = 
    LM.getAllGroupNames()
    .filter(
        name => 
            !(
                name.toLowerCase().includes("map") ||
                name.toLowerCase().includes("street") ||
                name.toLowerCase().includes("zip") ||
                name.toLowerCase().includes("highlight")
            )
        );

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// tooltips
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

group_names.forEach(group_name => {
    
    LM.getLayerGroup(group_name).eachLayer(layer => {
        
        
        zcta         = layer.options.layerId.split("_")[1];
        zcta_index   = data.MODZCTA.indexOf(zcta);
        neighborhood = data.NEIGHBORHOOD_NAME[zcta_index];
        
        
        if (group_name.toLowerCase().includes("case")) {
            
            layer.bindTooltip(
                
                "<span style='font-family:sans-serif;font-size:120%;font-weight:bold;'>" + 
                neighborhood + 
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
                
                {
                    textsize: "1.0em", 
                    sticky: true,
                    direction: "top", 
                    offset: [0, -12], 
                    opacity: 0.85
                }
                
            );
            
            
        } else if (group_name.toLowerCase().includes("death")) {
            
            layer.bindTooltip(
                
                "<span style='font-family:sans-serif;font-size:120%;font-weight:bold;'>" + 
                neighborhood + 
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
                
                {
                    textsize: "1.0em", 
                    sticky: true,
                    direction: "top", 
                    offset: [0, -12], 
                    opacity: 0.85
                }
                
            );
            
            
        } else if (group_name.toLowerCase().includes("percent")) {
            
            layer.bindTooltip(
                
                "<span style='font-family:sans-serif;font-size:120%;font-weight:bold;'>" + 
                neighborhood + 
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
                
                {
                    textsize: "1.0em", 
                    sticky: true,
                    direction: "top", 
                    offset: [0, -12], 
                    opacity: 0.85
                }
                
            );
                        
        }
        
    });
            
    
});


//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// stats label on click
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

group_names.forEach(group_name => {
    
    LM.getLayerGroup(group_name).eachLayer(layer => {
        
        
        if (group_name.toLowerCase().includes("case")) {
            
            layer.on('click', function (e) {
                
                
                zcta         = e.target.options.layerId.split("_")[1];
                zcta_index   = data.MODZCTA.indexOf(zcta);
                neighborhood = data.NEIGHBORHOOD_NAME[zcta_index];            
                
                zcta_stats_label.onAdd = function (map) {
                    
                    // setting class and additional styles
                    
                    var div = L.DomUtil.create('div', 'leaflet-control-layers');
                    
                    div.style.setProperty("padding", "5px 10px 5px 10px");
                    div.style.setProperty("border", "2px solid cyan");
                    div.style.setProperty("text-align", "left");
                    
                    // creating label box
                    
                    div.innerHTML = 
                        "<span style='font-family:sans-serif;font-size:120%;font-weight:bold;'>" + 
                        neighborhood + 
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
                        "</span>";
                    
                    L.DomEvent.disableClickPropagation(div);
                    
                    return div;
                    
                };
                
                zcta_stats_label.addTo(map);
            });
            
            
        } else if (group_name.toLowerCase().includes("death")) {
            
            layer.on('click', function (e) {
                
                zcta         = e.target.options.layerId.split("_")[1];
                zcta_index   = data.MODZCTA.indexOf(zcta);
                neighborhood = data.NEIGHBORHOOD_NAME[zcta_index];            
                
                zcta_stats_label.onAdd = function (map) {
                    
                    // setting class and additional styles
                    
                    var div = L.DomUtil.create('div', 'leaflet-control-layers');
                    
                    div.style.setProperty("padding", "5px 10px 5px 10px");
                    div.style.setProperty("border", "2px solid cyan");
                    div.style.setProperty("text-align", "left");
                    
                    // creating label box
                    
                    div.innerHTML = 
                        
                        "<span style='font-family:sans-serif;font-size:120%;font-weight:bold;'>" + 
                        neighborhood + 
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
                        "</span>";
                    
                    L.DomEvent.disableClickPropagation(div);
                    
                    return div;
                    
                };
                
                zcta_stats_label.addTo(map);
                
            });
            
            
        } else if (group_name.toLowerCase().includes("percent")) {
            
            layer.on('click', function (e) {
                
                zcta         = e.target.options.layerId.split("_")[1];
                zcta_index   = data.MODZCTA.indexOf(zcta);
                neighborhood = data.NEIGHBORHOOD_NAME[zcta_index];            
                
                zcta_stats_label.onAdd = function (map) {
                    
                    // setting class and additional styles
                    
                    var div = L.DomUtil.create('div', 'leaflet-control-layers');
                    
                    div.style.setProperty("padding", "5px 10px 5px 10px");
                    div.style.setProperty("border", "2px solid cyan");
                    div.style.setProperty("text-align", "left");
                    
                    // creating label box
                    
                    div.innerHTML = 
                        
                        "<span style='font-family:sans-serif;font-size:120%;font-weight:bold;'>" + 
                        neighborhood + 
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
                    
                    L.DomEvent.disableClickPropagation(div);
                    
                    return div;
                    
                };
                
                zcta_stats_label.addTo(map);                
            });
            
        }
        
    });
    
});


//-----------------------------------------------------------------------------//
// click highlighting
//-----------------------------------------------------------------------------//


group_names.forEach(group_name => {
    
    LM.getLayerGroup(group_name).eachLayer(layer => {
        
        layer.on('click', function (e) {
            
            // using the clicked layer's latlngs to draw a new polygon
            
            var highlight_polygon = 
                L.polygon(
                    layer.getLatLngs(), 
                    {
                        color: 'cyan', 
                        weight: 2.5, 
                        pane: 'overlayPane',
                        fill: false,
                        layerId: 'highlight'
                        
                    });
                
            // adding layer through layerManager, to add groupname, and to replace
            //  the 'highlight' layerId on additional click
                
            LM.addLayer(
                highlight_polygon,
                "shape",
                "highlight",
                "highlight"
            );
    
        });
    
    });
    
});
    

// ----------------------------- THIS IS THE END! ---------------------------- //
