import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import marker_icon from '../images/pin.png';
import '../App.css';

const StrayMap = () => {
  const [posts, setPosts] = useState([]);
  const [centerLocation, setCenterLocation] = useState([40.745255, -74.034775]);
  const [searchLocation, setSearchLocation] = useState(null);
  const [visibleSpecies, setVisibleSpecies] = useState({
    cat: true,
    dog: true,
    others: true
  });

  const customIcon = L.icon({
    iconUrl: marker_icon, 
    iconSize: [55, 55], // Size of the icon
    iconAnchor: [27, 94], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -76] // Point from which the popup should open relative to the iconAnchor
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/post');
        return response.data;
      } catch (error) {
        console.error('Error fetching stray posts:', error);
      }
    };
    fetchPosts().then(data => setPosts(data));
    navigator.geolocation.getCurrentPosition(
      position => {
        setCenterLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        console.error("Unable to retrieve your location");
      }
    );
  }, []);

  const SpeciesCheckboxControl = () => {
    const map = useMap();
  
    useEffect(() => {
      const controlDiv = L.DomUtil.create('div', 'species-control');
      controlDiv.innerHTML = `
        <form>
          <label><input type="checkbox" class="species-checkbox" value="cat" ${visibleSpecies.cat ? 'checked' : ''} /> Cats</label><br>
          <label><input type="checkbox" class="species-checkbox" value="dog" ${visibleSpecies.dog ? 'checked' : ''} /> Dogs</label><br>
          <label><input type="checkbox" class="species-checkbox" value="others" ${visibleSpecies.others ? 'checked' : ''} /> Others</label>
        </form>
      `;

  
      const onInputChange = (e) => {
        setVisibleSpecies(prevState => ({
          ...prevState,
          [e.target.value]: e.target.checked
        }));
      };
      
  
      const checkboxes = controlDiv.querySelectorAll('.species-checkbox');
      checkboxes.forEach(checkbox => checkbox.addEventListener('change', onInputChange));
  
      const speciesControl = L.control({ position: 'topright' });
      speciesControl.onAdd = () => controlDiv;
      speciesControl.addTo(map);
  
      return () => {
        speciesControl.remove();
        checkboxes.forEach(checkbox => checkbox.removeEventListener('change', onInputChange));
      };
    }, [map]);
  
    return null;
  };

  

  const SearchBar = () => {
    const [address, setAddress] = useState('');
    const map = useMap();

    useEffect(() => {
      if (searchLocation) {
        map.panTo(new L.LatLng(searchLocation.latitude, searchLocation.longitude));
      }
    }, [searchLocation, map]);
  
    const handleSearch = async () => { 
      try {
        const response = await axios.post(`http://localhost:4000/map/search`, 
          { address: address });
        const { coordinate, postList } = response.data;
        console.log(response.data);
        setSearchLocation(coordinate);
        setPosts(postList);
      } catch (error) {
        console.error('Error fetching searched data:', error);
        alert('Error fetching searched data:'+ error.message)
      }
    };

    return (
      <div className='search-bar'>
        <input
          type="text"
          placeholder="Search location..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
    );
  };  
  
  const Markers = () => {
    const map = useMap();
    const MarkerClusterGroup = L.markerClusterGroup();

    useEffect(() => {
      const cats = L.featureGroup().addTo(map);
      const dogs = L.featureGroup().addTo(map);
      const others = L.featureGroup().addTo(map);

      posts.forEach(post => {
        const marker = L.marker([post.location.coordinate.latitude, post.location.coordinate.longitude], { icon: customIcon, key: post._id});
        marker.bindPopup(`
          <div>
            ID: <a href="/animal/${post._id}">${post._id}</a><br />
            Species: ${post.species}<br />
            Gender: ${post.gender}<br />
            Health: ${post.health_condition}<br />
            Found Datetime: ${post.found_datetime}<br />
            <img src="${post.photo_url}" alt="Stray" style="max-width: 150px;" />
          </div>
        `);

        if (visibleSpecies[post.species.toLowerCase()]) {
          if (post.species.toLowerCase() === "cat") {
            cats.addLayer(marker);
          } else if (post.species.toLowerCase() === "dog") {
            dogs.addLayer(marker);
          } else {
            others.addLayer(marker);
          }
        }
      });
      map.addLayer(MarkerClusterGroup);

      return () => {
        map.removeLayer(cats);
        map.removeLayer(dogs);
        map.removeLayer(others);
        map.removeLayer(MarkerClusterGroup);
      };
      
    }, [map, posts, visibleSpecies]);
    return null;
  };
  
  return (
    <MapContainer center={centerLocation} zoom={15} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
        <SearchBar />
        <SpeciesCheckboxControl />
        <Markers />
    </MapContainer>
  );
};

export default StrayMap;