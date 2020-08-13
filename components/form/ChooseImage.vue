<script>
export default {
  props: {
    images: {
      type: Array,
      default() {
        return [];
      }
    },

    imageName: {
      type:    String,
      default: ''
    }
  },

  data() {
    return {
      searchKey:  '',
      activeName: this.imageName,
      tip:        'An external URL to the .iso, .img, .qcow2 or .raw that the virtual machine should be created from.'
    };
  },

  computed: {
    filterImage() {
      return this.images.filter( (I) => {
        return I.spec.displayName.includes(this.searchKey) && I?.status?.conditions?.[0].status === 'True';
      });
    },
  },

  watch: {
    activeName(neu) {
      this.$emit('update:imageName', neu);
    },
    imageName(neu) {
      this.activeName = neu;
    }
  },

  methods: {
    selected(gameName) {
      this.activeName = gameName;
    }
  }
};
</script>

<template>
  <div>
    <h2 :style="{'display':'flex'}">
      Choose a source: <i v-tooltip="tip" class="icon icon-info" style="font-size: 12px" />
    </h2>

    <div class="box">
      <div class="row mb-20">
        <div class="col span-6">
          <input
            v-model="searchKey"
            placeholder="Search"
          />
        </div>
      </div>

      <div class="list">
        <div
          v-for="item in filterImage"
          :key="item.id"
          class="image mb-10"
          :class="{active: activeName == item.spec.displayName}"
          @click="selected(item.spec.displayName)"
        >
          <div class="logo">
            <span class="circle"></span>
          </div>

          <div class="info">
            <span>{{ item.spec.displayName }}</span>
            <span>{{ item.spec.description }}</span>
          </div>

          <i v-if="activeName == item.spec.displayName" class="icon icon-checkmark checkmark" />
        </div>
      </div>

      <div class="mt-20">
        <nuxt-link to="/c/local/virtual/vm.cattle.io.image">
          Add Image
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.list {
  display: grid;
  grid-template-columns: 22% 22% 22% 22%;
  grid-column-gap: 3%;
  max-height: 300px;
  overflow-y: auto;

  .active {
    background-color: #fdf6ec;
  }

  .checkmark {
    position: absolute;
    position: absolute;
    bottom: 0;
    right: 7px;
    font-size: 22px;
  }

  .image {
    position: relative;
    cursor: pointer;
    height: 90px;
    border: 1px solid black;
    display: flex;
    padding: 20px;

    .logo {
      display: flex;
      align-items: center;

      .circle {
        width: 48px;
        height: 48px;
        background-color: #6f6f6f;
        border-radius: 50%;
      }
    }

    .info {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      margin-left: 20px;

      span:first-child {
        font-size: 18px;
      }
    }
  }
}

.box {
  border: 1px solid var(--tabbed-container-bg);
  padding: 20px;
}
</style>
