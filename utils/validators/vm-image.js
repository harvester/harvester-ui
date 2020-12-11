export function imageUrl(url, getters, errors, validatorArgs) {
  if (!url || url === '') {
    errors.push(getters['i18n/t']('validation.required', { key: 'Url' }));

    return errors;
  }

  const suffixName = url.split('/').pop();
  const fileSuffiic = suffixName.split('.').pop().toLowerCase();
  const filesFormat = ['gz', 'qcow', 'qcow2', 'raw', 'img', 'xz', 'iso'];

  if (!filesFormat.includes(fileSuffiic)) {
    errors.push('The URL you have entered ends in an extension that we do not support. We only accept image files that end in .img, .iso, .qcow2, .raw, and compressed (.tar, .gz, .xz) of the above formats).');
  }

  return errors;
}
