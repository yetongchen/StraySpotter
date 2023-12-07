import fs from 'fs';
import { postData, userData } from "../data/index.js";
import { dbConnection, closeConnection } from '../config/mongoConnection.js';

let db = await dbConnection();
await db.dropDatabase();

// Define the file path
const filePath = './data-service/tests/output.txt'; // Replace with your text file's path

const fd = fs.openSync(filePath, 'r');
// Read the text file line by line
const lines = fs.readFileSync(fd, 'utf-8').split('\n');

const user_id_temp = "SYgMdSPLQoYT2gntlMid9vthRmC3";

console.log("Run");

const user1 = await userData.createUser("SYgMdSPLQoYT2gntlMid9vthRmC3", "test@mail.com", "testname");
const user2 = await userData.createUser("EgW9x0YPypfBZE2x5H8VuX6U9483", "test1@mail.com", "May");

console.log("--------------------createPost--------------------");
// Process each line
let i = 0;

for (const line of lines) {
    // Split the line by semicolon to extract information
    const parts = line.split(';');

    // Assuming each line has two values separated by a semicolon
    
    i = i + 1;

    if (i === 20) {
        break;
        
    }
    const user_id = user_id_temp;
    const species = parts[0].trim();
    const gender = parts[1].trim();
    const health_condition = parts[2].trim();
    const description = parts[3].trim();
    const dateTime = parts[4].trim();
    const photo_url = null;
    const location_id = parts[6].trim();
    try {
        let post = await postData.createPost(
            user_id,
            species,
            gender,
            health_condition,
            description,
            photo_url,
            location_id
        );
    } catch (error) {
        console.log(error);
    }
    
}

fs.closeSync(fd);
console.log("--------------finish--------------------");
process.exit(0);