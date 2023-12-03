import express from "express";
const router = express.Router();
import validation from "../validation.js";
//import {getAllPosts, getPostByPostId, removePostById} from "../data/post.js";
import posts from "../data/post.js";

router.route("/")
    .get(async (req, res) => {
        let alreadyLoggedIn = false;
        if (req.session.user)
            alreadyLoggedIn = true;
        try {
            const postData = await posts.getAllPosts();
            console.log(postData);
            res.render('allPosts', {
                postData: postData,
                login: alreadyLoggedIn,
                title: "Posts"
            });
        } catch (e) {
            return res.status(400).render('error', {
                errorMsg: e,
                login: alreadyLoggedIn,
                title: "Error"
            });
        }
    });

router.route("/detail/:id")
    .get(async (req, res) => {
        let id = validation.validateId(req.params.id);
        let alreadyLoggedIn = false;
        if (req.session.user)
            alreadyLoggedIn = true;
        try {
            let post = await posts.getPostByPostId(id);
            return res.render('singlePost', {
                title: "Post Details",
                id: id,
                post: post,
                login: alreadyLoggedIn
            });
        } catch (e) {
            return res.status(400).render('error', {
                errorMsg: e,
                alreadyLoggedIn,
                title: "Error"
            });
        }
    })
    .delete(async (req, res) => {
        if (req.session.user){
            let post_id = validation.validateId(req.params.id);
            try {
                const postData = await posts.getPostByPostId(post_id);
                await posts.removePostById(post_id);
                return res.status(200).redirect('/user/userCenter/' + post_id);
            } catch (e) {
                return res.render('error', {
                    errorMsg: e,
                    login: true,
                    title: "Error"
                });
            }
        } else {
            res.status(400);
            return res.render('error', {
                errorMsg: 'Please login first in order to delete your post!',
                login: false,
                title: "Error"
            });
        }
    });

router.route("/new")
    .get(async (req, res) => {
        if (req.session.user) {
            return res.render('addPost', {
                title: "add new post",
                login: true
            });
        } else {
            res.status(400);
            return res.render('error', {
                errorMsg: 'Please login to add a new volunteer post.',
                login: false,
                title: "Error"
            });
        }
    })
    .post(async (req, res) => {
        if (req.session.user) {
            //console.log(req.body);
            //add volunteer post paras
            let volunteer_name = null;
            let contact = null;
            let location = null;
            let type = null;
            let description = null;
            let username = req.session.user.username;
            try {
                volunteer_name = publicMethods.checkName(xss(req.body.volunteer_name), "volunteer name");
                contact = publicMethods.checkVolunteerInfo(xss(req.body.contact));
                location = xss(req.body.location);
                type = publicMethods.checkVolunteerPost(xss(req.body.type));
                description = publicMethods.checkArticle(xss(req.body.description), "description");
            } catch(e) {
                res.status(400);
                return res.render('addVolunteerPost',  {
                    error: e,
                    login: true,
                    title: "Error"
                });
            }
            try {
                const new_volunteer_post = await volunteerData.createVolunteerPost(
                    volunteer_name,
                    contact,
                    location,
                    type,
                    description,
                    username
                );
                res.status(200);
                return res.redirect('/volunteer');
            } catch (e) {
                res.status(500);
                return res.render('addVolunteerPost',  {
                    error: e,
                    login: true,
                    title: "Error"
                });
            }
        } else {
            res.status(400);
            return res.render('error', {
                errorMsg: 'Please login to add new post.',
                login: false,
                title: "Error"
            });
        }
    });


export default router;