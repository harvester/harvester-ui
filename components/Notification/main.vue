<script>
const typeMap = {
  success: 'success',
  info:    'info',
  warning: 'warning',
  error:   'error'
};

export default {
  data() {
    return {
      visible:        false,
      message:        '',
      title:          '',
      duration:       4500,
      onClose:        null,
      onClick:        null,
      closed:         false,
      timer:          null,
      position:       'top-right',
      verticalOffset: 0
    };
  },

  computed: {
    typeClass() {
      return this.type && typeMap[this.type] ? `icon-h-${ typeMap[this.type] } color-${ typeMap[this.type] }` : '';
    },

    horizontalClass() {
      return this.position.includes('right') ? 'right' : 'left';
    },

    verticalProperty() {
      return this.position.includes('top') ? 'top' : 'bottom';
    },

    positionStyle() {
      return { [this.verticalProperty]: `${ this.verticalOffset }px` };
    }
  },

  watch: {
    closed(newVal) {
      if (newVal) {
        this.visible = false;
      }
    }
  },

  mounted() {
    if (this.duration > 0) {
      this.timer = setTimeout(() => {
        if (!this.closed) {
          this.close();
        }
      }, this.duration);
    }
    document.addEventListener('keydown', this.keydown);
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.keydown);
  },

  methods: {
    destroyElement() {
      this.$destroy(true);
      this.$el.parentNode.removeChild(this.$el);
    },

    click() {
      if (typeof this.onClick === 'function') {
        this.onClick();
      }
    },

    close() {
      this.closed = true;
      if (typeof this.onClose === 'function') {
        this.onClose();
      }
    },

    clearTimer() {
      clearTimeout(this.timer);
    },

    startTimer() {
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          if (!this.closed) {
            this.close();
          }
        }, this.duration);
      }
    },

    keydown(e) {
      if (e.keyCode === 46 || e.keyCode === 8) {
        this.clearTimer();
      } else if (e.keyCode === 27) { // Close by ESC
        if (!this.closed) {
          this.close();
        }
      } else {
        this.startTimer();
      }
    },

  }
};
</script>

<template>
  <transition
    name="slide-fade"
    @after-leave="destroyElement"
  >
    <div
      v-show="visible"
      :class="['h-notification', horizontalClass]"
      :style="positionStyle"
      @mouseenter="clearTimer()"
      @mouseleave="startTimer()"
      @click="click"
    >
      <div class="h-notification__icon">
        <i :class="['icons', 'iconfont', typeClass]"></i>
      </div>
      <div class="h-notification__group">
        <h3 v-if="title" class="h-notification__title">
          {{ title }}
        </h3>
        <div class="h-notification__message">
          <p>{{ message }}</p>
        </div>
        <div class="h-notification__close" @click.stop="close">
          <i class="icon icon-fw icon-close"></i>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
  .slide-fade-enter-active {
    transition: all .3s ease;
  }

  .slide-fade-enter, .slide-fade-leave-to {
    transform: translateX(10px);
    opacity: 0;

    &.left {
      transform: translateX(-10px);
    }
  }

  .h-notification {
    display: flex;
    box-sizing: border-box;
    position: fixed;
    border: 1px solid #ebeef5;
    border-radius: 2px;
    width: 330px;
    padding: 12px 26px 14px 13px;
    background: var(--body-bg);
    transition:opacity .3s,transform .3s,left .3s,right .3s,top .4s,bottom .3s;

    &__icon {
      font-size: 20px;
      width: 24px;
      margin-right: 5px;
    }

    &__group {
      flex: 1;
    }

    &__title {
      font-size: 16px;
      margin-top: 2px;
    }

    &__message {
      p {
        font-family: "Fira Sans";
        font-size: 14px;
        word-break: break-all;
      }
    }

    &__close {
      position: absolute;
      right: 10px;
      top: 10px;
      font-size: 18px;
      cursor: pointer;
    }

    &.right {
      right: 15px;
    }

    &.left {
      left: 15px;
    }

    .icon-h-success {
      color: var(--success);
    }

    .icon-h-info {
      color: var(--info);
    }

    .icon-h-warning {
      color: var(--warning);
    }

    .icon-h-error {
      color: var(--error);
    }
  }
</style>
