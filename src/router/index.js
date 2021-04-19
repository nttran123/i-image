import Vue from "vue";
import Router from "vue-router";
import Home from "@/components/home/Home";
import UserHome from "@/components/home/UserHome";
import PostDetail from "@/components/post/PostDetail";
import Signup from "@/components/auth/Signup";
import Login from "@/components/auth/Login";
import UserProfile from "@/components/profile/UserProfile";
import EditUser from "@/components/action/EditUser";
import ChangePassword from "@/components/action/ChangePassword";
import NotFound from "@/components/errorPage/404";
import Forbidden from "@/components/errorPage/403";
import firebase from "firebase";

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home
    },
    {
      path: "/404",
      name: "NotFound",
      component: NotFound
    },
    {
      path: "/403",
      name: "Forbidden",
      component: Forbidden
    },
    {
      path: "/signup",
      name: "Signup",
      component: Signup
    },
    {
      path: "/login",
      name: "Login",
      component: Login
    },
    {
      path: "/home",
      name: "UserHome",
      component: UserHome,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/profile/:id",
      name: "UserProfile",
      component: UserProfile,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/edit-user/:id",
      name: "EditUser",
      component: EditUser,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/change-password/:id",
      name: "ChangePassword",
      component: ChangePassword,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/post/:postId",
      name: "PostDetail",
      component: PostDetail,
      meta: {
        requiresAuth: true
      }
    }
  ]
});
router.beforeEach((to, from, next) => {
  //check to see if route requires Auth
  if (to.matched.some(rec => rec.meta.requiresAuth)) {
    //check Auth state of user
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        //user signed in, process to route
        next();
      } else {
        //no user login, redirect to login
        next({ name: "Login" });
      }
    });
  } else {
    next();
  }
});
export default router;
