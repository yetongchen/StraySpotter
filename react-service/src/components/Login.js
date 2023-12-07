import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { NavLink, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = getAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // let user = null;
        try {
        await signInWithEmailAndPassword(auth, email, password);
        if (auth.currentUser) {
            navigate("/");
        }
        // Handle successful login (e.g., redirect to a dashboard)
        } catch (error) {
        alert(error.message);
        }
    };

    return (
        <div>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
            <div><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required /></div>
            <div><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required /></div>
            <div><button type="submit">Login</button></div>
        </form>
        <div><NavLink to={"/signup"}>Signup</NavLink></div>
        </div>
    );
};

export default Login;
