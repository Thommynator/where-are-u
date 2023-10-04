// initialize the map
let map = L.map('map').setView([52.494071909457865, 13.429295232714685], 4);

let up42Icon = L.icon({
    iconUrl: 'imgs/up42-logo-small.png',
    iconSize: [100, 61], // size of the icon
    iconAnchor: [50, 30], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -20] // point from which the popup should open relative to the iconAnchor
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.marker([52.4940, 13.4292], {icon: up42Icon}).bindPopup("<a href='https://up42.com/'><b>UP42 HQ</b></a>").addTo(map);

createCountryLayers();

async function createCountryLayers() {

    let sheetData = await loadSheetDataAsMap();
    let maxCount = Math.max(...Array.from(sheetData.values()));

    loadGeoJsonFile("./countries.geojson")
        .then(data => {
                L.geoJSON(data, {
                    onEachFeature: function (feature, featureLayer) {
                        featureLayer.bindPopup(getCountryName(feature) + " (" + getCountryCount(feature, sheetData) + "x)");
                    },
                    style: function (feature) {
                        return {
                            fillColor: getCountryColor(feature, sheetData, maxCount),
                            fillOpacity: 1.0,
                            color: 'rgba(16,16,21,0.8)', // stroke color
                            weight: 1 // stroke width
                        };
                    }
                }).addTo(map);
            }
        );
}

async function loadSheetDataAsMap() {
    let sheetData = new Map();
    await fetch(`https://opensheet.elk.sh/${spreadSheetId}/${tableName}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(row => {
                sheetData.set(row[countryColumn], row[counterColumn]);
            })
        })
    return sheetData;
}

function getCountryName(countryFeature) {
    return countryFeature.properties.ADMIN;
}

function getCountryCount(countryFeature, sheetData) {
    return sheetData.get(getCountryName(countryFeature)) ?? 0;
}

function getCountryColor(countryFeature, sheetData, maxCount) {
    let count = sheetData.get(getCountryName(countryFeature));
    if (count === undefined) {
        return 'rgba(255,254,230,0.3)';
    }
    let scale = chroma.scale(['rgba(208,255,209,0.5)', 'rgba(246,255,88,0.5)', 'rgba(196,0,0,0.5)']).domain([0, maxCount]);
    return scale(count).hex();
}

function loadGeoJsonFile(filepath) {
    // Use the fetch API to read the JSON file
    return fetch(filepath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}