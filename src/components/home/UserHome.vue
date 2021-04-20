<template>
  <div class="home-user container">
    <div class="new-post">
      <el-button @click="openForm" class="create_post_button">
        New Post
      </el-button>
      <CreatePost
        @handleEvent="handleEvent"
        v-bind:new-post-visible="showNewPost"
      />
    </div>
    Sort by:
    <el-button
      v-if="!isSort"
      class="toggle-sort-button"
      type="text"
      @click="toggleSort"
      >Newest</el-button
    >
    <el-button v-else type="text" class="toggle-sort-button" @click="toggleSort"
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
          <img :src="post.image" class="post_image" v-if="post.image" />
          <div style="padding: 14px">
            <div class="post-action">
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
              <router-link
                :to="{ name: 'PostDetail', params: { postId: post.id } }"
              >
                <i class="el-icon-chat-round comment-button"></i>
              </router-link>
            </div>
            <p class="post-like" v-if="post.like && post.like <= 1">
              {{ post.like }} Like
            </p>
            <p class="post-like" v-if="post.like && post.like > 1">
              {{ post.like }} Likes
            </p>
            <h3 style="clear: left" class="post-description">
              {{ post.description }}
            </h3>
          </div>
        </el-card>
      </div>
    </div>
    <div
      class="new-post-button-float-container"
      v-if="isScroll"
      @click="openForm"
    >
      <p class="new-post-button-float">New post</p>
    </div>
  </div>
</template>
<script>
import db from "@/firebase/init";
import firebase from "firebase";
import moment from "moment";
import CreatePost from "../post/CreatePost";
export default {
  name: "HomeUser",
  components: {
    CreatePost,
  },
  data() {
    return {
      showNewPost: false,
      posts: [],
      currentUserId: null,
      isSort: false,
      isScroll: false,
    };
  },
  methods: {
    openForm() {
      this.showNewPost = true;
    },
    handleEvent(event, data) {
      if (event === "closeFormNewPost") {
        this.showNewPost = false;
        this.posts.sort((a, b) => {
          return b.timestamp - a.timestamp;
        });
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
    handleScroll() {
      if (window.top.scrollY > 200 && window.innerWidth > 970) {
        this.isScroll = true;
      } else {
        this.isScroll = false;
      }
    },
  },
  beforeCreate() {
    document.body.className = "body-bg-no-image";
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
      } else {
        this.currentUserId = null;
      }
    });
    let postdb = db.collection("posts").orderBy("timestamp", "desc");
    postdb.onSnapshot((snapshot) => {
      if (snapshot.docChanges()) {
        snapshot.docChanges().forEach((change) => {
          if (change) {
            if (change.type == "added") {
              let post = change.doc;
              //get user data
              let ref = db.collection("users").doc(post.data().user_id);
              ref
                .get()
                .then((author) => {
                  if (author) {
                    let checkLike = false;
                    //   push the data from database to posts array
                    if (post.data().likedUsers.includes(this.currentUserId)) {
                      checkLike = true;
                    } else {
                      checkLike = false;
                    }
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
                      ava: author.data().avatar,
                      userName: author.data().fullname,
                      hasBeenLiked: checkLike,
                      likedUsers: post.data().likedUsers,
                    }); //push the data to the posts array
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
  created() {
    window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
};
</script>
<style scoped>
.new-post-button-float-container {
  bottom: 50px;
  right: 30px;
  background-color: #3f51b5;
  z-index: 1;
  position: fixed;
  width: 120px;
  text-align: center;
  height: 40px;
  border-radius: 40px;
  cursor: pointer;
}
.new-post-button-float {
  font-size: 20px;
  margin: 5px;
  font-weight: bold;
  color: white;
}
.post-description {
  font-size: 20px;
}
.home-user {
  margin: 2em auto;
  width: 40%;
  max-width: 1280px;
}
.create_post_button {
  margin-top: 1em;
  width: 100%;
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
  border: 2px solid rgb(218, 218, 218);
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
  font-size: 20px;
  font-weight: bold;
}
.post-time {
  display: inline-block;
  color: #707070;
}
.favorite-button {
  display: inline-block;
  vertical-align: middle;
  color: black;
  font-size: 35px;
  cursor: pointer;
}
.post-like {
  display: inline-block;
  font-size: 15px;
  font-weight: bold;
  margin: 10px 5px 0px 5px;
}
.comment-button {
  display: inline-block;
  color: black;
  margin-left: 20px;
  font-size: 30px;
  font-weight: bold;
  vertical-align: middle;
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
@media only screen and (max-width: 970px) {
  .home-user {
    margin: 2em auto;
    width: 90%;
    max-width: 1280px;
  }
}
</style>