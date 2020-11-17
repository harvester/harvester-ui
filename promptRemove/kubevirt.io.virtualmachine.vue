<script>
import { isEmpty } from '@/utils/object';

export default {
  name: 'PromptRemove',

  props: {
    value: {
      type:     Array,
      default: () => {
        return [];
      }
    },
    needsConfirm: {
      type:     Boolean,
      required: true
    }
  },

  data() {
    return {
      checkedList: [],
      checkAll:    true
    };
  },

  computed: {
    removeNameArr() {
      const out = {};

      this.value.forEach((crd) => {
        const volumes = crd.spec.template.spec?.volumes || [];
        const names = volumes.filter(volume => volume.dataVolume ).map((volume) => {
          if (volume.dataVolume) {
            return volume.name;
          }
        });

        out[crd.id] = names;
      });

      return out;
    },
  },

  watch: {
    removeNameArr: {
      handler(neu) {
        if (this.value.length === 1) {
          const keys = Object.values(neu[this.value[0].id]);

          this.checkedList.unshift(keys[0]);
        }
      },
      deep:      true,
      immediate: true
    }
  },

  methods: {
    remove() {
      const parentCompnent = this.$parent.$parent.$parent;

      if (this.needsConfirm && this.confirmName !== this.names[0]) {
        this.error = 'Resource names do not match';
        // if doneLocation is defined, redirect after deleting
      } else {
        let goTo;

        if (parentCompnent.doneLocation) {
          // doneLocation will recompute to undefined when delete request completes
          goTo = { ...parentCompnent.doneLocation };
        }

        Promise.all(this.value.map((resource) => {
          let removedDisks = '';

          if (this.value.length > 1) {
            if (this.checkAll) {
              this.removeNameArr[resource.id].forEach((item) => {
                removedDisks += `removedDisks=${ item }&`;
              });
            }
          } else {
            this.checkedList.forEach((item) => {
              removedDisks += `removedDisks=${ item }&`;
            });
            removedDisks.replace(/&$/, '');
          }
          resource.remove({ url: `${ resource.links.self }?${ removedDisks }` });
        })).then((results) => {
          if ( goTo && !isEmpty(goTo) ) {
            parentCompnent.currentRouter.push(goTo);
          }
          parentCompnent.close();
        }).catch((err) => {
          parentCompnent.error = err;
        });
      }
    }
  }
};
</script>

<template>
  <div class="mt-10">
    <span class="text-info">Select the volume you want to delete:</span>
    <br />
    <div v-if="value.length === 1">
      <span v-for="name in removeNameArr[value[0].id]" :key="name">
        <label class="checkbox-container mr-15"><input v-model="checkedList" type="checkbox" :label="name" :value="name" />
          <span
            class="checkbox-custom mr-5"
            role="checkbox"
          />
          {{ name }}
        </label>
      </span>
    </div>

    <div v-else>
      <label class="checkbox-container mr-15"><input v-model="checkAll" type="checkbox" />
        <span
          class="checkbox-custom mr-5"
          role="checkbox"
        />
        Delete All
      </label>
    </div>
  </div>
</template>
