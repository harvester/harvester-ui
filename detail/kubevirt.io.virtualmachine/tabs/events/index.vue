<script>
import ResourceState from '../../resource-state/index';

export default {
  name: 'Events',

  components: { ResourceState },

  props: {
    resource: {
      type:     Object,
      required: true,
      default:  () => {
        return {};
      }
    },
    events: {
      type:     Array,
      required: true,
    },
  },

  data() {
    return {};
  },

  computed: {
    isNS() {
      return 'Namespace';
    },
    isDown() {
      return this.isEmpty(this.resource);
    },
  },

  methods: {
    getEventTime(time) {
      const date = new Date(time);
      let hours = date.getHours();
      let minutes = date.getMinutes();

      if (hours < 10) {
        hours = `0${ hours }`;
      }

      if (minutes < 10) {
        minutes = `0${ minutes }`;
      }

      return `${ hours }:${ minutes }`;
    },
    isEmpty(o) {
      return o !== undefined && Object.keys(o).length === 0;
    }
  }
};
</script>

<template>
  <div class="vm-events">
    <div v-if="events.length > 0">
      <el-card v-for="event in events" :key="event.id">
        <div class="row">
          <div class="col span-4">
            <ResourceState v-model="event.involvedObject.kind" />
            {{ event.involvedObject.name }}
          </div>
          <div class="col span-4 text-center">
            <ResourceState v-model="isNS" />
            {{ event.involvedObject.namespace }}
          </div>
          <div class="col span-4 text-right">
            {{ getEventTime(event.lastTimestamp) }}
          </div>
          <!-- <div class="col-12"></div> -->
        </div>
        <div class="row mt-10">
          <div class="col span-6">
            {{ t("vm.detail.events.from") }} {{ event.source.component }}
          </div>
          <div class="col span-6"></div>
        </div>
        <div class="row mt-10">
          <div class="col span-12">
            {{ event.message }}
          </div>
        </div>
      </el-card>
    </div>
    <p v-else>
      {{ t("vm.detail.events.down") }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
  .vm-events {
    .el-card {
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .badge-state {
      padding: 2px 5px;
      margin-right: 3px;
    }
  }
</style>
