import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged} from "firebase/auth";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PostForm = () => {
    const [user, setUser] = useState(null);
    const auth = getAuth(); // 获取 Firebase Auth 的实例
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null); // 新状态来存储从你的后端获取的用户信息
    const [formData, setFormData] = useState({
        user_id: '',
        species: '',
        gender: '',
        health_condition: "", 
        description: '',
        photo_url: '',
        address: ''
    });

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
        if (userInfo && userInfo._id) {
            setFormData(prevState => ({
                ...prevState,
                user_id: userInfo._id
            }));
        }
        
    }, [userInfo]); // useEffect will run when `id` changes


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prevState => ({
      ...prevState,
      photo_url: e.target.files[0]
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('user_id', user.uid);
    formDataToSend.append('species', formData.species);
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('health_condition', formData.health_condition);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('address', formData.address);

    if (formData.photo_url) {
        formDataToSend.append('photo_url', formData.photo_url);
      }
    try {    
      const response = await axios.post('http://localhost:4000/post/new',
      formDataToSend, 
        {
            headers: {
            'Content-Type': 'multipart/form-data'
            },
        }
      );
      // Handle response
      console.log('Success:', response.data);
      navigate(`/animal/${response.data._id}`);
    } catch (error) {
      console.error('Error uploading post:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
      <label>Species: </label>
      <select name="species" value={formData.species} onChange={handleChange}>
        <option value="">Select Species</option>
        <option value="Cat">Cat</option>
        <option value="Dog">Dog</option>
        <option value="Others">Others</option>
      </select>
      </div>
      <div>
      <label>Gender: </label>
      <select name="gender" value={formData.gender} onChange={handleChange}>
        <option value="">Select Gender</option>
        <option value="Female">Female</option>
        <option value="Male">Male</option>
      </select>
      </div>
      <div>
      <label>Health Condition: </label>
      <select name="health_condition" value={formData.health_condition} onChange={handleChange}>
        <option value="">Select Health Condition</option>
        <option value="Healthy">Healthy</option>
        <option value="Injured">Injured</option>
        <option value="Sick">Sick</option>
        <option value="Malnourished">Malnourished</option>
        <option value="Pregnant">Pregnant</option>
        <option value="Unknown">Unknown</option>
      </select>
      </div>
      <div>
      <label>Description: </label>
      <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
      </div>
      <div>
      <label>Address: </label>
      <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
      </div>
      <div>
      <input
        type="file"
        name="photo_url"
        onChange={handleFileChange}
      />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default PostForm;
