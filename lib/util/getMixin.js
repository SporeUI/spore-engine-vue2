import $api from './api';
import $request from './request';

function getMixin() {
  const {
    $logger,
    $bus,
    $plug,
  } = this;

  // 提供组件公共 mixin
  const mixin = {
    computed: {
      $plug() {
        return $plug;
      },
      $bus() {
        return $bus;
      },
      $logger() {
        return $logger;
      },
    },
    methods: {
      $api,
      $request,
    },
  };
  return mixin;
}

export default getMixin;
