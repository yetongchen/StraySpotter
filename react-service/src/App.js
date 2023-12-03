import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import StrayMap from './components/StrayMap';
import PostDetail from './components/PostDetail';
import Signup from './components/Signup';
import Login from './components/Login';
import UserCenter from './components/UserCenter';
import PostForm from './components/PostForm';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();
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
        setUserInfo(null);
      }
    };
    fetchUserInfo();
  }, [user]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert("User signed out");
        setUserInfo(null);
      })
      .catch((error) => {
        alert("Sign out error:", error);
      });
  };

  return (
    <Router>
      <div className="App">
      <nav>
        <ul>
          <li>
            <NavLink to="/">Map</NavLink>
          </li>
          {user ? <li>
            <NavLink to="/user-center">User Center</NavLink>
          </li> : null}
          <li onClick={user ? handleLogout : null}>
            <NavLink to={user ? "/" : "/login"}>
              {user ? "Logout" : "Login"}
            </NavLink>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<StrayMap />} />
        <Route path="/animal/:id" element={<PostDetail />} />
        <Route path="/login" element={user ? <Navigate to={"/"} /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to={"/"} /> : <Signup />} />
        <Route path="/user-center" element={<UserCenter />} />
        <Route path="/new" element={<PostForm />} />
      </Routes>
    </div>
    </Router>
  );
}

export default App;
