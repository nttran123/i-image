<template>
  <div>
    <div class="image">
      <img
        :src="require('../../assets/image403.png')"
        alt="403"
        class="errorImage"
      />
    </div>
    <div class="errorbtn">
      <h2>We are Sorry...</h2>
      <p>You don't have permission to access this page.</p>
      <button class="btn indigo darken-4" @click="goBack">Back Home</button>
    </div>
  </div>
</template>
<script>
export default {
  name: "Forbidden",
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