<template>
  <div class="container home-container" v-if="isLoaded">
    <div class="logo center-align">
      <h1 class="logo-i">i</h1>
      <span class="logo-last">Image</span>
    </div>
    <p class="center-align quote-title">
      Share your photos with people all over the world 📸
    </p>
    <p class="btn-large home-button center-align">
      <router-link :to="{ name: 'Signup' }">
        <span class="home-button-text">START NOW</span>
      </router-link>
    </p>
  </div>
</template>

<script>
import firebase from "firebase";
export default {
  name: "Home",

  data() {
    return {
      isLoaded: false,
    };
  },
  methods: {},
  beforeCreate() {
    document.body.className = "body-bg-image-register";
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.isLoaded = false;
        this.$router
          .push({
            name: "UserHome",
          })
          .catch(() => {});
      } else {
        this.isLoaded = true;
      }
    });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home-container {
  width: 100%;
}
.quote-title {
  margin-top: 0px;
  font-size: 20px;
  font-weight: bold;
}
.logo-i {
  display: inline-block;
  font-size: 8em;
  font-weight: bold;
  color: #3f51b5;
}
.logo-last {
  font-size: 8em;
  font-weight: bold;
}
.home-button {
  background-color: #3f51b5;
  margin-top: 100px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 40%;
}
.home-button-text {
  color: white;
  font-weight: bold;
}
@media only screen and (max-width: 600px) {
  .logo-i {
    display: inline-block;
    font-size: 5em;
    font-weight: bold;
    color: #3f51b5;
  }
  .logo-last {
    font-size: 5em;
    font-weight: bold;
  }
}
</style>
