<template>
  <div class="profile container" v-if="profile">
    <div class="wallpaper">
      <img class="user-wallpaper" src="@/assets/register-background.jpg" />
    </div>

    <div class="profile_img">
      <img class="profile-ava" :src="profile.avatar" />
    </div>

    <div class="profile_information">
      <h2 class="profile-name">
        {{ profile.fullname }}
      </h2>
    </div>
    <div class="new-post" v-if="isLoggedUser">
      <el-button @click="openForm" class="create_post_button">
        New Post
      </el-button>
      <CreatePost
        @handleEvent="handleEvent"
        v-bind:new-post-visible="showNewPost"
      />
    </div>
    <div class="album">
      Sort by:
      <el-button
        v-if="!isSort"
        class="toggle-sort-button"
        type="text"
        @click="toggleSort"
        >Newest</el-button
      >
      <el-button
        v-else
        type="text"
        class="toggle-sort-button"
        @click="toggleSort"
        >Most Favorite</el-button
      >
      <div class="post_list" v-if="posts">
        <div class="card" v-for="post in posts" :key="post.id">
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
                <router-link
                  :to="{ name: 'PostDetail', params: { postId: post.id } }"
                >
                  <time class="post-time">{{ post.uploadDate }}</time>
                </router-link>
              </div>
            </div>
            <img :src="post.image" class="post_image" />
            <div style="padding: 14px">
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

              <h3 style="clear: left">{{ post.description }}</h3>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";
import db from "@/firebase/init";
import moment from "moment";
import CreatePost from "../post/CreatePost";

export default {
  name: "UserProfile",
  components: {
    CreatePost,
  },
  data() {
    return {
      profile: null,
      isLoggedUser: false,
      showNewPost: false,
      posts: [],
      currentUserId: null,
      isSort: false,
    };
  },
  methods: {
    openForm() {
      this.showNewPost = true;
    },
    handleEvent(event, data) {
      if (event === "closeFormNewPost") {
        this.showNewPost = false;
      }
    },
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
    toggleSort() {
      if (this.isSort === false) {
        this.isSort = true;
        this.posts.sort((a, b) => {
          return b.like - a.like;
        });
      } else {
        this.isSort = false;
        this.posts.sort((a, b) => {
          return b.timestamp - a.timestamp;
        });
      }
    },
  },
  beforeCreate() {
    //check if this current user's profile
    firebase.auth().onAuthStateChanged((currentUser) => {
      if (currentUser) {
        this.currentUserId = currentUser.uid;
        if (currentUser.uid === this.$route.params.id) {
          this.isLoggedUser = true;
        }
      } else {
        this.currentUserId = null;
        this.isLoggedUser = false;
      }
    });
  },
  created() {
    //get posts of this user(if exists)
    let userPost = db
      .collection("posts")
      .where("user_id", "==", this.$route.params.id)
      .orderBy("timestamp", "desc");
    //check snapshot from firebase database
    userPost.onSnapshot((snapshot) => {
      if (snapshot.docChanges()) {
        snapshot.docChanges().forEach((change) => {
          if (change.type == "added") {
            if (change) {
              let post = change.doc;
              //get user data
              let checkLike = false;
              //   push the data from database to posts array
              if (post.data().likedUsers.includes(this.currentUserId)) {
                checkLike = true;
              } else {
                checkLike = false;
              }
              let ref = db.collection("users");
              ref
                .doc(this.$route.params.id)
                .get()
                .then((user) => {
                  if (user.exists) {
                    this.profile = user.data();
                    this.profile.id = user.data().user_id;
                    this.posts.push({
                      id: post.id,
                      image: post.data().image,
                      like: post.data().like,
                      //using moment extension to format dates
                      timestamp: post.data().timestamp,
                      uploadDate: moment(post.data().timestamp).format("lll"),
                      description: post.data().description,
                      title: post.data().title,
                      user_id: post.data().user_id,
                      ava: user.data().avatar,
                      userName: user.data().fullname,
                      hasBeenLiked: checkLike,
                      likedUsers: post.data().likedUsers,
                    });
                  } else {
                    this.$router
                      .push({
                        name: "NotFound",
                      })
                      .catch(() => {});
                  }
                })
                .catch((error) => {
                  this.$message({
                    showClose: true,
                    message: error.code,
                    type: "error",
                  });
                });
            }
          }
        });
      }
    });
  },
};
</script>


