<template>
  <div class="new-comment">
    <form @submit.prevent="addComment">
      <label for="new-message" class="new-comment-label"
        >New Comment:</label
      >
      <textarea
        class="materialize-textarea"
        name="new-comment"
        v-model="newComment"
        autocomplete="off"
      />
      <button v-if="newComment"
        class="btn waves-effect waves-light send-comment-button"
        type="submit"
      >
        Send
        <i class="material-icons right">send</i>
      </button>
    </form>
  </div>
</template>

<script>
import db from "@/firebase/init";
import firebase from "firebase";

export default {
  name: "NewComment",
  props: ["username", "userId", "userAvatar", "postId", "comments"],
  data() {
    return {
      newComment: null,
    };
  },
  methods: {
    addComment() {
      if (this.newComment) {
        db.collection("posts")
          .doc(this.postId)
          .update({
            comments: firebase.firestore.FieldValue.arrayUnion({
              username: this.username,
              userAvatar: this.userAvatar,
              userId: this.userId,
              comment: this.newComment,
              timestamp: Date.now(),
            }),
          })
          .then(() => {
            this.newComment = null;
          })
          .catch((err) => {
            this.$message({
              showClose: true,
              message: err,
              type: "error",
            });
          });
      } else {
        this.$message({
          showClose: true,
          message: `You must enter a message in order to send one.`,
          type: "error",
        });
      }
    },
  },
};
</script>
<style scoped>
.new-comment-label {
  clear: both;
  margin-left: 10px;
}
.send-comment-button {
  border-radius: 20px;
}
</style>