import express from "express";

const router = express.Router();

import validation from "../validation";
import userData from "../data/user"

router.route("/user/:user_id").get(async (req, res) => {

  let alreadyLoggedIn = false;

  if (req.session.user) {
    alreadyLoggedIn = true;
        
    try {
        
      const userInfo = await userData.getUserById(req.session.user.user_id)
      console.log(userInfo);

      res.render('userCenter', {
        userInfo: userInfo,
        login: alreadyLoggedIn,
        title: "userCenter"
      });

      } catch (e) {
        return res.status(400).render('error', {
          errorMsg: e,
          login: alreadyLoggedIn,
          title: "Error"
        });
      }
  } else {

    return res.status(400).render('error', {
      errorMsg: e,
      login: alreadyLoggedIn,
      title: "Error"
    });

  }
});

router.route("/login").get(async (req, res) => {

  let alreadyLoggedIn = false;

  if (req.session.user)  {
    alreadyLoggedIn = true;
    return res.redirect("/user/:" + req.session.user.user_id);
  
  }

  return res.render('login', {
      login: alreadyLoggedIn,
      title: "login"
  });

  }
)
  .post(async (req, res) => {
    let alreadyLoggedIn = false;

    if (req.session.user) {
      alreadyLoggedIn = true;
      return res.redirect("/user/:" + req.session.user.user_id);
    } 
    
    let email = null;
    let password = null

    try {
      email = validation.validateEmail(req.body.email);
      password = validation.validatePassword(req.body.password);
    } catch (error) {
      return res.status(400).render('error', {
        errorMsg: e,
        login: alreadyLoggedIn,
        title: "Error"
      });
    }

    try {
      const loginInfo = await userData.login(email, password)

      if (loginInfo) {
        req.session.user = { email: email, userid: loginInfo.userid };
        return res.render("login Message", {
          url: "/user/" + loginInfo.userid,
          login : true,
          title: "login Message",
        });
      } else {
        return res.status(500).render('error', {
          errorMsg: "Internet Server Error",
          login: alreadyLoggedIn,
          title: "Error"
        });
      }
    } catch(error) {

      return res.status(400).render("error", {
        errorMsg: error,
        login: true,
        title: "Error",
    });
    }

  });

  router.route("/signup").get(async (req, res) => {
    let alreadyLoggedIn = false;

    if (req.session.user) {
      alreadyLoggedIn = true;
      return res.redirect("/user/" + req.session.user.user_id);
    } else {
      res.render("signIn", {
        login: false,
        title: "signin page",
      });
    }


  })
  .post(async (req, res) => {
    if (req.session.user) {
      alreadyLoggedIn = true;
      return res.redirect("/user/" + req.session.user.user_id);
    }

    let email = null;
    let name = null;
    let password = null;
    let re_password = null;

    try {

      email = validation.validateEmail(req.body.email);
      name = validation.validateName(req.body.name);
      password = validation.validatePassword(req.body.password);
      re_password = validation.validatePassword(req.body.re_password);

      if (password !== re_password) throw "The Re-type password must match your password";

    } catch (error) {
      return res.status(400).render("error", {
        errorMsg: error,
        login: true,
        title: "Sign Up Error",
      });

    }

    try {

      const createUser = await userData.createUser(email, name, password);

      if (createUser) {
        return res.redirect("/login");
      } else {
        return res.status(500).render('error', {
          errorMsg: "Internet Server Error",
          login: alreadyLoggedIn,
          title: "Internet Error"
        });
      }

    } catch (error) {
      return res.status(400).render("error", {
        errorMsg: error,
        login: true,
        title: "Sign Up Error",
      });
    }
});

  router.route("/logout").get(async (req, res) => {

    if (req.session.user) {

      req.session.destroy();
      return res.render("logout", {
        logMsg: "You have successfully logged out!",
        url: "/",
        login: false,
        title: "logout",
      });
    } else {

      return res.status(400).render("error", {
        errorMsg: "You have already log out.",
        login: false,
        title: "error",
      });
    }
  });  

export default router;