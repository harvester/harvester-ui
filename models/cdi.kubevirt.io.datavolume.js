import { colorForState } from '@/plugins/steve/resource-instance';
import { VM, DATA_VOLUME } from '@/config/types';
import { DATA_VOLUME_OWNEDBY } from '@/config/labels-annotations';

export default {
  stateDisplay() {
    const ownedBy = this?.metadata?.annotations?.[DATA_VOLUME_OWNEDBY];

    if (ownedBy) {
      return 'In-use';
    } else {
      return 'Ready';
    }
  },

  stateBackground() {
    if (this.stateDisplay === 'Ready') {
      return 'bg-primary';
    }

    return colorForState(this.stateDisplay).replace('text-', 'bg-');
  },

  statusDisplay() {
    const readyCondition = this?.getStatusConditionOfType('Ready');

    return readyCondition?.status === 'True' ? 'Ready' : 'NoReady';
  },

  phaseStatus() {
    return this?.status?.phase || 'N/A';
  },

  phaseStatusBackgroud() {
    return colorForState(this.phaseStatus).replace('text-', 'bg-');
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
  },

  warningCount() {
    return this.resourcesStatus.warningCount;
  },

  errorCount() {
    return this.resourcesStatus.errorCount;
  },

  resourcesStatus() {
    const list = this.$rootGetters['cluster/all'](DATA_VOLUME);

    let warning = 0;
    let error = 0;

    list.forEach((item) => {
      const status = item.getStatusConditionOfType('Ready')?.status;

      if (status === 'False') {
        error += 1;
      } else if (status === 'Unknown') {
        warning += 1;
      }
    });

    return {
      warningCount: warning,
      errorCount:   error
    };
  },

  customValidationRules() {
    const out = [
      {
        nullable:       false,
        path:           'metadata.name',
        required:       true,
        minLength:      1,
        maxLength:      63,
        translationKey: 'generic.name'
      },
      {
        nullable:       false,
        path:           'spec.pvc.resources.requests.storage',
        required:       true,
        translationKey: 'volumePage.size',
        type:           'string',
      },
      {
        nullable:       false,
        path:           'spec.source',
        required:       true,
        translationKey: 'volumePage.source',
        type:           'object',
      },
      {
        nullable:       false,
        path:           'spec.pvc.storageClassName',
        required:       true,
        translationKey: 'volumePage.storageClass',
        type:           'string',
      }
    ];

    if (this.spec.source.http) {
      out.push({
        nullable:       false,
        path:           'spec.source.http.url',
        required:       true,
        translationKey: 'volumePage.image',
        type:           'string',
      });
    }

    return out;
  },
};
