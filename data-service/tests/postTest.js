import { postData, userData } from "../data/index.js";
import { dbConnection, closeConnection } from '../config/mongoConnection.js';

let db = await dbConnection();
await db.dropDatabase();

const user1 = await userData.createUser("test1@test.com", "May", "Test123@");
const user2 = await userData.createUser("test2@test.com", "John", "Test123@");

console.log("--------------------createPost--------------------");
console.log("Should create and return post 1 & 2 & 3");
let post1 = await postData.createPost(
    user1._id,
    "Dog",
    "Female",
    "Good",
    "Small brown dog with a fluffy tail, very friendly.",
    "public\\images\\dog1.jpg",
    "1 Castle Point Terrace, Hoboken, NJ"
);
console.log(post1);
let post2 = await postData.createPost(
    user1._id,
    "Cat",
    "Male",
    "Bad",
    "Black and white cat, appears to have a limp in its right front paw.",
    "public\\images\\cat1.jpg",
    "400 Garden St, Hoboken, NJ"
);
console.log(post2);
let post3 = await postData.createPost(
    user2._id,
    "Others",
    "Female",
    "Normal",
    "White rabbit with red eyes, very timid, seems underfed.",
    "public\\images\\rabbit1.jpg",
    "Wittpenn Walk, Hoboken, NJ"
);
console.log(post3);

console.log("--------------------updatePost--------------------");
console.log("Should update and return post 1");
let updatedpost1 = await postData.updatePost(
    post1._id,
    "Dog",
    "Male",
    "Good",
    "Small brown dog with a fluffy tail, very friendly.",
    null,
    "Dobbelaar Field, Hoboken, NJ"
);
console.log(updatedpost1);

console.log("--------------------getPostByPostId--------------------");
console.log("Should return post 1");
const postGot = await postData.getPostByPostId(post1._id);
console.log(postGot);

console.log("--------------------getPostByUserId--------------------");
console.log("Should return post 1 & 2 with user1");
const postsByUser = await postData.getPostByUserId(user1._id);
console.log(postsByUser);

console.log("--------------------removePostById--------------------");
console.log("Should remove post 1")
let remove = await postData.removePostById(post1._id);
console.log(remove);

console.log("--------------------getAllPosts--------------------");
console.log("Should return post 2 & 3");
let posts = await postData.getAllPosts();
console.log(posts);

//await db.dropDatabase();
await closeConnection();  