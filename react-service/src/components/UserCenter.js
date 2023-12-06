import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged} from "firebase/auth";
import { NavLink } from "react-router-dom";
import axios from "axios";
import noImage from "../images/no-image.png";
import "../styles/UserCenter.css";

const UserCenter = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(true);
  const auth = getAuth(); // 获取 Firebase Auth 的实例
  const [userInfo, setUserInfo] = useState(null); // 新状态来存储从你的后端获取的用户信息

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, [auth]);

  // new useEffect to get userInfo
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `http://localhost:4000/user/${user.uid}`
          );
          setUserInfo(response.data);
          setLoading(false);
          setNotFound(false);
          console.log(response.data);
        } catch (error) {
          console.error("Error fetching user info:", error);
          setNotFound(true);
          setLoading(false);
        }
      } else {
        // if the user is not logged in，clear userInfo
        setUserInfo(null);
      }
    };

    fetchUserInfo();
  }, [user]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (userInfo) {
          const response = await axios.get(`http://localhost:4000/post/user/${userInfo._id}`);
        setPosts(response.data);
        console.log("here",response.data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [userInfo]);

  if (loading) {
    return (
        <div>
            <h2 style={{textAlign: 'center'}}>Loading....</h2>
        </div>
    );
  } else if (notFound) {
    return (
    <div>
        <h2 style={{textAlign: 'center'}}>Error 404: There was a problem fetching User Center</h2>
    </div>
    );
  } else {
    return (
      <div>
        <h2>My Posts</h2>
        <div><NavLink to="/new">Upload a new post</NavLink></div>
        <div>
          {posts.map(post => (
              <div key={post._id} className='user-post'>
                  <img src={post.photo_url ? post.photo_url : noImage} alt={`Found ${post.species}`} className="post-image" style={{ maxWidth: '300px' }}/>
                  <h2>Details about the Found {post.species === "Others" ? "Animal" : post.species}</h2>
                  <p><strong>ID:</strong> <NavLink to={`/animal/${post._id}`}>{post._id}</NavLink><br /></p>
                  <p><strong>Species:</strong> {post.species ? post.species : "Unknown"}</p>
                  <p><strong>Gender:</strong> {post.gender ? post.gender : "Unknown"}</p>
                  <p><strong>Health Condition:</strong> {post.health_condition ? post.health_condition : "Unknown"}</p>
                  <div><NavLink to={`/post/edit/${post._id}`}>Edit</NavLink></div>
                <div><NavLink to={`/post/delete/${post._id}`}>Delete</NavLink></div>

              </div>
          ))}
        </div>
      </div>
    );
  }
};

export default UserCenter;