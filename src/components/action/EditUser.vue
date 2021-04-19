<template>
  <div class="edit-user">
    <form @submit.prevent="handleSubmit" class="card-panel">
      <h2
        class="center indigo-text text-darken-4 user-name"
        v-if="user.fullName"
      >
        Edit {{ user.fullName }}'s profile
      </h2>
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
      <div class="change-avatar field">
        <label for="changeAvatar"> Change profile image </label>
        <input
          ref="fileInput"
          type="file"
          name="file"
          class="new-post-form-input-file"
          placeholder="Select picture"
          :class="{ hidden: selectedPicture }"
          @change="handlePreview"
        />
        <img
          v-if="showImage"
          class="preview-image"
          :src="srcImage"
          @click="handleChangeImage"
        />
      </div>

      <div class="field center">
        <button class="btn indigo darken-4" :disabled="isFormInput">
          Edit
        </button>
      </div>
    </form>
  </div>
</template>
<script>
import firebase from "firebase";
import db from "@/firebase/init";
import { validName } from "@/utils/validate";
export default {
  name: "EditUser",
  data() {
    return {
      srcImage: "",
      showImage: false,
      selectedPicture: false,
      user: {
        id: "",
        firstName: "",
        lastName: "",
        fullName: "",
        avatar: "",
      },
      fileUpload: null,
      newFullName: null,
      submitted: false,
      feedback: {
        firstName: null,
        lastName: null,
      },
      hasError: false,
    };
  },
  methods: {
    handleChangeImage() {
      this.$refs.fileInput.click();
    },
    handlePreview(event) {
      var file = event.target.files[0];
      const aceptableType = ["image/jpeg", "image/jpg", "image/png"];
      if (aceptableType.includes(file.type)) {
        // store image in a folder named: user_avatar in firestore
        this.fileUpload = file;
        this.srcImage = URL.createObjectURL(file);
        this.showImage = true;
        this.selectedPicture = true;
        var storageRef = firebase.storage().ref("user_avatar/" + file.name);

        let uploadTask = storageRef.put(file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            this.$message({
              showClose: true,
              message:
                "Please wait until the image upload successfully! (3~5s)",
            });
          },
          (error) => {
            this.$message({
              showClose: true,
              message: error,
              type: "error",
            });
          },
          () => {
            //get the image link and set it to newAva
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
              this.user.avatar = downloadURL;
              this.$message({
                showClose: true,
                message: "Upload image successfully.",
                type: "success",
              });
            });
          }
        );
      } else {
        this.$message({
          showClose: true,
          message: "Only accept .jpeg .jpg .png file type.",
          type: "error",
        });
      }
    },

    handleSubmit() {
      this.submitted = true;
      this.hasError = false;
      //validate form
      if (this.user.firstName) {
        if (validName(this.user.firstName)) {
          this.feedback.firstName = null;
        } else {
          this.feedback.firstName =
            "First name must not contain special characters.";
          this.hasError = true;
        }
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
      if (!this.hasError) {
        if (this.user.firstName && this.user.lastName) {
          this.newFullName = this.user.firstName + " " + this.user.lastName;
        } else {
          this.newFullName = null;
        }
        if (this.user.avatar && !this.newFullName) {
          //check if avatar selected or not
          //locate this user data location via user_id and update the information
          db.collection("users")
            .doc(this.user.id)
            .update({
              avatar: this.user.avatar, //image link string
            })
            .then(() => {
              this.$router
                .push({
                  name: "UserProfile",
                  params: this.user.id,
                })
                .catch(() => {}); //redirect to the user profile page
            })
            .catch((err) => {
              this.$message({
                showClose: true,
                message: err,
                type: "error",
              });
            });
        }
        if (this.user.avatar && this.newFullName) {
          //check if avatar selected or not
          //locate this user data location via user_id and update the information
          db.collection("users")
            .doc(this.user.id)
            .update({
              avatar: this.user.avatar, //image link string
              fullname: this.newFullName, //fullname string
            })
            .then(() => {
              this.$router
                .push({
                  name: "UserProfile",
                  params: this.user.id,
                })
                .catch(() => {}); //redirect to the user profile page
            })
            .catch((err) => {
              this.$message({
                showClose: true,
                message: err,
                type: "error",
              });
            });
        }
        if (this.newFullName && !this.user.avatar) {
          //locate this user data location via user_id and update the fullname only
          db.collection("users")
            .doc(this.user.id)
            .update({
              fullname: this.newFullName, //name string
            })
            .then(() => {
              this.$router
                .push({
                  name: "UserProfile",
                  params: this.user.id,
                })
                .catch(() => {}); //redirect to the user profile page
            })
            .catch((err) => {
              this.$message({
                showClose: true,
                message: err,
                type: "error",
              });
            });
        }
      } else {
        this.$message({
          showClose: true,
          message: "Please correct the from before submitted.",
          type: "error",
        });
      }
    },
  },
  computed: {
    isFormInput() {
      if (this.user.firstName || this.user.lastName || this.user.avatar) {
        return false;
      } else {
        return true;
      }
    },
  },
  beforeCreate() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.user.id = user.uid;
        this.user.id = user.uid;
        let ref = db.collection("users").doc(user.uid);
        ref
          .get()
          .then((snapshot) => {
            if (snapshot) {
              this.user.fullName = snapshot.data().fullname;
            }
          })
          .catch((error) => {
            this.$message({
              showClose: true,
              message: error,
              type: "error",
            });
          });
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
.preview-image {
  width: 100%;
  height: auto;
  float: left;
  padding: 5px;
  border-radius: 10px;
  cursor: pointer;
}
.edit-user {
  max-width: 500px;
  margin: 60px auto;
}
.change-avatar {
  margin: 20px auto;
}
.user-name {
  font-size: 30px;
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