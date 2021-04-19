<template>
  <div class="comment">
    <el-dropdown
      class="comment-dropdown"
      v-if="currentUserId === userId"
      @command="handleDropdownAction"
    >
      <span class="el-dropdown-link">
        <i class="el-icon-more more-button"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          icon="el-icon-delete"
          class="delete-action"
          command="delete"
          >Delete comment</el-dropdown-item
        >
      </el-dropdown-menu>
    </el-dropdown>
    <img class="user-avatar" :src="userAvatar" />
    <p class="username">{{ username }}</p>
    <time class="comment-time">{{ getTime }}</time>
    <p class="comment-content">{{ comment }}</p>
  </div>
</template>

<script>
import db from "@/firebase/init";
import firebase from "firebase";
import moment from "moment";

export default {
  name: "Comment",
  props: [
    "username",
    "userId",
    "userAvatar",
    "postId",
    "comment",
    "timestamp",
    "currentUserId",
  ],
  data() {
    return {
      commentTime: null,
    };
  },
  methods: {
    handleDropdownAction(command) {
      if (command === "delete") {
        this.$confirm(
          "This will permanently delete the comment. Continue?",
          "Warning",
          {
            confirmButtonText: "OK",
            cancelButtonText: "Cancel",
            type: "warning",
          }
        )
          .then(() => {
            db.collection("posts")
              .doc(this.postId)
              .update({
                comments: firebase.firestore.FieldValue.arrayRemove({
                  username: this.username,
                  userAvatar: this.userAvatar,
                  userId: this.userId,
                  comment: this.comment,
                  timestamp: this.timestamp,
                }),
              })
              .then(() => {
                this.$message({
                  type: "success",
                  message: "Delete completed",
                });
              })
              .catch((err) => {
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
    getTime() {
      return (this.commentTime = moment(this.timestamp).format("lll"));
    },
  },
};
</script>
<style scoped>
.comment-dropdown {
  float: right;
}
.more-button {
  font-size: 30px;
}
.delete-action {
  color: #f56c6c;
}
.delete-action:hover {
  color: white;
  background-color: #f56c6c;
}
.comment {
  clear: both;
  min-height: 120px;
  padding: 10px;
}
.comment:hover {
  clear: both;
  min-height: 120px;
  background-color: #e3e3e3;
  border-radius: 20px;
  padding: 10px;
}
.user-avatar {
  border: 5px solid rgb(218, 218, 218);
  border-radius: 50%;
  float: left;
  width: 3em;
  height: 3em;
}
.username {
  float: left;
  font-size: 20px;
  font-weight: bold;
  margin: 0px 10px 0px 10px;
}
.comment-content {
  float: left;
  clear: both;
  margin: 0px 0px 0px 55px;
  font-size: 15px;
}
.comment-time {
  float: left;
  margin: 7px 0px 0px 20px;
  font-size: 14px;
}
@media only screen and (max-width: 500px) {
  .username {
    float: left;
    font-size: 15px;
    font-weight: bold;
    margin: 0px 10px 0px 10px;
  }
  .comment-time {
    float: left;
    margin: 7px 0px 0px 10px;
    font-size: 11px;
  }
}
</style>