import { ObjectId } from "mongodb";
import nodeGeocoder from 'node-geocoder';
import { location } from "../config/mongoCollection.js";
import validation from "../validation.js";

const convertLocation = async (address) => {
  // Validate input
  if (!address) throw "Please provide an address";
  if (typeof address !== "string") throw "Address should be a string";
  address = address.trim();
  if (address.length === 0) throw "Address should not contain only spaces";

  const reg = /^[a-zA-Z0-9\s,#*]*$/;
  if (!reg.test(address)) {
    throw "This is an invalid address";
  }

  const options = {
    provider: "openstreetmap",
  };
  const geoCoder = nodeGeocoder(options);

  try {
    // Attempt to geocode the location
    const result = await geoCoder.geocode(address);

    // Validate geocode results
    if (!result || result.length < 1 ||!reg.test(result[0].state) || !reg.test(result[0].city)) {
      throw "This is an invalid address";
    }
    return result[0];
  } catch (error) {
    throw "Geocoding failed: " + error.message;
  }
};

const updateCityNum = async (state, city, num) => {
    const locationCollection = await location();
    let updateInfo = await locationCollection.updateMany(
      {
        state: state,
        city: city,
      },
      { $set: { city_posts_num: num } }
    );
    if (!updateInfo.acknowledged) throw "Can not update the total number of posts in a city.";
    return true;
  };

const createLocation = async (address, post_id) => {
    let geoInfo = await convertLocation(address);
    let coordinate = {};
    coordinate.latitude = geoInfo.latitude.toString();
    coordinate.longitude = geoInfo.longitude.toString();

    const locationCollection = await location();
    const locationExist = await locationCollection.find({state: geoInfo.state.toString(), city: geoInfo.city.toString()}).toArray();

    let postList = [];
    let num = 0;

    if (locationExist.length === 0) {
        postList.push(post_id);
        num = postList.length;
        const locationData = {
            address: address,
            coordinate: coordinate,
            state: geoInfo.state.toString(),
            city: geoInfo.city.toString(),
            posts: postList,
            city_posts_num: num,
        };
        const insertInfo = await locationCollection.insertOne(locationData);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Can not insert location object.";
        const locationInserted = getLocationById(insertInfo.insertedId.toString());
        return locationInserted;
    }

    for (let i = 0; i < locationExist.length; i++) {
        const location_i = locationExist[i];
        if (location_i === address) {
            postList = location_i.posts;
            postList.push(post_id);
            num  = location_i.city_posts_num + 1;
            const updateInfo = await locationCollection.updateOne(
                {_id: location_i._id},
                {$set: {posts: postList, city_posts_num: num}}
            );
            if (!updateInfo.acknowledged) throw "Can not update location object.";
            await updateCityNum(geoInfo.state.toString(), geoInfo.city.toString(), num);
            
            const locationUpdated = getLocationById(updateInfo.updatedId.toString());
            return locationUpdated;
        }
    }

    postList.push(post_id);
    num = postList.length + locationExist[0].city_posts_num;
    const locationData = {
        address: address,
        coordinate: coordinate,
        state: geoInfo.state.toString(),
        city: geoInfo.city.toString(),
        posts: postList,
        city_posts_num: num,
    };
    await updateCityNum(geoInfo.state.toString(), geoInfo.city.toString(), num);
    const insertInfo = await locationCollection.insertOne(locationData);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Can not insert location object.";

    const locationInserted = getLocationById(insertInfo.insertedId.toString());
    return locationInserted;
};

const getLocationById = async (location_id) => {
    location_id = validation.validateId(location_id);
    const locationCollection = await location();
    const locationInfo = await locationCollection.findOne({_id: new ObjectId(location_id)});
    if (!locationInfo) throw "Can not find location";
    locationInfo._id = locationInfo._id.toString();
    return locationInfo;
};    

const removeLocationByPostId = async (post_id, location_id) => {
    const locationCollection = await location();
    const locationInfo = await locationCollection.findOne({ _id: new ObjectId(location_id) });
    // console.log(locationinfo);
    let postList = locationInfo.posts;
    for (let i = 0; i < postList.length; i++) {
      const element = postList[i];
      if (element === post_id) {
        postList.splice(i, 1);
      }
    }
    await updateCityNum(
      locationInfo.state,
      locationInfo.city,
      locationInfo.city_posts_num - 1
    );
    const removeInfo = await locationCollection.updateOne(
      { _id: new ObjectId(location_id) },
      { $set: { posts: postList } }
    );
    if (!removeInfo) {
      throw "Could not remove this post's location";
    }
    return true;
  };

export default {
    createLocation,
    getLocationById,
    removeLocationByPostId,
};