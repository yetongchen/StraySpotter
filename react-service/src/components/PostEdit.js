import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged} from "firebase/auth";
import axios from 'axios';
import {useNavigate, useParams} from 'react-router-dom';

const EditPostForm = () => {
    const {id} = useParams();
    // const [loading, setLoading] = useState(true);
    // const [notFound, setNotFound] = useState(true);

    const [user, setUser] = useState(null);
    const auth = getAuth(); // 获取 Firebase Auth 的实例
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null); // 新状态来存储从你的后端获取的用户信息
    const [formData, setFormData] = useState({
        user_id: '',
        species: '',
        gender: '',
        health_condition:'',
        description: '',
        photo_url: '',
        address: ''
    });

    const [post, setPost] = useState({
        user_id: '',
        species: '',
        gender: '',
        health_condition:'',
        description: '',
        photo_url: '',
        address: ''
    });


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
                setFormData(data);
                // setLoading(false);
                // setNotFound(false);
            })
            .catch ((e) => {
                console.error("Error fetching event", e);
                // setNotFound(true);
                // setLoading(false);
            });
    }, [id]);

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
            if (userInfo._id !== post.user_id) {
                alert("You can only edit your posts");
                navigate('/');    
            }
            setFormData(prevState => ({
                ...prevState,
                user_id: userInfo._id
            }));
        }

    }, [userInfo, navigate, post]); // useEffect will run when `id` changes


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
        formDataToSend.append('post_id', id);
        formDataToSend.append('species', formData.species? formData.species: post.species);
        formDataToSend.append('gender', formData.gender? formData.gender: post.gender);
        formDataToSend.append('health_condition', formData.health_condition? formData.health_condition: post.health_condition);
        formDataToSend.append('description', formData.description? formData.description: post.description);
        formDataToSend.append('address', formData.address? formData.address: post.location.address);

        if (formData.photo_url) {
            formDataToSend.append('photo_url', formData.photo_url);
        }
        console.log(formData.photo_url);
        console.log("formDataToSend", formDataToSend);
        console.log("url: ",`http://localhost:4000/post/${id}`)
        try {
            const response = await axios.post(`http://localhost:4000/post/${id}`,
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
                <select name="species" value={post.species} onChange={handleChange}>
                    <option value="">Select Species</option>
                    <option value="Cat">Cat</option>
                    <option value="Dog">Dog</option>
                    <option value="Others">Others</option>
                </select>
            </div>
            <div>
                <label>Gender: </label>
                <select name="gender" value={post.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                </select>
            </div>
            <div>
                <label>Health Condition: </label>
                <select name="health_condition" value={post.health_condition} onChange={handleChange}>
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
                <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder={post.description} />
            </div>
            <div>
                <label>Address: </label>
                <input type="text" name="address" value={post.address} onChange={handleChange} placeholder={post.location ? post.location.address + ", " + post.location.city + ", " + post.location.state : "Unknown"} />
            </div>
            <img src={post.photo_url} alt="Preview" style={{ maxWidth: '400px' }} />
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

export default EditPostForm;