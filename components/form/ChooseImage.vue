<script>
import { IMAGE } from '@/config/types';
const TIP = 'An external URL to the .iso, .img, .qcow2 or .raw that the virtual machine should be created from.';

export default {
  props: {
    value: {
      type:    String,
      default: ''
    }
  },

  data() {
    const images = this.$store.getters['cluster/all'](IMAGE) || [];

    return {
      images,
      tip:        TIP,
      searchKey:  '',
      activeName: this.value,
    };
  },

  computed: {
    readiedImages() {
      return this.images.filter( (I) => {
        return I.spec.displayName.includes(this.searchKey) && I.isReady;
      });
    }
  },

  watch: {
    activeName: {
      handler(neu) {
        this.$emit('input', neu);
      },
      immediate: true
    },
    value(neu) {
      this.activeName = neu;
    }
  },

  methods: {
    selected(neu) {
      this.activeName = neu;
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
          v-for="item in readiedImages"
          :key="item.id"
          class="image mb-10"
          :class="{active: activeName == item.spec.displayName}"
          @click="selected(item.spec.displayName)"
        >
          <div class="info">
            <span>{{ item.spec.displayName }}</span>
            <span>{{ item.spec.description }}</span>
          </div>

          <i v-if="activeName == item.spec.displayName" class="icon icon-checkmark checkmark" />
        </div>
      </div>

      <div class="mt-20">
        <nuxt-link to="/c/local/virtual/harvester.cattle.io.virtualmachineimage">
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
