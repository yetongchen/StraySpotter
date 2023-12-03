import express from "express";

const router = express.Router();

import validation from "../validation.js";
import { userData }from "../data/index.js";

router.route("/:id").get(async (req, res) => {
  try {
    req.params.id = validation.validateId(req.params.id);
  } catch (e) {
    return res.status(400).json({error: e});
  }
  try {
    const userInfo = await userData.getUserById(req.params.id);
    res.status(200).json(userInfo);
  } catch (e) {
    return res.status(500).json({error: e});
  }
});

// router.route("/login").get(async (req, res) => {

//   let alreadyLoggedIn = false;

//   if (req.session.user)  {
//     alreadyLoggedIn = true;
//     return res.redirect("/user/:" + req.session.user.user_id);
  
//   }

//   return res.render('login', {
//       login: alreadyLoggedIn,
//       title: "login"
//   });

//   }
// )
//   .post(async (req, res) => {
//     let alreadyLoggedIn = false;

//     if (req.session.user) {
//       alreadyLoggedIn = true;
//       return res.redirect("/user/:" + req.session.user.user_id);
//     } 
    
//     let email = null;
//     let password = null

//     try {
//       email = validation.validateEmail(req.body.email);
//       password = validation.validatePassword(req.body.password);
//     } catch (error) {
//       return res.status(400).render('error', {
//         errorMsg: e,
//         login: alreadyLoggedIn,
//         title: "Error"
//       });
//     }

//     try {
//       const loginInfo = await userData.login(email, password)

//       if (loginInfo) {
//         req.session.user = { email: email, userid: loginInfo.userid };
//         return res.render("login Message", {
//           url: "/user/" + loginInfo.userid,
//           login : true,
//           title: "login Message",
//         });
//       } else {
//         return res.status(500).render('error', {
//           errorMsg: "Internet Server Error",
//           login: alreadyLoggedIn,
//           title: "Error"
//         });
//       }
//     } catch(error) {

//       return res.status(400).render("error", {
//         errorMsg: error,
//         login: true,
//         title: "Error",
//     });
//     }

//   });

router.route("/register")
  .post(async (req, res) => {
    try {
      console.log(req.body);
      req.body.id = validation.validateId(req.body.id);
      req.body.email = validation.validateEmail(req.body.email);
      req.body.name = validation.validateName(req.body.name);
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      const user = await userData.createUser(req.body.id, req.body.email, req.body.name);
      console.log(user);
      return res.status(200).json(user);
    } catch (e) {
      return res.status(500).json({error: e});
    }
});

  // router.route("/logout").get(async (req, res) => {

  //   if (req.session.user) {

  //     req.session.destroy();
  //     return res.render("logout", {
  //       logMsg: "You have successfully logged out!",
  //       url: "/",
  //       login: false,
  //       title: "logout",
  //     });
  //   } else {

  //     return res.status(400).render("error", {
  //       errorMsg: "You have already log out.",
  //       login: false,
  //       title: "error",
  //     });
  //   }
  // });  

export default router;