<style scoped>
.album {
  width: 95%;
  margin: 1em auto;
}
.profile {
  box-shadow: 0px 0px 20px grey;
  position: relative;
  margin-top: 1em;
  margin-bottom: 2em;
  width: 40%;
}
.user-wallpaper {
  display: block;
  width: 100%;
  height: 150px;
}
.profile-ava {
  border: 5px solid rgb(218, 218, 218);
  border-radius: 50%;
  display: block;
  width: 13em;
  height: 13em;
  position: absolute;
  margin: -115px 0 auto 1em;
}
.profile_information {
  background-color: white;
  height: 100px;
  margin-bottom: 10px;
}
.profile-name {
  color: rgb(39, 21, 21);
  font-size: 2.5em;
  font-weight: 600;
  margin: 0 0 0 6.5em;
  text-shadow: -2px -2px #f3f3f3, -2px -1.5px #f3f3f3, -2px -1px #f3f3f3,
    -2px -0.5px #f3f3f3, -2px 0px #f3f3f3, -2px 0.5px #f3f3f3, -2px 1px #f3f3f3,
    -2px 1.5px #f3f3f3, -2px 2px #f3f3f3, -1.5px 2px #f3f3f3, -1px 2px #f3f3f3,
    -0.5px 2px #f3f3f3, 0px 2px #f3f3f3, 0.5px 2px #f3f3f3, 1px 2px #f3f3f3,
    1.5px 2px #f3f3f3, 2px 2px #f3f3f3, 2px 1.5px #f3f3f3, 2px 1px #f3f3f3,
    2px 0.5px #f3f3f3, 2px 0px #f3f3f3, 2px -0.5px #f3f3f3, 2px -1px #f3f3f3,
    2px -1.5px #f3f3f3, 2px -2px #f3f3f3, 1.5px -2px #f3f3f3, 1px -2px #f3f3f3,
    0.5px -2px #f3f3f3, 0px -2px #f3f3f3, -0.5px -2px #f3f3f3, -1px -2px #f3f3f3,
    -1.5px -2px #f3f3f3;
}
.profile ul {
  margin-top: 2px;
  margin-left: 17em;
}
.profile ul li {
  display: inline-block;
  margin-right: 5em;
  margin-top: 0.5em;
}
.create_post_button {
  margin: 10px;
  width: 97%;
  background-color: #3f51b5;
  font-size: 20px;
  color: white;
}
.post_image {
  width: 100%;
  height: auto;
}
.post-user-info {
  height: 100px;
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
  color: #707070;
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
.toggle-sort-button {
  margin-top: 10px;
  width: 100px;
  color: black;
}
.toggle-sort-button:hover {
  background-color: #b3b3b3;
}
@media only screen and (max-width: 500px) {
  .profile_information {
    background-color: white;
    height: 60px;
    margin-bottom: 10px;
  }
  .create_post_button {
    margin: 5px;
    width: 97%;
    background-color: #3f51b5;
    font-size: 20px;
    color: white;
  }
  .user-wallpaper {
    display: block;
    width: 100%;
    height: 80px;
  }
  .profile-ava {
    border: 5px solid rgb(218, 218, 218);
    border-radius: 50%;
    display: block;
    width: 7em;
    height: 7em;
    position: absolute;
    margin: -50px 0 auto 1em;
  }
  .profile-name {
    color: rgb(39, 21, 21);
    font-size: 1.5em;
    font-weight: 600;
    margin: 0 0 0 6em;
    text-shadow: -2px -2px #f3f3f3, -2px -1.5px #f3f3f3, -2px -1px #f3f3f3,
      -2px -0.5px #f3f3f3, -2px 0px #f3f3f3, -2px 0.5px #f3f3f3,
      -2px 1px #f3f3f3, -2px 1.5px #f3f3f3, -2px 2px #f3f3f3, -1.5px 2px #f3f3f3,
      -1px 2px #f3f3f3, -0.5px 2px #f3f3f3, 0px 2px #f3f3f3, 0.5px 2px #f3f3f3,
      1px 2px #f3f3f3, 1.5px 2px #f3f3f3, 2px 2px #f3f3f3, 2px 1.5px #f3f3f3,
      2px 1px #f3f3f3, 2px 0.5px #f3f3f3, 2px 0px #f3f3f3, 2px -0.5px #f3f3f3,
      2px -1px #f3f3f3, 2px -1.5px #f3f3f3, 2px -2px #f3f3f3, 1.5px -2px #f3f3f3,
      1px -2px #f3f3f3, 0.5px -2px #f3f3f3, 0px -2px #f3f3f3,
      -0.5px -2px #f3f3f3, -1px -2px #f3f3f3, -1.5px -2px #f3f3f3;
  }
  .profile ul {
    margin-top: 2px;
    margin-left: 10em;
  }
  .profile ul li {
    display: inline-block;
    margin-right: 10px;
    margin-top: 0.5em;
    font-weight: bold;
  }
}
</style>