<script>
export default {
  props: {
    value: {
      type:     Array,
      required: true,
    },
    visible: {
      type:    Boolean,
      default: false
    },
  },

  data() {
    return {
      dialogVisible: false,

      sshkeys: this.value.map((ssh) => {
        return {
          ...ssh,
          showKey: false
        };
      })
    };
  },

  methods: {
    handleClose() {
      this.$emit('close');
    },
    viewKey(index) {
      const neu = this.sshkeys[index];

      neu.showKey = true;

      this.$set(this.sshkeys, index, neu);
    },
    hideKey(index) {
      const neu = this.sshkeys[index];

      neu.showKey = false;

      this.$set(this.sshkeys, index, neu);
    }
  }
};
</script>

<template>
  <el-dialog
    title="View SSH Keys"
    :visible="visible"
    width="50%"
    :before-close="handleClose"
  >
    <div class="overview-sshkeys">
      <div v-for="(ssh, index) in sshkeys" :key="ssh.id" class="row overview-sshkeys__item">
        <div class="col span-4">
          {{ ssh.metadata.name }}
        </div>
        <div class="col span-7 offset-1">
          <div v-if="ssh.showKey" class="key-display">
            {{ ssh.spec.publicKey }}
            <el-button class="hide-bar" type="text" @click="hideKey(index)">
              <i class="el-icon-close"></i>
            </el-button>
          </div>
          <el-button v-else type="text" @click="viewKey(index)">
            *******<i class="el-icon-view el-icon--right"></i>
          </el-button>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">Close</el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
  .overview-sshkeys {
    max-height: 700px;
    overflow: auto;

    &__item {
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .key-display {
      position: relative;
      padding-right: 30px;

      .hide-bar {
        position: absolute;
        top: -10px;
        right: 10px;
      }
    }
  }
</style>
