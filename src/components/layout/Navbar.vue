<template>
  <div class="navbar">
    <nav>
      <div class="nav-wrapper grey lighten-5">
        <router-link
          :to="{ name: 'UserHome' }"
          class="brand-logo"
          v-if="isLoggedIn"
        >
          iImage
        </router-link>
        <router-link :to="{ name: 'Home' }" class="brand-logo" v-else>
          iImage
        </router-link>
        <a href="#" data-target="mobile-demo" class="sidenav-trigger"
          ><i class="material-icons menu-button">menu</i></a
        >
        <ul
          data-target="mobile-demo"
          class="right hide-on-med-and-down sidenav-trigger"
        >
          <li>
            <a href="#"><i class="material-icons menu-button">menu</i></a>
          </li>
        </ul>
      </div>
    </nav>

    <ul class="sidenav" id="mobile-demo">
      <li v-if="user_info">
        <div class="user-view">
          <div class="background">
            <img src="@/assets/side-nav-background.jpg" />
          </div>
          <router-link
            :to="{ name: 'UserProfile', params: { id: this.user_info.id } }"
          >
            <img class="circle user-avatar" :src="user_info.avatar" />
          </router-link>
          <router-link
            :to="{ name: 'UserProfile', params: { id: this.user_info.id } }"
            class="username"
          >
            {{ user_info.fullname }}
          </router-link>
        </div>
      </li>
      <li v-if="!isLoggedIn">
        <router-link :to="{ name: 'Home' }">
          <i class="material-icons">home</i>Home
        </router-link>
      </li>
      <li v-if="isLoggedIn">
        <router-link :to="{ name: 'UserHome' }">
          <i class="material-icons">home</i>Home
        </router-link>
      </li>
      <hr />
      <li v-if="!isLoggedIn">
        <router-link :to="{ name: 'Signup' }">
          <i class="material-icons">create</i>Register
        </router-link>
      </li>
      <li v-if="!isLoggedIn">
        <router-link :to="{ name: 'Login' }">
          <i class="material-icons">account_circle</i>Login
        </router-link>
      </li>
      <li v-if="isLoggedIn && user_info" class="list-button">
        <router-link
          :to="{ name: 'EditUser', params: { id: this.user_info.id } }"
        >
          <i class="material-icons">edit</i>Change Information
        </router-link>
      </li>
      <li v-if="isLoggedIn && user_info" class="list-button">
        <router-link
          :to="{ name: 'ChangePassword', params: { id: this.user_info.id } }"
        >
          <i class="material-icons">lock</i>Change Password
        </router-link>
      </li>
      <li v-if="isLoggedIn" class="list-button">
        <a @click="logOut"><i class="material-icons">exit_to_app</i> Logout </a>
      </li>
    </ul>
  </div>
</template>

<script>
import firebase from "firebase";
import db from "@/firebase/init";

export default {
  name: "Navbar",
  data() {
    return {
      isLoggedIn: false,
      user_info: null,
    };
  },
  //log user out and redirect to login page
  methods: {
    logOut() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$router
            .push({
              name: "Login",
            })
            .catch(() => {}),
            (this.user_info = null);
          this.isLoggedIn = false;
        });
    },
  },

  //get data of a current user from database before render
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.isLoggedIn = true;
        let ref = db.collection("users").doc(user.uid);
        ref.onSnapshot((snapshot) => {
          this.user_info = snapshot.data();
          this.user_info.id = snapshot.id;
        });
      } else {
        this.isLoggedIn = false;
      }
    });
  },
  //Stack Menu
  mounted() {
    $(document).ready(function () {
      $(".sidenav").sidenav({ edge: "left" });
    });
  },
};
</script>

<style scoped>
.list-button {
  cursor: pointer;
}
.user-avatar {
  border: 2px solid rgb(218, 218, 218);
}
.username {
  color: black;
  font-size: 30px;
  font-weight: bold;
}
.brand-logo {
  color: #3f51b5 !important;
  font-weight: bold;
}
.menu-button {
  color: #3f51b5;
}

@media screen and (min-width: 993px) {
  .list-button {
    cursor: pointer;
  }
  .brand-logo {
    margin-left: 5em;
    color: #3f51b5;
    font-weight: bold;
  }
  .menu-button {
    color: #3f51b5;
  }
}
</style>
