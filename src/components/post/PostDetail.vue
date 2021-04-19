<template>
  <div class="post-detail container">
    <div class="card">
      <el-card :body-style="{ padding: '0px' }">
        <div class="post-user-info">
          <router-link
            :to="{ name: 'UserProfile', params: { id: post.user_id } }"
          >
            <img class="user-avatar" :src="post.ava" />
          </router-link>
          <div class="user-info">
            <router-link
              :to="{ name: 'UserProfile', params: { id: post.user_id } }"
            >
              <p class="user-name">{{ post.userName }}</p>
            </router-link>
            <time class="post-time">{{ post.uploadDate }}</time>
          </div>
          <el-dropdown
            class="post-dropdown"
            v-if="currentUserId === post.user_id"
            @command="handleCommand"
          >
            <span class="el-dropdown-link">
              <i class="el-icon-more more-button"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                icon="el-icon-delete"
                class="delete-action"
                command="delete"
                >Delete post</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </div>

        <img :src="post.image" class="post_image" />
        <div style="padding: 14px 14px 0px 14px">
          <i
            class="material-icons favorite-button"
            @click="handleLike(post.id)"
            v-if="!post.hasBeenLiked"
            >favorite_border</i
          >
          <i
            class="material-icons favorite-button button-liked"
            @click="handleLike(post.id)"
            v-else
            >favorite</i
          >

          <p class="post-like">{{ post.like }}</p>
          <h3 style="clear: left" class="post-description">
            {{ post.description }}
          </h3>
          <div class="post-divide"></div>
        </div>
        <div class="post-comment-input">
          <img class="current-user-avatar" :src="currentUserAva" />
          <CommentInput
            v-bind:username="currentUsername"
            v-bind:userId="currentUserId"
            v-bind:userAvatar="currentUserAva"
            v-bind:postId="this.$route.params.postId"
            v-bind:comments="post.comments"
          />
        </div>
        <div class="post-comment-list" v-if="post.comments">
          <Comment
            v-for="comment in sortComment"
            :key="comment.key"
            v-bind:username="comment.username"
            v-bind:userId="comment.userId"
            v-bind:postId="post.id"
            v-bind:userAvatar="comment.userAvatar"
            v-bind:comment="comment.comment"
            v-bind:timestamp="comment.timestamp"
            v-bind:currentUserId="currentUserId"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>
<script>
import db from "@/firebase/init";
import firebase from "firebase";
import moment from "moment";
import CommentInput from "./CommentInput";
import Comment from "./Comment";
export default {
  name: "PostDetail",
  components: {
    CommentInput,
    Comment,
  },
  data() {
    return {
      post: {
        id: null,
        image: null,
        like: null,
        timestamp: null,
        uploadDate: null,
        description: null,
        title: null,
        user_id: null,
        comments: null,
        ava: null,
        userName: null,
        hasBeenLiked: false,
        likedUsers: null,
      },
      currentUserId: null,
      currentUsername: null,
      currentUserAva: null,
    };
  },
  methods: {
    handleLike(postId) {
      for (let i in this.posts) {
        if (this.posts[i].id == postId) {
          if (this.posts[i].hasBeenLiked === false) {
            this.posts[i].like++; //increse like by 1
            this.posts[i].hasBeenLiked = true;
            this.posts[i].likedUsers.push(this.currentUserId);
            // send to database
            db.collection("posts").doc(postId).update({
              like: this.posts[i].like,
              likedUsers: this.posts[i].likedUsers,
            });
          } else {
            this.posts[i].like--; //decrease like by 1
            this.posts[i].hasBeenLiked = false;
            this.posts[i].likedUsers = this.posts[i].likedUsers.filter(
              (item) => {
                return item !== this.currentUserId;
              }
            );
            //send to database
            db.collection("posts").doc(postId).update({
              like: this.posts[i].like,
              likedUsers: this.posts[i].likedUsers,
            });
          }
        }
      }
    },
    handleCommand(command) {
      if (command === "delete") {
        this.$confirm(
          "This will permanently delete the post. Continue?",
          "Warning",
          {
            confirmButtonText: "OK",
            cancelButtonText: "Cancel",
            type: "warning",
          }
        )
          .then(() => {
            db.collection("posts")
              .doc(this.post.id)
              .delete()
              .then(() => {
                this.$message({
                  type: "success",
                  message: "Delete completed",
                });
                this.$router.push({ path: "/home" }).catch(() => {});
              })
              .catch((error) => {
                this.$message({
                  type: "error",
                  message: "Error removing post: ",
                  error,
                });
              });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "Delete canceled",
            });
          });
      }
    },
  },
  computed: {
    sortComment() {
      if (this.post.comments) {
        this.post.comments.sort((x, y) => {
          return y.timestamp - x.timestamp;
        });
        return this.post.comments;
      }
    },
  },
  beforeCreate() {
    document.body.className = "body-bg-no-image";
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
        let currentUser = db.collection("users").doc(user.uid);
        currentUser.get().then((user) => {
          if (user) {
            this.currentUsername = user.data().fullname;
            this.currentUserAva = user.data().avatar;
          }
        });
      } else {
        this.currentUserId = null;
      }
    });

    let postdb = db.collection("posts").doc(this.$route.params.postId);
    postdb.onSnapshot((snapshot) => {
      let checkLike = false;
      if (snapshot.exists) {
        if (snapshot.data().likedUsers.includes(this.currentUserId)) {
          checkLike = true;
        } else {
          checkLike = false;
        }
        let ref = db.collection("users").doc(snapshot.data().user_id);
        ref
          .get()
          .then((author) => {
            if (author) {
              //   push the data from database to posts array
              this.post.id = this.$route.params.postId;
              this.post.image = snapshot.data().image;
              this.post.like = snapshot.data().like;
              this.post.timestamp = snapshot.data().timestamp;
              this.post.uploadDate = moment(snapshot.data().timestamp).format(
                "lll"
              );
              this.post.description = snapshot.data().description;
              this.post.title = snapshot.data().title;
              this.post.user_id = snapshot.data().user_id;
              this.post.comments = snapshot.data().comments;
              this.post.ava = author.data().avatar;
              this.post.userName = author.data().fullname;
              this.post.hasBeenLiked = checkLike;
              this.post.likedUsers = snapshot.data().likedUsers;
            }
          })
          .catch((error) => {
            this.$message({
              showClose: true,
              message: error.code,
              type: "error",
            });
          });
      } else {
        this.$router
          .push({
            name: "NotFound",
          })
          .catch(() => {});
      }
    });
  },
};
</script>
<style scoped>
.delete-action {
  color: #f56c6c;
}
.delete-action:hover {
  color: white;
  background-color: #f56c6c;
}
.post-detail {
  margin: 1em auto 2em auto;
  width: 40%;
}
.post-comment-list {
  padding: 0px 10px 10px 10px;
}
.current-user-avatar {
  border: 5px solid rgb(218, 218, 218);
  border-radius: 50%;
  float: left;
  width: 3em;
  height: 3em;
}
.post-comment-input {
  width: 96%;
  padding: 10px;
  border-radius: 25px;
  margin: 10px auto 0px auto;
}
.post-comment-input:hover {
  width: 96%;
  padding: 10px;
  border-radius: 25px;
  margin: 10px auto 0px auto;
  background-color: #e3e3e3;
  cursor: pointer;
}
.post-dropdown {
  float: right;
}
.more-button {
  color: #737574;
  font-size: 30px;
}
.post-divide {
  height: 1px;
  width: 100%;
  background-color: #ababab;
  clear: both;
  margin: 20px auto 10px auto;
}

