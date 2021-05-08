// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";

console.log(queryUrl)
// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.on({
            // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to 90% so that it stands out
            mouseover: function (event) {
                layer = event.target;
                layer.setStyle({
                    fillOpacity: 0.9
                });
            },
            // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 50%
            mouseout: function (event) {
                layer = event.target;
                layer.setStyle({
                    fillOpacity: 0.5
                });
            },

        });

        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    function pointFunction(feature, layer) {
        // console.log(feature.geometry.coordinates[2])
        return L.circleMarker(layer, { radius: feature.properties.mag * 5 });
    }

    function mapstyle(feature, layer) {
        //Style Map
        var mapstyle = {
            color: 'white',
            // fillColor: 'pink',
            fillOpacity: 0.5,
            weight: 1.5
        };

        if (feature.geometry.coordinates[2] >= -10 && feature.geometry.coordinates[2] < 10) {
            mapstyle.color = 'LawnGreen';
        } else if (feature.geometry.coordinates[2] >= 10 && feature.geometry.coordinates[2] < 30) {
            mapstyle.color = "DarkSeaGreen";
        } else if (feature.geometry.coordinates[2] >= 30 && feature.geometry.coordinates[2] < 50) {
            mapstyle.color = 'Gold';
        } else if (feature.geometry.coordinates[2] >= 50 && feature.geometry.coordinates[2] < 70) {
            mapstyle.color = "Orange";
        } else if (feature.geometry.coordinates[2] >= 70 && feature.geometry.coordinates[2] < 90) {
            mapstyle.color = "OrangeRed";
        } else if (feature.geometry.coordinates[2] >= 90) {
            mapstyle.color = "DarkRed";
        }


        return mapstyle
    }


    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature, //add popups
        pointToLayer: pointFunction, // add circles
        style: mapstyle // add styles
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}


function createMap(earthquakes) {

    // Define streetmap, darkmap layers, Satelite layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        //attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        //attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        // attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-streets-v10",
        accessToken: API_KEY
    });



    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap,
        'Satelite': satellite
    };


    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };



    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            26.723338, -37.018170
        ],
        zoom: 2.5,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    L.control.legend({
        postion: 'bottomright',
        items: [
            { color: 'red', label: 'reserved' },
            { color: 'blue', label: 'not reserved' }
        ],
        collapsed: true,
        // insert different label for the collapsed legend button.
        buttonHtml: 'legend'
    }).addTo(myMap);
}