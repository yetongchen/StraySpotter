import { user } from "../config/mongoCollection.js";
import validation from "../validation.js";
import bcrypt from 'bcrypt';

/**
 * @param {string} _id - the unique id of user
 * @param {string} email - the email of the user
 * @param {String} name - the name of user, name can be multiple in database
 * @param {String} password - the password
 * @param {String} posts - the post array of the user
 */

// const createUser = async (email, name, password) => {

//     email = validation.validateEmail(email);
//     name = validation.validateName(name);
//     password = validation.validatePassword(password);

//     const userdb = await user();

//     // Check the email is used or not
//     let duplicate_email = await userdb.findOne({email: email});
//     if (duplicate_email) throw 'Error: this email is already register by someone else';

//     // hash the password
//     let saltRounds = 10
//     const hashPassword = await bcrypt.hash(password, saltRounds);
        
//     // store the info to userdb
//     const UserData = {
//         email : email,
//         name : name,
//         password : hashPassword,
//         posts: []
//     };

//     const insertInfo = await userdb.insertOne(UserData);
//     if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Can not insert this user.";

//     const userInserted = await getUserById(insertInfo.insertedId.toString());
//     return userInserted;
// };

const createUser = async (id, email, name) => {
    id = validation.validateId(id);
    email = validation.validateEmail(email);
    name = validation.validateName(name);

    const userdb = await user();

    // Check the email is used or not
    let duplicate_email = await userdb.findOne({email: email});
    if (duplicate_email) throw 'this email is already register by someone else';
        
    // store the info to userdb
    const UserData = {
        _id: id,
        email : email,
        name : name,
        posts: []
    };
    
    const insertInfo = await userdb.insertOne(UserData);
    // console.log("insert", insertInfo);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Can not insert this user.";
    const userInserted = await getUserById(insertInfo.insertedId);
    // console.log(userInserted);
    return userInserted;
};


const updateUser = async (email, name, password) => {

    name = validation.validateName(name);
    password = validation.validatePassword(password);

    const userdb = await user();

    // hash the password

    saltRounds = 10
    const hashPassword = bcrypt.hash(password, saltRounds)

    // if the original password is same as previous password, throw error

    const extractInfo = await userdb.findOne({email: email})

    if (extractInfo.password === hashPassword) throw 'Error: please do not use previous password'


        
    // store the info to userdb

    const updateInfo = await userdb.updateOne(
        {email: email},
        {$set: 
            {name:  name, password: hashPassword}},
        );

    if (!updateInfo.acknowledged || !updateInfo.insertedId) throw "Can not update this user.";

    return true
};


const getUserById = async (user_id) => {
    user_id = validation.validateId(user_id);
    const userdb = await user();
    const Info = await userdb.findOne({_id: user_id});
    return Info;
};

const login = async (email, password) => {

    email = validation.validateEmail(email)

    const userdb = await user();

    saltRounds = 10
    const hashPassword = bcrypt.hash(password, saltRounds)

    // if the password is same as stored password

    const extractInfo = await userdb.findOne({email: email})

    if (extractInfo.password === hashPassword) return extractInfo

    return false
    
};

export default {
    createUser,
    updateUser,
    getUserById,
    login,

};