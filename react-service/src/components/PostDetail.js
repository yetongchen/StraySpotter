import React, {useRef, useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import '../styles/PostDetail.css'; // Assuming you have a CSS file for styling
import noImage from "../images/no-image.png";

import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { NavLink } from 'react-router-dom';
import marker_icon from '../images/pin.png';
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';

const PostDetail = ({ props }) => {
    const {id} = useParams();
    const [post, setPost] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(true);
    
    const customIcon = L.icon({
        iconUrl: marker_icon, 
        iconSize: [55, 55], // Size of the icon
        iconAnchor: [27, 94], // Point of the icon which will correspond to marker's location
        popupAnchor: [0, -76] // Point from which the popup should open relative to the iconAnchor
      });

    const buttonRefs = useRef([]);

    const max_length_this_page = 9;
    const length = 50;

    buttonRefs.current = buttonRefs.current.slice(0, length);
          while (buttonRefs.current.length < length) {
              buttonRefs.current.push(React.createRef());
    }

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/post/${id}`);
                return response.data;
            } catch (error) {
                alert(error.message);
            }
        };
        fetchPost()
            .then((data) => {
                setPost(data);
                setLoading(false);
                setNotFound(false);
            })
            .catch ((e) => {
                console.error("Error fetching event", e);
                setNotFound(true);
                setLoading(false);
            });
    }, [id]);
    
    const handleKeyDown = (e, index, refArray) => {

        // Check if the arrow keys are pressed
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
         
          e.preventDefault();  // Prevent the default behavior
          // Determine the next element to focus
          
          const nextIndex = e.key === 'ArrowUp' ? index - 1 : index + 1;
          console.log(index);
          console.log(nextIndex);
          
          if (nextIndex >= 0 && nextIndex < max_length_this_page) {
            
            refArray.current[nextIndex].current.focus();
          }
        } 
        // Handle other keys if needed
      } 

    if (loading) {
        return (
            <div>
                <h2 style={{textAlign: 'center'}}>Loading....</h2>
            </div>
        );
    } else if (notFound) {
        return (
        <div>
            <h2 style={{textAlign: 'center'}}>Error 404: There was a problem fetching post details</h2>
        </div>
        );
    } else {
        return (
            <div className="container">
                    <div id="panelLeft" className="left-panel">
                        <div className="post-details">
                            <div ref={buttonRefs.current[0]} tabIndex="0" onKeyDown={(e) => handleKeyDown(e, 0, buttonRefs)}>
                                <img src={post.photo_url? post.photo_url : noImage} alt={`Found ${post.species}`} className="post-image"/>
                            </div>
                            <div ref={buttonRefs.current[1]}  tabIndex="0"onKeyDown={(e) => handleKeyDown(e, 1, buttonRefs)}>
                                <h2>Details about the Found {post.species === "Others" ? "Animal" : post.species}</h2>
                            </div>
                            <div ref={buttonRefs.current[2]} tabIndex="0" onKeyDown={(e) => handleKeyDown(e, 2, buttonRefs)}>
                                <p><strong>ID:</strong> {post._id}</p>
                            </div>
                            <div ref={buttonRefs.current[3]} tabIndex="0" onKeyDown={(e) => handleKeyDown(e, 3, buttonRefs)}>
                                <p><strong>Species:</strong> {post.species ? post.species : "Unknown"}</p>
                            </div>
                            <div ref={buttonRefs.current[4]} tabIndex="0" onKeyDown={(e) => handleKeyDown(e, 4, buttonRefs)}>
                                <p><strong>Gender:</strong> {post.gender ? post.gender : "Unknown"}</p>
                            </div>
                            <div ref={buttonRefs.current[5]} tabIndex="0" onKeyDown={(e) => handleKeyDown(e, 5, buttonRefs)}>
                                <p><strong>Health Condition:</strong> {post.health_condition ? post.health_condition : "Unknown"}</p>
                            </div>
                            <div ref={buttonRefs.current[6]} tabIndex="0" onKeyDown={(e) => handleKeyDown(e, 6, buttonRefs)}>
                                <p><strong>Found Date & Time:</strong> {post.found_datetime}</p>
                            </div>
                            <div ref={buttonRefs.current[7]} tabIndex="0" onKeyDown={(e) => handleKeyDown(e, 7, buttonRefs)}>
                                <p><strong>Found Location:</strong> {post.location ? post.location.address + ", " + post.location.city + ", " + post.location.state : "Unknown"}</p>
                            </div>
                            <div ref={buttonRefs.current[8]} tabIndex="0" onKeyDown={(e) => handleKeyDown(e, 8, buttonRefs)}>
                                <p><strong>Description:</strong> {post.description ? post.description : "Unknown"}</p>
                            </div>
                        </div>
                    </div>

                <div id="panelRight" className="right-panel">
                    <MapContainer center={[post.location.coordinate.latitude, post.location.coordinate.longitude]} zoom={13} style={{ height: '100vh', width: '100%' }}
                    doubleClickZoom={false}>
                    
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
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
                    </MapContainer>
                </div>
            </div>
        );
    }
};

export default PostDetail;