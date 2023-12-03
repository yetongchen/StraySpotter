import {locationData} from '../data/index.js';
import { dbConnection, closeConnection } from '../config/mongoConnection.js';

let db = await dbConnection();
await db.dropDatabase();

console.log("--------------------createLocation--------------------");
console.log("Should create and return location 1 & 2");
let location1 = await locationData.createLocation("1313 Grand St, Hoboken, NJ", "12345");
console.log(location1);
let location2 = await locationData.createLocation("Stevens Institute of Technology", "6566b6e8644af9b8d5f9596e");
console.log(location2);

console.log("--------------------getLocationById--------------------");
console.log("Should return locaiton 1");
let locationGot1 = await locationData.getLocationById(location1._id);
console.log(locationGot1);

console.log("--------------------removeLocationByPostId--------------------");
console.log("Should remove location 1 & return location 2 with its city_posts_num reduced to 1")
let remove = await locationData.removeLocationByPostId("12345", location1._id);
console.log(remove);

let locationGot2 = await locationData.getLocationById(location2._id);
console.log(locationGot2);

await db.dropDatabase();
await closeConnection();  
