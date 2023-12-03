import location from "./location.js";
import post from "./post.js";
import user from "./user.js";

const constructorMethod = (app) => {
    app.use("/post", post);
    app.use("/user", user);
    app.use("/map", location);

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Not found" });
    });
};

export default constructorMethod;