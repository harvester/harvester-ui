export function imageUrl(url, getters, errors, validatorArgs) {
  const t = getters['i18n/t'];

  if (!url || url === '') {
    const key = t('harvester.imagePage.url');

    errors.push(t('validation.required', { key }));

    return errors;
  }

  const suffixName = url.split('/').pop();
  const fileSuffiic = suffixName.split('.').pop().toLowerCase();
  const filesFormat = ['gz', 'qcow', 'qcow2', 'raw', 'img', 'xz', 'iso'];

  if (!filesFormat.includes(fileSuffiic)) {
    errors.push(t('harvester.validation.image.ruleTip'));
  }

  return errors;
}
