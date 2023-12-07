import React, { useRef, useState, useEffect, forwardRef} from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate} from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import StrayMap from './components/StrayMap';
import PostDetail from './components/PostDetail';
import Signup from './components/Signup';
import Login from './components/Login';
import UserCenter from './components/UserCenter';
import PostForm from './components/PostForm';
import EditPostForm from "./components/PostEdit";
import PostDelete from "./components/PostDelete";
import './App.css';
import NewPostIcon from './images/add.png';


function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const [userInfo, setUserInfo] = useState(null); 

  const buttonRefs = useRef([]);

  let max_length_this_page = 4;
  const length = 50;

  buttonRefs.current = buttonRefs.current.slice(0, length);
        while (buttonRefs.current.length < length) {
            buttonRefs.current.push(React.createRef());
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, [auth]);

  
  useEffect(() => {
    
    if(!user) {
      max_length_this_page = 3;
    }

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

  useEffect(() => {
    const handleKeyDownWindowsApp = (event) => {
        
      if (event.key === "b" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();  // Prevent the default tab behavior
        buttonRefs.current[0].current.focus();
        console.log("haha");
        console.log(buttonRefs.current[0]);
      }
    };

    // Add event listener for keydown
    window.addEventListener('keydown', handleKeyDownWindowsApp);

    // Cleanup the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDownWindowsApp);
    };
  }, []);

  
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


  const NavLinkReplace = forwardRef(({ path, message, index}, ref) => {
    
    const handleKeyDown = (e, index) => {

      console.log(e.key);
      if (e.key === 'ArrowLeft' && index > 0) {
        // Move to the previous button
        console.log("move left");
        console.log(buttonRefs.current[index]);
        console.log(buttonRefs.current[index - 1]);
        buttonRefs.current[index - 1].current.focus();
      } else if (e.key === 'ArrowRight' && index < max_length_this_page - 1) {
        // Move to the previous button
        console.log("move right");
        console.log(index);
        console.log(buttonRefs.current[index]);
        console.log(buttonRefs.current[index + 1]);
        buttonRefs.current[index + 1].current.focus();
      } else if (e.key === 'Enter') {
        console.log(ref);
        ref.current.click();
      }

    };

    return (
      
      <NavLink aria-label={message} ref={ref} to={path} onKeyDown={(e) => handleKeyDown(e, index)} > 
        {path === '/new' ? <img src={NewPostIcon} alt='Upload a New Post' style={{ verticalAlign: 'middle', height: '20px', marginRight: '5px' }}/> : ''}
        {message}
      </NavLink>
      
    );
  });

  const NavLinkReplaceLoginOut = forwardRef(({index}, ref) => {
   
    const handleKeyDown = (e, index) => {
      
      if (e.key === 'ArrowLeft' && index > 0) {
        // Move to the previous button
        console.log("move left");
        console.log(buttonRefs.current[index]);
        console.log(buttonRefs.current[index - 1]);
        buttonRefs.current[index - 1].current.focus();
      } else if (e.key === 'ArrowRight' && index < max_length_this_page - 1) {
        // Move to the previous button
        console.log("move right");
        console.log(index);
        console.log(buttonRefs.current[index]);
        console.log(buttonRefs.current[index + 1]);
        buttonRefs.current[index + 1].current.focus();
      } else if (e.key === 'Enter') {
        console.log(ref);
        ref.current.click();
      }

    };

    return (
      <NavLink aria-label={user ? "Logout" : "Login"} ref={ref} onKeyDown={(e) => handleKeyDown(e, index)} to={user ? "/" : "/login"}>
      {user ? "Logout" : "Login"}
      </NavLink>
    );
  });

  return (
    <Router>
      <div className="App">
      <nav>
        <ul>
          <li >
            <NavLinkReplace ref={buttonRefs.current[0]} path={'/'} message={'Map'} index ={0}/>
          </li>
          <li>
            <NavLinkReplace ref={buttonRefs.current[1]} path={'/new'} message={'New Post'} index ={1} />
          </li>
          {user ? <li aria-label='User Center'>
            <NavLinkReplace ref={buttonRefs.current[2]} path={'/user-center'} message={'User Center'} index ={2} />
          </li> : null}  
          <li ria-label='login/logout' onClick={user ? handleLogout : null}>
          <NavLinkReplaceLoginOut ref={buttonRefs.current[3]} index ={3} />
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<StrayMap />} />
        <Route path="/animal/:id" element={<PostDetail />} />
        <Route path="/login" element={user ? <Navigate to={"/"} /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to={"/"} /> : <Signup />} />
        <Route path="/user-center" element={user ? <UserCenter /> : <Navigate to={"/"} />} />
        <Route path="/new" element={user ? <PostForm /> : <Navigate to={"/login"} />} />
        <Route path="/post/edit/:id" element={user ? <EditPostForm /> : <Navigate to={"/"} />} />
        <Route path="/post/delete/:id" element={user ? <PostDelete /> : <Navigate to={"/"} />} />
      </Routes>
    </div>
    </Router>
  );
}

export default App;