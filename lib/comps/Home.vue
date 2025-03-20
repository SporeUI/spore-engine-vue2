<template>
  <div class="engine-home">
    <h3 class="engine-title">{{title}}</h3>
    <ul class="engine-pages">
      <li class="engine-link" v-for="(page, index) in pages" :key="index">
        <router-link :to="page">{{page}}</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  computed: {
    ...mapState('routes', [
      'pages',
    ]),
  },
  data() {
    return {
      title: 'Engine Pages',
    };
  },
};
</script>

<style lang="less" scoped>
.engine{
  &-home{
    color: #333;
  }
  &-title{
    margin: 0 12px 10px 12px;
    padding: 0;
    border-bottom: 1px solid #ddd;
    font-size: 24px;
    line-height: 48px;
  }
  &-pages{
    margin: 12px;
    padding: 0;
    list-style: none;
    font-size: 14px;
  }
  &-link{
    line-height: 44px;
    padding: 0 10px;
    margin-bottom: 10px;
    background-color: #f0f0f0;
    border-radius: 4px;
    a {
      display: block;
      text-decoration: none;
    }
  }
}
</style>