.post_image {
  width: 100%;
  height: auto;
}
.post-user-info {
  height: 90px;
  padding: 10px;
}
.user-avatar {
  border: 5px solid rgb(218, 218, 218);
  border-radius: 50%;
  float: left;
  width: 5em;
  height: 5em;
}
.user-info {
  float: left;
  margin-left: 20px;
}
.user-name {
  color: black;
  margin: 3px 0;
  font-size: 30px;
  font-weight: bold;
}
.post-time {
  display: inline-block;
}
.favorite-button {
  float: left;
  color: black;
  font-size: 50px;
  cursor: pointer;
}
.post-like {
  float: left;
  font-size: 35px;
  margin: 0 5px;
}
.button-liked {
  color: #3f51b5;
}
@media only screen and (max-width: 800px) {
  .post-detail {
    margin: 1em auto 2em auto;
    width: 90%;
  }
  .post-comment-list {
    padding: 0px 10px 10px 10px;
  }
  .current-user-avatar {
    border: 5px solid rgb(218, 218, 218);
    border-radius: 50%;
    float: left;
    width: 3em;
    height: 3em;
  }
  .post-comment-input {
    width: 96%;
    padding: 10px;
    border-radius: 25px;
    margin: 10px auto 0px auto;
  }
  .post-comment-input:hover {
    width: 96%;
    padding: 10px;
    border-radius: 25px;
    margin: 10px auto 0px auto;
    background-color: #e3e3e3;
    cursor: pointer;
  }
  .post-dropdown {
    float: right;
  }
  .button-more {
    color: #737574;
    font-size: 30px;
  }
  .post-user-info {
    height: 90px;
    padding: 10px;
  }
  .user-avatar {
    border: 5px solid rgb(218, 218, 218);
    border-radius: 50%;
    float: left;
    width: 3em;
    height: 3em;
    margin-top: 10px;
  }
  .user-info {
    float: left;
    margin-left: 10px;
  }
  .user-name {
    color: black;
    margin: 3px 0;
    font-size: 20px;
    font-weight: bold;
  }
  .post-time {
    display: inline-block;
    font-size: 11px;
  }
  .favorite-button {
    float: left;
    color: black;
    font-size: 30px;
    cursor: pointer;
  }
  .post-like {
    float: left;
    font-size: 20px;
    margin: 0 5px;
  }
  .post-description {
    font-size: 20px;
    margin-top: 50px;
  }
  .button-liked {
    color: #3f51b5;
  }
}
</style>