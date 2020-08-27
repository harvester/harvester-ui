<script>
import Banner from '@/components/Banner';
import SortableTable from '@/components/SortableTable';

export default {
  components: {
    Banner,
    SortableTable,
  },

  props: {
    title: {
      type:     String,
      required: true
    },
    modalName: {
      type:     String,
      required: true
    },
    headers: {
      type:    Array,
      default: () => {
        return [];
      }
    },
    rows: {
      type:    Array,
      default: () => {
        return [];
      }
    },
    errors: {
      type:    Array,
      default: () => {
        return [];
      }
    }
  },

  methods: {
    show() {
      this.$modal.show(this.modalName);
    },
    hide() {
      this.$emit('update:cancel');
      this.$modal.hide(this.modalName);
    },
    add() {
      this.$emit('validateError');
      if (this.errors.length > 0) {
        return;
      }
      this.$emit('update:add');
      this.hide();
    },
    openModal() {
      this.show();
      this.$emit('update:index', this.rows.length, 'add');
    },
    handleRow(row, type) {
      this.show();
      const { index } = row;

      this.$emit('update:index', index, type);
      if (type === 'delete') {
        this.$emit('update:add');
        this.hide();
      }
    }
  },
};
</script>

<template>
  <div>
    <SortableTable
      key-field="id"
      :rows="rows"
      :search="false"
      :headers="headers"
      :row-actions-width="60"
      :table-actions="false"
    >
      <template v-slot:row-actions="scope">
        <div class="action">
          <button type="button" class="btn btn-sm bg-primary mr-15" @click="handleRow(scope.row, 'modify')">
            modify
          </button>

          <button type="button" class="btn btn-sm bg-primary" :disabled="scope.row.disableDelete" @click="handleRow(scope.row, 'delete')">
            delete
          </button>
        </div>
      </template>
    </SortableTable>

    <modal :name="modalName" height="auto" :scrollable="true" :click-to-close="false" :pivot-y="0.2">
      <div class="modal">
        <div class="title mb-20">
          <span>{{ title }}</span>
          <i class="icon icon-close" @click="hide"></i>
        </div>

        <div class="content mb-20">
          <slot name="content"></slot>
        </div>

        <div v-for="(err,idx) in errors" :key="idx">
          <Banner color="error" :label="err" />
        </div>

        <div class="footer mb-20">
          <button class="btn bg-primary btn-sm mr-20" @click="hide">
            Cancel
          </button>
          <button class="btn bg-primary btn-sm mr-20" @click="add">
            Add
          </button>
        </div>
      </div>
    </modal>

    <button class="btn bg-primary btn-sm mb-20" @click="openModal">
      {{ title }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.action {
  display: flex;
}

.modal {
  padding: 10px;

  .title {
    display: flex;
    justify-content: space-between;
    span {
      font-size: 22px;
    }

    i {
      font-size: 22px;
    }
  }

  .footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
