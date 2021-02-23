export default {
  isComplete() {
    return this?.status?.complete || false;
  },

  customValidationRules() {
    const isNew = this.spec?.newVM;

    const rules = [{
      nullable:       false,
      path:           'spec.target.name',
      required:       true,
      minLength:      1,
      maxLength:      63,
      translationKey: 'harvester.fields.virtaulName',
    }, {
      nullable:       false,
      path:           'spec.virtualMachineBackupName',
      required:       true,
      translationKey: 'harvester.backUpPage.restore.backup',
    }];

    if (!isNew) {
      rules.push({
        path:           'spec.deletionPolicy',
        required:       true,
        type:           'string',
        translationKey: 'harvester.backUpPage.restore.deletePreviousVolumes',
      });
    }

    return rules;
  },
};
