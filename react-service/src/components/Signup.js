import React, { useState } from 'react';
import axios from 'axios';
import { updateProfile, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { NavLink, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        let {user} = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(auth.currentUser, { displayName: name });
        console.log(user);
        console.log({
            id: user.uid,
            email: email,
            name: name,
        });
        axios.post("http://localhost:4000/user/register", {
            id: user.uid,
            email: email,
            name: name,
        });
        navigate("/");
        // Handle successful signup (e.g., redirect to a dashboard)
    } catch (error) {
      alert(error.message);
    }    
  };

  return (
    <div>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
            <div><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            </div>
            <div><input type="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
            </div>
            <div><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            </div>
            <div><button type="submit">Sign Up</button>
            </div>
        </form>
        <div><NavLink to={"/login"}>Login</NavLink></div>
    </div>
  );
};

export default Signup;
