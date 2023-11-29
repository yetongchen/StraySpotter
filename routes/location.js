import express from "express";

const router = express.Router();


router.route("/").get(async (req, res) => {
  try {
    const postData = [
      {
        "_id": "6566b6e8644af9b8d5f9596e",
        "description": "so cute",
        "found_time": "12/12/2022 12:2",
        "gender": "male",
        "health_condition": "good",
        "locationinfo": {
          "_id": "6566b7e63ec24562ea0b63ec",
          "address": "Stevens Institute of Technology",
          "coordinate": {
            "latitude": "40.744809599999996",
            "longitude": "-74.0252392276461"
          },
          "state": "New Jersey",
          "city": "Hoboken",
          "posts": [
            "6566b6e8644af9b8d5f9596e"
          ],
          "city_posts_num": 1
        },
        "photo_url": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2643&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "species": "cat"
      },
    ];
    // login
    if (postData === null) throw "Post not found.";
    res.status(200);
    res.render("map", {
      postData: postData,
      title: "Map View",
    });
  } catch (error) {
    res.status(400);
    return res.render("error", {
      errorMsg: error,
      login: true,
      title: "Error",
    });
  }
});

export default router;