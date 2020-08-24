<script>
export default {
  name: 'Utilization',

  components: {},

  props: {
    resource: {
      type:     Object,
      required: true,
    },
  },

  data() {
    return {};
  },

  computed: {
    cpu() {
      return '';
    },
  },
};
</script>

<template>
  <div class="o-u">
    <div class="row o-u__headers">
      <div class="col span-6 br-1">
        <div class="row">
          <div class="col span-6 o-u__cols">
            Resource
          </div>
          <div class="col span-6 text-right o-u__cols pr-10">
            Usage
          </div>
        </div>
      </div>
      <div class="col span-6"></div>
    </div>
    <div class="row bt-1">
      <div class="col span-6 br-1">
        <div class="row">
          <div class="col span-6 text-left o-u__cols">
            CPU
          </div>
          <div class="col span-6 text-right o-u__cols pr-10">
            Not available
          </div>
        </div>
      </div>
      <div class="col span-6 text-center o-u__cols">
        No datapoints found.
      </div>
    </div>
    <div class="row bt-1">
      <div class="col span-6 br-1">
        <div class="row">
          <div class="col span-6 text-left o-u__cols">
            Memory
          </div>
          <div class="col span-6 text-right o-u__cols pr-10">
            Not available
          </div>
        </div>
      </div>
      <div class="col span-6 text-center o-u__cols">
        No datapoints found.
      </div>
    </div>
    <div class="row bt-1">
      <div class="col span-6 br-1">
        <div class="row">
          <div class="col span-6 text-left o-u__cols">
            Filesystem
          </div>
          <div class="col span-6 text-right o-u__cols pr-10">
            Not available
          </div>
        </div>
      </div>
      <div class="col span-6 text-center o-u__cols">
        No datapoints found.
      </div>
    </div>
    <div class="row bt-1">
      <div class="col span-6 br-1">
        <div class="row">
          <div class="col span-6 text-left o-u__cols">
            Network Transfer
          </div>
          <div class="col span-6 text-right o-u__cols pr-10">
            Not available
          </div>
        </div>
      </div>
      <div class="col span-6 text-center o-u__cols">
        No datapoints found.
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .o-u {
    .bt-1 {
      border-top: 1px solid #d2d2d2;
    }

    .br-1 {
      border-right: 1px solid #d2d2d2;
    }

    .o-u__cols {
      height: 70px;
      line-height: 70px;
    }

    &__headers {
      .o-u__cols {
        height: 37px;
        line-height: 37px;
      }
    }
  }
</style>
