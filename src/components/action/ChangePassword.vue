<template>
  <div class="edit-user">
    <form @submit.prevent="handleSubmit" class="card-panel">
      <h2 class="center indigo-text text-darken-4 user-name">
        Change password
      </h2>
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
        <button class="btn indigo darken-4">Update</button>
      </div>
    </form>
  </div>
</template>
<script>
import firebase from "firebase";
import passwordValidator from "password-validator";
export default {
  name: "ChangePassword",
  data() {
    return {
      user: {
        password: "",
        confirmPassword: "",
      },
      submitted: false,
      feedback: {
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
        const currentUser = firebase.auth().currentUser;
        currentUser
          .updatePassword(this.user.confirmPassword)
          .then(() => {
            this.$message({
              showClose: true,
              message: "Changed password successfully.",
              type: "success",
            });
            this.$router
              .push({
                name: "UserHome",
              })
              .catch(() => {});
          })
          .catch((error) => {
            this.$message({
              showClose: true,
              message: error.code,
              type: "error",
            });
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
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        if (this.$route.params.id !== user.uid) {
          this.$router
            .push({
              name: "Forbidden",
            })
            .catch(() => {});
        }
      } else {
        this.isLoggedIn = false;
      }
    });
  },
};
</script>
<style scoped>
.edit-user {
  max-width: 500px;
  margin: 60px auto;
}
@media only screen and (max-width: 500px) {
  .edit-user {
    max-width: 90%;
    margin: 60px auto;
  }
  .user-name {
    font-size: 30px;
  }
  .change-avatar {
    margin: 20px auto;
  }
}
</style>