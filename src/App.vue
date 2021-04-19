<template>
  <div id="app">
    <Navbar />
    <router-view />
    <Footer />
  </div>
</template>

<script>
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
export default {
  name: "App",
  components: {
    Navbar,
    Footer,
  },
};
</script>

<style>
:root {
  --primary-color: #f3f3f3;
}
body {
  background: var(--primary-color);
}
.body-bg-no-image {
  background: var(--primary-color);
}
.body-bg-image-login {
  background: url("./assets/side-nav-background.jpg") no-repeat top center fixed;
  background-size: 100% 100%;
}
.body-bg-image-register {
  background: url("./assets/register-background.jpg") no-repeat top center fixed;
  background-size: 100% 100%;
}
</style>
