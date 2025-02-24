import { barrios } from './barrios.js';

let map;
let markersGroup = L.layerGroup(); // Define un grupo de capas para los marcadores

document.addEventListener("DOMContentLoaded", function() {
    const center = [4.666091, -74.107272];
    map = L.map('map').setView(center, 12);
    const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);

    const satellite = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.opentopomap.org/">OpenTopoMap</a> contributors'
    });

    const baseMaps = {
        "Streets": streets,
        "Satellite": satellite
    };

    L.control.layers(baseMaps).addTo(map);

    const randomButton = document.getElementById("randomButton");
    const searchButton = document.getElementById("searchButton");
    const selectedBarrios = document.getElementById("selectedBarrios");
    const searchBarrioInput = document.getElementById("searchBarrio");
    const barrioNamesDatalist = document.getElementById("barrioNames");
    const sectorSelect = document.getElementById("sectorSelect");
    const sectorSearch = document.getElementById("sectorSearch");

    const showRandomSectionButton = document.getElementById("showRandomSection");
    const showSearchSectionButton = document.getElementById("showSearchSection");
    const generarAleatoriosSection = document.getElementById("generarAleatorios");
    const buscarPorPalabraSection = document.getElementById("buscarPorPalabra");

    barrios.forEach(barrio => {
        const option = document.createElement("option");
        option.value = barrio.nombre;
        barrioNamesDatalist.appendChild(option);
    });

    randomButton.addEventListener("click", async function() {
        selectedBarrios.innerHTML = "";
        document.getElementById("results").style.display = "block";
        const estratosSeleccionados = obtenerEstratosSeleccionados();
        const sectorSeleccionado = sectorSelect.value;
        const barriosFiltrados = barrios.filter(barrio => {
            return (estratosSeleccionados.includes(barrio.estrato.toString()) &&
                    (sectorSeleccionado === 'todos' || barrio.sector.toLowerCase() === sectorSeleccionado.toLowerCase()));
        });
        const numeroBarrios = parseInt(document.getElementById("numeroBarrios").value);
        const barriosAleatorios = obtenerBarriosAleatorios(barriosFiltrados, numeroBarrios);
        for (const barrio of barriosAleatorios) {
            const { lat, lon } = await obtenerCoordenadas(barrio.nombre, barrio.localidad);
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <p>Localidad: ${barrio.localidad}</p>
                <p>Barrio: ${barrio.nombre}</p>
                <p>Estrato: ${barrio.estrato}</p>
                <p>Sector: ${barrio.sector}</p>
            `;
            listItem.setAttribute("data-latitud", lat);
            listItem.setAttribute("data-longitud", lon);
            listItem.setAttribute("data-localidad", barrio.localidad);
            listItem.setAttribute("data-nombre", barrio.nombre);
            selectedBarrios.appendChild(listItem);
        }
        document.getElementById("showMapButton").style.display = "block";
    });

    searchButton.addEventListener("click", async function() {
        selectedBarrios.innerHTML = "";
        document.getElementById("results").style.display = "block";
        const searchTerm = searchBarrioInput.value.trim();
        const sectorSeleccionado = sectorSearch.value;
        const barriosEncontrados = barrios.filter(barrio => {
            return (barrio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (sectorSeleccionado === 'todos' || barrio.sector.toLowerCase() === sectorSeleccionado.toLowerCase()));
        });
        for (const barrio of barriosEncontrados) {
            const { lat, lon } = await obtenerCoordenadas(barrio.nombre, barrio.localidad);
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <p>Localidad: ${barrio.localidad}</p>
                <p>Barrio: ${barrio.nombre}</p>
                <p>Estrato: ${barrio.estrato}</p>
                <p>Sector: ${barrio.sector}</p>
            `;
            listItem.setAttribute("data-latitud", lat);
            listItem.setAttribute("data-longitud", lon);
            listItem.setAttribute("data-localidad", barrio.localidad);
            listItem.setAttribute("data-nombre", barrio.nombre);
            selectedBarrios.appendChild(listItem);
        }
        document.getElementById("showMapButton").style.display = "block";
    });

    showRandomSectionButton.addEventListener("click", function() {
        generarAleatoriosSection.classList.add("active");
        buscarPorPalabraSection.classList.remove("active");
    });

    showSearchSectionButton.addEventListener("click", function() {
        buscarPorPalabraSection.classList.add("active");
        generarAleatoriosSection.classList.remove("active");
    });

    const showMapButton = document.getElementById("showMapButton");
    showMapButton.addEventListener("click", function() {
        markersGroup.clearLayers();

        const primeraUbicacion = selectedBarrios.querySelector("li");
        if (primeraUbicacion) {
            const latitud = parseFloat(primeraUbicacion.getAttribute("data-latitud"));
            const longitud = parseFloat(primeraUbicacion.getAttribute("data-longitud"));
            const localidad = primeraUbicacion.getAttribute("data-localidad");
            const nombre = primeraUbicacion.getAttribute("data-nombre");
            mostrarMapa(latitud, longitud, localidad, nombre);
            document.getElementById("map").style.display = "block";
        }
    });
});

function obtenerEstratosSeleccionados() {
    const estratosSeleccionados = [];
    const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");
    checkboxes.forEach(checkbox => {
        estratosSeleccionados.push(checkbox.value);
    });
    return estratosSeleccionados;
}

function obtenerBarriosAleatorios(lista, n) {
    const copiaLista = lista.slice();
    const barriosAleatorios = [];
    for (let i = 0; i < n && i < copiaLista.length; i++) {
        const indiceAleatorio = Math.floor(Math.random() * copiaLista.length);
        const barrioAleatorio = copiaLista.splice(indiceAleatorio, 1)[0];
        barriosAleatorios.push(barrioAleatorio);
    }
    return barriosAleatorios;
}

async function obtenerCoordenadas(barrio, localidad) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(localidad + ', ' + barrio)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
        return {
            lat: data[0].lat,
            lon: data[0].lon
        };
    }
    return { lat: 0, lon: 0 };
}

function mostrarMapa(latitud, longitud, localidad, nombre) {
    map.setView([latitud, longitud], 13);
    markersGroup.clearLayers();

    const barrioBuscado = selectedBarrios.querySelector(`li[data-nombre="${nombre}"]`);
    if (barrioBuscado) {
        L.marker([latitud, longitud]).addTo(markersGroup)
            .bindPopup(`<p>Localidad: ${localidad}</p><p>Barrio: ${nombre}</p>`)
            .openPopup();

        markersGroup.addTo(map);
    }
}
