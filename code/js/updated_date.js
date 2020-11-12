
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// date label
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

const map = this;

//console.log(el);
//console.log(x);

//console.log(map);

// static for now, but will add more dates later

var date_label = L.control({position: 'topright'});

console.log(date_label);

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
