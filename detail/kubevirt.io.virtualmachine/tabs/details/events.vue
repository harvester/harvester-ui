<script>
import ResourceState from '../../resource-state/index';

export default {
  name: 'Details',

  components: { ResourceState },

  props: {
    events: {
      type:     Array,
      required: true,
    },
  },

  data() {
    return { rows: [] };
  },

  computed: {},

  watch: {
    events() {
      this.rows = [].concat(this.events);
    }
  },

  methods: {
    collapse(index) {
      this.$set(this.rows[index], 'collapse', !this.rows[index].collapse);
    },

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
    }
  }
};
</script>

<template>
  <div class="overview-events">
    <div v-for="(row, index) in rows" :key="row.id" class="overview-events__item" :class="row.collapse ? 'is-collapse' : '' ">
      <div class="overview-events__normal" @click="collapse(index)">
        <div class="overview-events__time">
          {{ getEventTime(row.lastTimestamp) }}
        </div>
        <div v-if="!row.collapse" class="overview-events__content">
          <ResourceState v-model="row.involvedObject.kind" />
          <ResourceState v-if="row._type !== 'Normal'" v-model="row._type" />
          <div class="overview-events__text">
            {{ row.message }}
          </div>
        </div>
        <div class="collapse-bar">
          <span></span>
        </div>
      </div>
      <div v-if="row.collapse" class="overview-events__collapse">
        <ResourceState v-model="row.involvedObject.kind" />
        <ResourceState v-if="row._type !== 'Normal'" v-model="row._type" />
        {{ row.involvedObject.name }}
        <div class="overview-events__text">
          {{ row.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .overview-events {
    &__item {
      margin-bottom: 10px;
      user-select: none;

      &.is-collapse {
        .overview-events__normal {
          flex-wrap: wrap;
        }

        .overview-events__time {
          flex: 1;
        }

        .overview-events__text {
          overflow: inherit;
          white-space: inherit;
          word-break: break-all;
        }

        .collapse-bar {
          top: 4px;

          span {
            transform: rotate(135deg);
            -webkit-transform: rotate(135deg);
          }
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    &__normal {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 4px 0;
      cursor: pointer;

      &:hover {
        .overview-events__text {
          color: #06c;
        }
      }
    }

    &__time {
      margin-right: 5px;
    }

    &__content {
      display: flex;
      flex: 1;
      align-items: center;
      overflow:hidden;
    }

    &__text {
      flex: 1;
      overflow:hidden;
      white-space:nowrap;
      text-overflow:ellipsis;
    }

    .collapse-bar {
      position: relative;
      display: inline-block;
      width: 15px;
      height: 15px;
      text-align: right;

      span {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-top: 1px solid #656565;
        border-right: 1px solid #656565;
        transition: .2s;
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
      }
    }

    .badge-state {
      padding: 2px 5px;
      margin-right: 3px;
    }

    .overview-events__collapse {
      margin-top: 8px;

      .overview-events__text {
        margin-top: 8px;
      }
    }
  }
</style>
