import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom'; // Make sure to include useNavigate
import axios from 'axios';
import { getAuth, onAuthStateChanged} from "firebase/auth";


const PostDelete = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const navigate = useNavigate();

    const auth = getAuth();
    const [user, setUser] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        const fetchUserInfo = async () => {
        if (user) {
            try {
            const response = await axios.get(
                `http://localhost:4000/user/${user.uid}`
            );
            setUserInfo(response.data);
            console.log(response.data);
            } catch (error) {
            console.error("Error fetching user info:", error);
            }
        } else {
            // if the user is not logged in，clear userInfo
            setUserInfo(null);
        }
        };

        fetchUserInfo();
    }, [user]);

    useEffect(() => {
        if (userInfo && post) {
            if (userInfo._id !== post.user_id) {
                alert("You can only edit your posts");
                navigate('/');    
            };
        }       
    }, [userInfo, navigate, post]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/post/${id}`);
                setPost(response.data);
            } catch (error) {
                console.error("Error fetching post:", error);
            }
        };

        fetchPost();
    }, [id]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this post?');

        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:4000/post/${id}`);
                navigate('/user-center');
            } catch (error) {
                console.error("Error deleting post:", error);
            }
        }
    };

    return (
        <div>
            <h2>Delete Post</h2>
            {post && (
                <>
                    <p>ID: {post._id}</p>
                    <p>Species: {post.species}</p>
                    <p>Gender: {post.gender}</p>
                    {/* Display other post details as needed */}
                    <button onClick={handleDelete}>Confirm Delete</button>
                    <NavLink to="/user-center">Cancel</NavLink>
                </>
            )}
        </div>
    );
};

export default PostDelete;