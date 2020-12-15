export function imageUrl(url, getters, errors, validatorArgs) {
  if (!url || url === '') {
    errors.push(getters['i18n/t']('validation.required', { key: 'Url' }));

    return errors;
  }

  const suffixName = url.split('/').pop();
  const fileSuffiic = suffixName.split('.').pop().toLowerCase();
  const filesFormat = ['gz', 'qcow', 'qcow2', 'raw', 'img', 'xz', 'iso'];

  if (!filesFormat.includes(fileSuffiic)) {
    errors.push(getters['i18n/t']('harvester.imagePage.ruleTip'));
  }

  return errors;
}
