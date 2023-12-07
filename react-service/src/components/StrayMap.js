import React, { useState, useEffect, useRef } from 'react';
// import ReactDOM from 'react-dom';
// import { NavLink } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
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
    popupAnchor: [0, -76], // Point from which the popup should open relative to the iconAnchor
    alt: "Map marker icon"
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
    
    const buttonRefs = useRef([]);

    const length = 3;

    buttonRefs.current = buttonRefs.current.slice(0, length);
          while (buttonRefs.current.length < length) {
              buttonRefs.current.push(React.createRef());
    }

    useEffect(() => {
      const handleKeyDownWindowsLocation = (event) => {

        if (event.key === "f" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();  // Prevent the default behavior
          buttonRefs.current[0].current.focus();
          console.log("go to species filter of map");
        }   
      };
  
      // Add event listener for keydown
      console.log("post form listener");
      window.addEventListener('keydown', handleKeyDownWindowsLocation);
  
      // Cleanup the event listener
      return () => {
        window.removeEventListener('keydown', handleKeyDownWindowsLocation);
      };
    }, []);

    useEffect(() => {
      const controlDiv = L.DomUtil.create('div', 'species-control');
      controlDiv.innerHTML = `
        <form>
          <label><input type="checkbox" class="species-checkbox" value="cat" ${visibleSpecies.cat ? 'checked' : ''}  aria-label="Filter for cats"/> Cats</label><br>
          <label><input type="checkbox" class="species-checkbox" value="dog" ${visibleSpecies.dog ? 'checked' : ''}  aria-label="Filter for dogs"/> Dogs</label><br>
          <label><input type="checkbox" class="species-checkbox" value="others" ${visibleSpecies.others ? 'checked' : '' } aria-label="Filter for others animal"/> Others</label>
        </form>
      `;

       // Assign refs
    buttonRefs.current[0].current = controlDiv.querySelector('.species-checkbox[value="cat"]');
    buttonRefs.current[1].current = controlDiv.querySelector('.species-checkbox[value="dog"]');
    buttonRefs.current[2].current = controlDiv.querySelector('.species-checkbox[value="others"]');

  
    const handleKeyPress = (event, index) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        buttonRefs.current[index].current.click();
        buttonRefs.current[index].current.focus();
      }
    };

    // Attach the keypress event listener to each checkbox
    const checkboxesFilter = controlDiv.querySelectorAll('.species-checkbox');
    checkboxesFilter.forEach((checkbox, index) => {
      checkbox.addEventListener('keypress', (event) => handleKeyPress(event, index));
    });

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
    }, [map]);
  
    const handleSearch = async () => { 
      
      alert('Search initiated'); 
      try {
        const response = await axios.post(`http://localhost:4000/map/search`, 
          { address: address });
        const { coordinate, postList } = response.data;
        console.log(response.data);
        setSearchLocation(coordinate);
        //setPosts(postList);
      } catch (error) {
        console.error('Error fetching searched data:', error);
        alert('Error fetching searched data:'+ error.message)
      }
    };

    const buttonRef = useRef(null);

    useEffect(() => {
      const handleKeyDownWindowsLocation = (event) => {

        if (event.key === "l" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();  // Prevent the default behavior
          buttonRef.current.focus();
          console.log("go to search location bar");
        }   
      };
  
      // Add event listener for keydown
      console.log("post form listener");
      window.addEventListener('keydown', handleKeyDownWindowsLocation);
  
      // Cleanup the event listener
      return () => {
        window.removeEventListener('keydown', handleKeyDownWindowsLocation);
      };
    }, []);


    return (
      <div  className='search-bar'>
        <input
          type="text"
          ref={buttonRef}
          placeholder="Search location..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          aria-label="Location Search bar"
        />
        
        <button
          aria-label="Click or press enter to search"
          onClick={handleSearch}
        >
          Search
        </button>

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

      const grouped = {};

      posts.forEach(post => {
        // Create a unique key for each location
        const locationKey = `${post.location.coordinate.latitude},${post.location.coordinate.longitude}`;

        // Initialize the array for this location if it doesn't exist
        if (!grouped[locationKey]) {
          grouped[locationKey] = [];
        }

        // Add the post to the array for this location
        grouped[locationKey].push(post);
      });

      function createPopupContent(postList, currentIndex, locationKey) {
        let posts = [];
        //console.log("postList", postList);
        postList.forEach(post => {
          if (visibleSpecies[post.species.toLowerCase()]){
            posts.push(post);
          }
        });
        //console.log("current posts", posts);
        if (posts.length === 0) return null;
        let post = posts[currentIndex];
        let popupContent = `
          <div style="max-height: 300px; overflow: auto;"}>
            ID: <a href="/animal/${post._id}">${post._id}</a><br />
            Species: ${post.species}<br />
            Gender: ${post.gender}<br />
            Health: ${post.health_condition}<br />
            Found Datetime:<br>${post.found_datetime}<br />
            <img src="${post.photo_url}" alt="Stray" style="max-width: 180px;" />
          </div>
          <div class="popup-navigation">
            ${currentIndex > 0 ? `<button onclick="changePopupPost('${locationKey}', ${currentIndex - 1})">&lt;</button>` : ''}
            ${posts.length > 1 ? currentIndex + 1 : ''}
            ${currentIndex < posts.length - 1 ? `<button onclick="changePopupPost('${locationKey}', ${currentIndex + 1})">&gt;</button>` : ''}
          </div>
          
        `;

        return popupContent;
      };

      let postsOfSpeciesAtLocation = {};

      Object.entries(grouped).forEach(([locationKey, postsAtLocation]) => {
        const [latitude, longitude] = locationKey.split(",");
        const marker = L.marker([parseFloat(latitude), parseFloat(longitude)], { icon: customIcon, key: locationKey });
        
        if (!postsOfSpeciesAtLocation[locationKey]) {
          postsOfSpeciesAtLocation[locationKey] = {
            cat : [],
            dog: [],
            others: []
          };
        }
        for (let i = 0; i < postsAtLocation.length; i++){
          let post = postsAtLocation[i];
          if (visibleSpecies[post.species.toLowerCase()]) {
            if (post.species.toLowerCase() === "cat") {
              cats.addLayer(marker);
              postsOfSpeciesAtLocation[locationKey]["cat"].push(post);
            } else if (post.species.toLowerCase() === "dog") {
              dogs.addLayer(marker);
              postsOfSpeciesAtLocation[locationKey]["dog"].push(post);
            } else {
              others.addLayer(marker);
              postsOfSpeciesAtLocation[locationKey]["others"].push(post);
            }
          }
        }
        marker.bindPopup(createPopupContent(grouped[locationKey], 0, locationKey));
      });

      // console.log("postsOfSpeciesAtLocation", postsOfSpeciesAtLocation);

      window.changePopupPost = (locationKey, newIndex) => {
        let posts = [];
        if (visibleSpecies.cat) posts = posts.concat(postsOfSpeciesAtLocation[locationKey]["cat"]);
        if (visibleSpecies.dog) posts = posts.concat(postsOfSpeciesAtLocation[locationKey]["dog"]);
        if (visibleSpecies.others) posts = posts.concat(postsOfSpeciesAtLocation[locationKey]["others"]);
        //console.log("change popup post", posts);
        if (posts && posts[newIndex]) {
          const newContent = createPopupContent(posts, newIndex, locationKey);
          const [latitude, longitude] = locationKey.split(",");
          L.popup()
            .setLatLng([parseFloat(latitude), parseFloat(longitude)])
            .setContent(newContent)
            .openOn(map);
        }
      };  

      // posts.forEach(post => {
      //   const marker = L.marker([post.location.coordinate.latitude, post.location.coordinate.longitude], { icon: customIcon, key: post._id});
      //   marker.bindPopup(`
      //     <div>
      //       ID: <a href="/animal/${post._id}">${post._id}</a><br />
      //       Species: ${post.species}<br />
      //       Gender: ${post.gender}<br />
      //       Health: ${post.health_condition}<br />
      //       Found Datetime: ${post.found_datetime}<br />
      //       <img src="${post.photo_url}" alt="Stray" style="max-width: 150px;" />
      //     </div>
      //   `);

      //   if (visibleSpecies[post.species.toLowerCase()]) {
      //     if (post.species.toLowerCase() === "cat") {
      //       cats.addLayer(marker);
      //     } else if (post.species.toLowerCase() === "dog") {
      //       dogs.addLayer(marker);
      //     } else {
      //       others.addLayer(marker);
      //     }
      //   }
      // });
      map.addLayer(MarkerClusterGroup);

      return () => {
        map.removeLayer(cats);
        map.removeLayer(dogs);
        map.removeLayer(others);
        map.removeLayer(MarkerClusterGroup);
      };
      
    }, [map, MarkerClusterGroup]);
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