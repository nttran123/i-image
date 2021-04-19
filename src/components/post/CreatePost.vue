<template>
  <el-dialog
    title="Create new post"
    :width="dialogWidth"
    :visible.sync="setVisibility"
    :show-close="false"
    :close-on-click-modal="false"
  >
    <el-form
      ref="newPostForm"
      :model="newPostForm"
      :rules="newPostRule"
      class="new-post-form"
      autocomplete="on"
      label-position="left"
    >
      <el-form-item prop="description">
        <el-input
          ref="title"
          v-model="newPostForm.description"
          type="textarea"
          :rows="2"
          placeholder="What's on your mind?"
          class="new-post-form-description"
          autocomplete="on"
          label-position="left"
        />
      </el-form-item>
      <el-form-item>
        <el-upload
          v-if="!selectedPicture"
          class="photo-uploader"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handlePreview"
        >
          <i class="el-icon-picture photo-uploader-icon"></i>
        </el-upload>
        <div class="preview-image-container">
          <img
            v-if="showImage"
            class="preview-image"
            :src="srcImage"
            @click="handleChangeImage"
          >
          <i
            v-if="showImage"
            @click="handleChangeImage"
            class="material-icons preview-image-close"
            >close</i
          >
        </div>
      </el-form-item>

      <div class="form-footer">
        <el-button class="btn-cancel" type="danger" @click="closeFormNewPost">
          Cancel
        </el-button>

        <el-button class="btn-submit" @click="handleUpload"> Save </el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script>
import db from "@/firebase/init";
import firebase from "firebase";

export default {
  name: "CreatePost",
  props: ["newPostVisible"],
  data() {
    return {
      dialogWidth: "50%",
      formLabelWidth: "120px",
      visibleForm: null,
      srcImage: "",
      showImage: false,
      selectedPicture: false,
      newPostForm: {
        description: "",
        user_id: null,
        file: null,
      },
      newPostRule: {
        description: [{ required: true, trigger: "blur" }],
      },
    };
  },
  methods: {
    handleChangeImage() {
      this.srcImage = null;
      this.newPostForm.file = null;
      this.selectedPicture = false;
      this.showImage = false;
    },
    handlePreview(file) {
      const aceptableType = ["image/jpeg", "image/jpg", "image/png"];
      const isAceptableType = aceptableType.includes(file.raw.type);
      const isLt2M = file.raw.size / 1024 / 1024 < 2;

      if (file && isAceptableType && isLt2M) {
        this.newPostForm.file = file.raw;
        this.srcImage = URL.createObjectURL(file.raw);
        this.showImage = true;
        this.selectedPicture = true;
      }
      if (file && !isAceptableType) {
        this.$message.error("Picture must be JPG, JPEG or PNG format!");
      }
      if (file && !isLt2M) {
        this.$message.error("Picture size can not exceed 2MB!");
      }
    },
    handleUpload() {
      this.$refs.newPostForm.validate((valid) => {
        if (valid) {
          if (this.newPostForm.file) {
            // Upload image
            var storageRef = firebase
              .storage()
              .ref(
                "user_post/" +
                  Math.floor(Math.random() * 9999999999999) +
                  this.newPostForm.file.name
              );
            var uploadTask = storageRef.put(this.newPostForm.file);

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
                //get the image link
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                  this.$message({
                    showClose: true,
                    message: "Upload image successfully.",
                    type: "success",
                  });

                  // Save post
                  this.savePost(
                    this.newPostForm.user_id,
                    this.newPostForm.description,
                    downloadURL
                  );
                });
              }
            );
          } else {
            // Save post
            this.savePost(
              this.newPostForm.user_id,
              this.newPostForm.description,
              this.newPostForm.file
            );
          }
        }
      });
    },
    savePost(user_id, description, image) {
      db.collection("posts")
        .add({
          description: description,
          image: image,
          timestamp: Date.now(),
          user_id: user_id,
          like: 0,
          likedUsers: [],
        })
        .then(() => {
          this.closeFormNewPost("");
          this.newPostForm.description = null;
          this.newPostForm.userId = null;
          this.newPostForm.file = null;
        })
        .catch((error) => {
          this.$message({
            showClose: true,
            message: error,
            type: "error",
          });
        });
    },
    closeFormNewPost() {
      // Reset value
      this.selectedPicture = false;
      this.showImage = false;
      this.srcImage = "";
      this.$emit("handleEvent", "closeFormNewPost", "");
    },
    setDialogWidth(e) {
      if (window.innerWidth < 600) {
        this.dialogWidth = "90%";
      } else {
        this.dialogWidth = "50%";
      }
    },
  },
  created() {
    window.addEventListener("resize", this.setDialogWidth);
  },
  destroyed() {
    window.removeEventListener("resize", this.setDialogWidth);
  },
  computed: {
    setVisibility() {
      return (this.visibleForm = this.newPostVisible);
    },
  },
  beforeCreate() {
    document.body.className = "body-bg-no-image";
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.newPostForm.user_id = user.uid;
      } else {
        this.newPostForm.user_id = null;
      }
    });
  },
};
</script>

<style scoped>
.new-post-container .el-form .el-form-item .new-post-form-input-file.hidden {
  display: block;
}
.preview-image-container {
  position: relative;
}
.preview-image-close {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 35px;
  font-weight: bold;
}
.new-post-container {
  width: 100%;
  float: left;
  background: #ee6e73;
  border-radius: 5px;
}

.new-post-container .el-form {
  padding: 5px;
  border-radius: 8px;
}

.new-post-container .el-form .el-form-item {
  width: 100%;
  float: left;
}

.new-post-container .el-form .el-form-item label {
  font-size: 18px;
  color: #000000;
}

.new-post-container .el-form .el-form-item .new-post-form-title {
  background: #ffffff;
  border-radius: 5px;
  padding: 5px;
  margin-bottom: 10px;
}

.preview-image {
  width: 100%;
  height: auto;
  float: left;
  padding: 5px;
  border-radius: 10px;
  cursor: pointer;
}

.new-post-container .el-form .form-footer {
  width: 100%;
  float: left;
  text-align: center;
  padding: 10px;
}

.new-post-container .el-form .form-footer .el-button {
  font-size: 18px;
  width: 100px;
  line-height: 30px;
  border-radius: 8px;
  cursor: pointer;
}

.new-post-container .el-form .el-button.btn-submit {
  background: #61bdea;
}

.el-upload {
  cursor: pointer !important;
  position: relative !important;
  overflow: hidden !important;
}
.photo-uploader .el-upload:hover {
  border-color: #409eff;
}
.photo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
}
@media only screen and (max-width: 600px) {
  .el-dialog {
    width: 100% !important;
  }
}
</style>