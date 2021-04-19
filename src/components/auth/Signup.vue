<template>
  <div class="signup">
    <form @submit.prevent="handleSubmit" class="card-panel">
      <h2 class="center indigo-text text-darken-4">Register</h2>
      <div class="field">
        <label for="firstName">First Name</label>

        <input
          type="text"
          v-model="user.firstName"
          id="firstName"
          name="firstName"
        />
        <div
          v-if="submitted && feedback.firstName"
          class="invalid-feedback red-text"
        >
          {{ feedback.firstName }}
        </div>
      </div>

      <div class="field">
        <label for="lastName">Last Name</label>

        <input
          type="text"
          v-model="user.lastName"
          id="lastName"
          name="lastName"
          class="form-control"
        />
        <div
          v-if="submitted && feedback.lastName"
          class="invalid-feedback red-text"
        >
          {{ feedback.lastName }}
        </div>
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input
          v-model="user.email"
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
          v-model="user.password"
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

      <div class="field">
        <label for="confirmPassword">Confirm Password</label>
        <input
          type="password"
          v-model="user.confirmPassword"
          id="confirmPassword"
          name="confirmPassword"
          class="form-control"
        />
        <div
          v-if="submitted && feedback.confirmPassword"
          class="invalid-feedback red-text"
        >
          {{ feedback.confirmPassword }}
        </div>
      </div>

      <div class="field center">
        <button class="btn indigo darken-4">Register</button>
      </div>
    </form>
  </div>
</template>

<script>
import { validName, validEmail } from "@/utils/validate";
import passwordValidator from "password-validator";
import slugify from "slugify";
import db from "@/firebase/init";
import firebase from "firebase";
export default {
  name: "Signup",
  data() {
    return {
      user: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullname: "",
        slug: "",
        avatar: "",
      },
      submitted: false,
      feedback: {
        firstName: null,
        lastName: null,
        email: null,
        password: null,
        confirmPassword: null,
      },
      hasError: false,
    };
  },
  methods: {
    handleSubmit() {
      this.submitted = true;
      this.hasError = false;
      //validate form
      if (!this.user.firstName) {
        this.feedback.firstName = "You must input first name.";
        this.hasError = true;
      }
      if (this.user.firstName) {
        if (validName(this.user.firstName)) {
          this.feedback.firstName = null;
        } else {
          this.feedback.firstName =
            "First name must not contain special characters.";
          this.hasError = true;
        }
      }
      if (!this.user.lastName) {
        this.feedback.lastName = "You must input last name.";
        this.hasError = true;
      }
      if (this.user.lastName) {
        if (validName(this.user.lastName)) {
          this.feedback.lastName = null;
        } else {
          this.feedback.lastName =
            "Last name must not contain special characters.";
          this.hasError = true;
        }
      }
      if (!this.user.email) {
        this.feedback.email = "You must input email.";
        this.hasError = true;
      }
      if (this.user.email) {
        if (validEmail(this.user.email)) {
          this.feedback.email = null;
        } else {
          this.feedback.email = "Email is incorrect.";
          this.hasError = true;
        }
      }
      if (!this.user.password) {
        this.feedback.password = "You must input password.";
        this.hasError = true;
      }
      if (this.user.password) {
        const checkLength = new passwordValidator()
          .is()
          .min(8) // Minimum length 8
          .is()
          .max(100); // Maximum length 100
        const checkUpLow = new passwordValidator()
          .has()
          .uppercase() // Must have uppercase letters
          .has()
          .lowercase(); // Must have lowercase letters
        const checkDigit = new passwordValidator().has().digits(2); // Must have at least 2 digits
        const checkSpace = new passwordValidator().has().not().spaces(); // Should not have spaces
        if (!checkLength.validate(this.user.password)) {
          this.feedback.password = "Password must between 8 to 100 characters.";
          this.hasError = true;
        } else if (!checkUpLow.validate(this.user.password)) {
          this.feedback.password =
            "Password must contain uppercase and lowercase letters.";
          this.hasError = true;
        } else if (!checkDigit.validate(this.user.password)) {
          this.feedback.password = "Password must contain at least 2 digits.";
          this.hasError = true;
        } else if (!checkSpace.validate(this.user.password)) {
          this.feedback.password = "Password must not contain spaces.";
          this.hasError = true;
        } else {
          this.feedback.password = null;
        }
      }
      if (!this.user.confirmPassword) {
        this.feedback.confirmPassword = "You must re-enter password.";
        this.hasError = true;
      }
      if (this.user.confirmPassword) {
        if (this.user.confirmPassword === this.user.password) {
          this.feedback.confirmPassword = null;
        } else {
          this.feedback.confirmPassword =
            "Password and re-enter password do not match.";
          this.hasError = true;
        }
      }
      if (!this.hasError) {
        this.user.fullname = this.user.firstName + " " + this.user.lastName;
        this.user.slug = slugify(this.user.fullname, {
          replacement: "-",
          remove: /[$*_+~.()'"!\-:@]/g,
          lower: true,
        });
        firebase
          .auth()
          .createUserWithEmailAndPassword(
            this.user.email,
            this.user.confirmPassword
          )
          .then((cred) => {
            let ref = db.collection("users").doc(cred.user.uid);
            ref.set({
              fullname: this.user.fullname,
              avatar:
                "https://cdn3.iconfinder.com/data/icons/vector-icons-6/96/256-512.png", //set the defaul avatar for the new user
            });
          })
          .then(() => {
            this.$router.push({ name: "Login" }).catch(() => {}); //after register, redirect to the user home page
          })
          .catch((error) => {
            switch (error.code) {
              case "auth/email-already-in-use":
                this.$message({
                  showClose: true,
                  message: `Email address ${this.state.email} already in use.`,
                  type: "error",
                });
                break;
              case "auth/invalid-email":
                this.$message({
                  showClose: true,
                  message: `Email address ${this.state.email} is invalid.`,
                  type: "error",
                });
                break;
              case "auth/operation-not-allowed":
                this.$message({
                  showClose: true,
                  message: `Error during sign up.`,
                  type: "error",
                });
                break;
              case "auth/weak-password":
                this.$message({
                  showClose: true,
                  message:
                    "Password is not strong enough. Add additional characters including special characters and numbers.",
                  type: "error",
                });
                break;
              default:
                console.log(error.message);
                break;
            }
          });
      } else {
        this.$message({
          showClose: true,
          message: "Please correct the from before submitted.",
          type: "error",
        });
      }
    },
  },
  beforeCreate() {
    document.body.className = "body-bg-image-register";
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
.signup {
  max-width: 500px;
  margin: 60px auto;
}
</style>