<template>
  <div class="login">
    <form @submit.prevent="handleSubmit" class="card-panel">
      <h2 class="center indigo-text text-darken-4">Login</h2>
      <div class="field">
        <label for="email">Email</label>
        <input
          v-model="loginForm.email"
          id="email"
          name="email"
          class="form-control"
        />
        <div
          v-if="submitted && feedback.email"
          class="invalid-feedback red-text"
        >
          {{ feedback.email }}
        </div>
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input
          type="password"
          v-model="loginForm.password"
          id="password"
          name="password"
          class="form-control"
        />
        <div
          v-if="submitted && feedback.password"
          class="invalid-feedback red-text"
        >
          {{ feedback.password }}
        </div>
      </div>

      <div class="field center">
        <button class="btn indigo darken-4">Login</button>
      </div>
    </form>
  </div>
</template>

<script>
import { validEmail } from "@/utils/validate";
import firebase from "firebase";
export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        email: "",
        password: "",
      },
      submitted: false,
      feedback: {
        email: null,
        password: null,
      },
      hasError: false,
    };
  },
  methods: {
    handleSubmit() {
      this.submitted = true;
      this.hasError = false;
      //validate form
      if (!this.loginForm.email) {
        this.feedback.email = "You must input email.";
        this.hasError = true;
      }
      if (this.loginForm.email) {
        if (validEmail(this.loginForm.email)) {
          this.feedback.email = null;
        } else {
          this.feedback.email = "Email is incorrect.";
          this.hasError = true;
        }
      }
      if (!this.loginForm.password) {
        this.feedback.password = "You must input password.";
        this.hasError = true;
      }
      if (!this.hasError) {
        firebase
          .auth()
          .signInWithEmailAndPassword(
            this.loginForm.email,
            this.loginForm.password
          )
          .then((cred) => {
            this.$router.push({ name: "UserHome" }).catch(() => {}); //after login, direct to home user page
          })
          .catch((error) => {
            if (error.code === "auth/user-not-found") {
              this.$message({
                showClose: true,
                message: `There is no user record corresponding to this identifier. The user may have been deleted.`,
                type: "error",
              });
            } else {
              this.$message({
                showClose: true,
                message: error,
                type: "error",
              });
            }
          });
      }
    },
  },
  beforeCreate() {
    document.body.className = "body-bg-image-login";
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$router
          .push({
            name: "UserHome",
          })
          .catch(() => {});
      }
    });
  },
};
</script>
<style scoped>
.login {
  max-width: 500px;
  margin: 60px auto;
}
</style>