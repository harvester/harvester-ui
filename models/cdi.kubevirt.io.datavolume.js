import { findBy } from '@/utils/array';
import { colorForState } from '@/plugins/steve/resource-instance';
import { VM } from '@/config/types';
import { DATA_VOLUME_OWNEDBY } from '@/config/labels-annotations';

export default {
  availableActions() {
    const out = this._standardActions;
    const removeAction = findBy(out, 'altAction', 'remove');
    const idx = out.indexOf(removeAction);
    const ownedBy = this?.metadata?.annotations?.['harvester.cattle.io/owned-by'];

    if ( !removeAction ) {
      return out;
    }

    out[idx] = {
      ...removeAction,
      enabled: !ownedBy
    };

    return out;
  },

  stateDisplay() {
    const ownedBy = this?.metadata?.annotations?.['harvester.cattle.io/owned-by'];

    if (ownedBy) {
      return 'In-use';
    } else {
      return 'Ready';
    }
  },

  stateBackground() {
    return colorForState(this.stateDisplay).replace('text-', 'bg-');
  },

  statusDisplay() {
    const readyCondition = this?.getStatusConditionOfType('Ready');

    return readyCondition?.status === 'True' ? 'Ready' : 'NoReady';
  },

  phaseStatus() {
    return this?.status?.phase || 'N/A';
  },

  attachVM() {
    const vmList = this.$rootGetters['cluster/all'](VM);
    const ownerAnnotation = this.getAnnotationValue(DATA_VOLUME_OWNEDBY);

    if (!ownerAnnotation) {
      return;
    }

    const owner = JSON.parse(ownerAnnotation)[0]?.refs?.[0];

    return vmList.find( (D) => {
      return D.id === owner;
    });
  },

  isRWO() {
    return this.spec?.pvc?.accessModes?.[0] === 'ReadWriteOnce';
  }
};
