import { HARVESTER_BACKUP, LONGHORN_SETTING, VM } from '@/config/types';
import { HARVESTER_BACKUP_TARGET } from '@/config/labels-annotations';
import { colorForState } from '@/plugins/steve/resource-instance';

export default {
  _availableActions() {
    const toFilter = ['goToEdit', 'cloneYaml', 'goToClone', 'download'];

    const out = this._standardActions.filter((action) => {
      if (!toFilter.includes(action.action)) {
        return action;
      }
    });

    return [
      {
        action:     'restoreExistingVM',
        enabled:    (!!this.isMatchWithCurrentBakcupTarget) && this.attachVmExisting,
        icon:       'icons icon-h-restore-existing',
        label:      this.t('action.restoreExistingVM'),
      },
      {
        action:     'restoreNewVM',
        enabled:    !!this.isMatchWithCurrentBakcupTarget,
        icon:       'icons icon-h-restore-new',
        label:      this.t('action.restoreNewVM'),
      },
      ...out
    ];
  },

  restoreExistingVM() {
    return (resource = this) => {
      const router = this.currentRouter();

      router.push({
        name:   `c-cluster-product-resource-create`,
        params: { resource: HARVESTER_BACKUP },
        query:  { restoreMode: 'existing', backupName: resource.name }
      });
    };
  },

  restoreNewVM() {
    return (resource = this) => {
      const router = this.currentRouter();

      router.push({
        name:   `c-cluster-product-resource-create`,
        params: { resource: HARVESTER_BACKUP },
        query:  { restoreMode: 'new', backupName: resource.name }
      });
    };
  },

  state() {
    let out = 'Pending';

    if (this?.status?.readyToUse) {
      out = 'Ready';
    } else if (this.getConditionStatus('Progressing') === 'True') {
      out = 'Progressing';
    } else if (this.getConditionStatus('Ready') !== 'True') {
      out = 'error';
    }

    return out;
  },

  stateColor() {
    const state = this.state;

    return colorForState(state);
  },

  attachVM() {
    return this.spec.source.name;
  },

  backupContentName() {
    return this?.status?.virtualMachineBackupContentName || '';
  },

  backupTarget() {
    return this.getAnnotationValue(HARVESTER_BACKUP_TARGET);
  },

  isMatchWithCurrentBakcupTarget() {
    const allLongornSetting = this.$rootGetters['cluster/all'](LONGHORN_SETTING);
    const backupTargetResource = allLongornSetting.find( O => O.id === 'longhorn-system/backup-target');

    return this.backupTarget === backupTargetResource?.value;
  },

  attachVmExisting() {
    const vmList = this.$rootGetters['cluster/all'](VM);

    return !!vmList.find( V => V.metadata.name === this.attachVM);
  }
};
