import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import '../styles/PostDetail.css'; // Assuming you have a CSS file for styling
import noImage from "../images/no-image.png";

const PostDetail = ({ props }) => {
    const {id} = useParams();
    const [post, setPost] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(true);

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
            <div className="post-details">
                <img src={post.photo_url ? post.photo_url : noImage} alt={`Found ${post.species}`} className="post-image"/>
                <h2>Details about the Found {post.species === "Others" ? "Animal" : post.species}</h2>
                <p><strong>ID:</strong> {post._id}</p>
                <p><strong>Species:</strong> {post.species ? post.species : "Unknown"}</p>
                <p><strong>Gender:</strong> {post.gender ? post.gender : "Unknown"}</p>
                <p><strong>Health Condition:</strong> {post.health_condition ? post.health_condition : "Unknown"}</p>
                <p><strong>Found Date & Time:</strong> {post.found_datetime}</p>
                <p><strong>Found Location:</strong> {post.location ? post.location.address + ", " + post.location.city + ", " + post.location.state : "Unknown"}</p>
                <p><strong>Description:</strong> {post.description ? post.description : "Unknown"}</p>
            </div>
        );
    }
};

export default PostDetail;
