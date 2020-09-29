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
    },
    rowActions: {
      type:    Boolean,
      default: true
    },
    buttonText: {
      type:     String,
      default: ''
    }
  },

  data() {
    return { dialogVisible: false };
  },

  methods: {
    show() {
      this.dialogVisible = true;
    },
    hide() {
      this.dialogVisible = false;
      this.$emit('update:cancel');
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
      :row-actions-width="160"
      :row-actions="rowActions"
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

    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="40%"
    >
      <div class="modal">
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
            Save
          </button>
        </div>
      </div>
    </el-dialog>

    <el-button v-if="rowActions" class="btn btn-sm mb-20 mt-20" @click="openModal">
      {{ buttonText }}
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.action {
  display: flex;
}

.modal {
  .footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
