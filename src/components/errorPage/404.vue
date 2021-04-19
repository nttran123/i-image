<template>
  <div>
    <div class="image">
      <img
        :src="require('../../assets/image404.png')"
        alt="404"
        class="errorImage"
      />
    </div>
    <div class="errorbtn">
      <h2>We are Sorry...</h2>
      <p>Page not found.</p>
      <button class="btn indigo darken-4" @click="goBack">Back Home</button>
    </div>
  </div>
</template>
<script>
export default {
  name: "NotFound",
  data() {
    return {};
  },
  methods: {
    goBack() {
      this.$router.push({ name: "Home" });
    },
  },
  beforeCreate() {
    document.body.className = "body-bg-no-image";
  },
};
</script>
<style scoped>
.errorImage {
  width: 40%;
}
.image {
  text-align: center;
  padding-top: 5em;
}
.errorbtn {
  text-align: center;
  padding-bottom: 10em;
}
.backhomebtn {
  border-radius: 20px;
}
</style>