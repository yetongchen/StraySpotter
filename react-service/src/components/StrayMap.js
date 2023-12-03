import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import marker_icon from '../images/pin.png';
import '../App.css';

const StrayMap = () => {
  const [posts, setPosts] = useState([]);
  const [userLocation, setUserLocation] = useState([40.745255, -74.034775]);
  const [selectedSpecies, setSelectedSpecies] = useState("all");

  const customIcon = L.icon({
    iconUrl: marker_icon, 
    iconSize: [55, 55], // Size of the icon
    iconAnchor: [27, 94], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -76] // Point from which the popup should open relative to the iconAnchor
  });

  const SpeciesFilterControl = ({ onFilterChange }) => {
    const map = useMap();
  
    const SpeciesFilter = ({ onChange }) => {
      return (
        <div className="species-filter-control">
          <form>
            <label className='filter-container'>
              <input
                type="radio"
                value="all"
                name="radio"
                onChange={(e) => onChange(e.target.value)}
              />
              <span class="checkmark"></span>
              All
            </label>
            <label className='filter-container'>
              <input
                type="radio"
                value="cat"
                name="radio"
                onChange={(e) => onChange(e.target.value)}
              />
              <span class="checkmark"></span>
              Cats
            </label>
            <label className='filter-container'>
              <input
                type="radio"
                value="dog"
                name="radio"
                onChange={(e) => onChange(e.target.value)}
              />
              <span class="checkmark"></span>
              Dogs
            </label>
            <label className='filter-container'>
              <input
                type="radio"
                value="others"
                name="radio"
                onChange={(e) => onChange(e.target.value)}
              />
              <span class="checkmark"></span>
              Others
            </label>
          </form>
        </div>
      );
    };
    
    useEffect(() => {
      const controlDiv = L.DomUtil.create('div', 'species-filter-control');
      controlDiv.innerHTML = `
        <form>
        <label className='filter-container'>
          <input
            type="radio"
            value="all"
            name="radio"
          />
          <span class="checkmark"></span>
          All
        </label>
        <label className='filter-container'>
          <input
            type="radio"
            value="cat"
            name="radio"
          />
          <span class="checkmark"></span>
          Cats
        </label>
        <label className='filter-container'>
          <input
            type="radio"
            value="dog"
            name="radio"
          />
          <span class="checkmark"></span>
          Dogs
        </label>
        <label className='filter-container'>
          <input
            type="radio"
            value="others"
            name="radio"
          />
          <span class="checkmark"></span>
          Others
        </label>
      </form>
      `;
      controlDiv.onchange = (e) => {
        if (e.target.type === 'radio') {
          onFilterChange(e.target.value);
        }
      };

      const customControl = L.Control.extend({
        onAdd: function(map) {
          return controlDiv;
        }
      });
  
      const control = new customControl({ position: 'bottomright' }).addTo(map);
      return () => map.removeControl(control);
    }, [map, onFilterChange]);
  
    return null;
  };

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
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        console.error("Unable to retrieve your location");
      }
    );
  }, []);

  return (
    <MapContainer center={userLocation} zoom={13} style={{ height: '100vh', width: '100%' }}
      doubleClickZoom={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SpeciesFilterControl onFilterChange={setSelectedSpecies} />
      {posts.filter(post => selectedSpecies === 'all' || post.species.toLowerCase() === selectedSpecies)
        .map(post => (
          <Marker key={post._id} position={[post.location.coordinate.latitude, post.location.coordinate.longitude]} icon={customIcon} >
            <Popup>
              ID : <NavLink to={`/animal/${post._id}`}>{post._id}</NavLink><br />
              Species: {post.species}<br />
              Gender: {post.gender}<br />
              Health: {post.health_condition}<br />
              Found Datetime: {post.found_datetime}<br />
              <img src={post.photo_url} alt="Stray" style={{ maxWidth: '150px' }} />
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default StrayMap;