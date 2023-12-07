import React, { useRef, useState, useEffect} from 'react';
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

    const buttonRefs = useRef([]);

    const max_length_this_page = 7;
    const length = 50;

    buttonRefs.current = buttonRefs.current.slice(0, length);
          while (buttonRefs.current.length < length) {
              buttonRefs.current.push(React.createRef());
    }

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
      alert("Successfully uploaded!");
      navigate(`/animal/${response.data._id}`);
    } catch (error) {
      console.error('Error uploading post:', error);
      alert('Error uploading post:', error.message);
    }
  };

  const handleKeyDown = (e, index, refArray) => {

      // Check if the arrow keys are pressed
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
       
        e.preventDefault();  // Prevent the default behavior
        // Determine the next element to focus
        const nextIndex = e.key === 'ArrowUp' ? index - 1 : index + 1;
        
        if (nextIndex >= 0 && nextIndex < max_length_this_page) {
          
          refArray.current[nextIndex].current.focus();
        }
      } 
      // Handle other keys if needed
    }    

  return (
    <form onSubmit={handleSubmit}>
      <div>
      <label > Species: </label>
      <select ref={buttonRefs.current[0]} onKeyDown={(e) => handleKeyDown(e, 0, buttonRefs)} name="species" aria-label="species" value={formData.species} onChange={handleChange}>
        <option value="">Select Species</option>
        <option value="Cat">Cat</option>
        <option value="Dog">Dog</option>
        <option value="Others">Others</option>
      </select>
      </div>
      <div>
      <label>Gender: </label>
      <select ref={buttonRefs.current[1]} onKeyDown={(e) => handleKeyDown(e, 1, buttonRefs)} name="gender" aria-label="gender" value={formData.gender} onChange={handleChange}>
        <option value="">Select Gender</option>
        <option value="Female">Female</option>
        <option value="Male">Male</option>
      </select>
      </div>
      <div>
      <label>Health Condition: </label>
      <select ref={buttonRefs.current[2]} onKeyDown={(e) => handleKeyDown(e, 2, buttonRefs)} name="health_condition" aria-label="health condition" value={formData.health_condition} onChange={handleChange}>
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
      <input ref={buttonRefs.current[3]} onKeyDown={(e) => handleKeyDown(e, 3, buttonRefs)}
      type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
      </div>
      <div>
      <label>Address: </label>
      <input ref={buttonRefs.current[4]} onKeyDown={(e) => handleKeyDown(e, 4, buttonRefs)}
      
      type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
      </div>
      <div>
      <label>Photo: </label>
      <input ref={buttonRefs.current[5]} onKeyDown={(e) => handleKeyDown(e, 5, buttonRefs)}
        type="file"
        name="photo_url"
        onChange={handleFileChange}
        aria-label='photo'
      />
      </div>
      <button ref={buttonRefs.current[6]} onKeyDown={(e) => handleKeyDown(e, 6, buttonRefs)}
       type="submit">Submit</button>
    </form>
  );
};

export default PostForm;