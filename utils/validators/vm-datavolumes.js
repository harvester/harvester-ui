import { formatSi, parseSi } from '@/utils/units';

export function dataVolumeSize(storage, getters, errors, validatorArgs) {
  if (!storage || storage === '') {
    errors.push(getters['i18n/t']('validation.required', { key: 'Size' }));

    return errors;
  }

  const size = getSize(storage);
  const max = 999999;
  const integerRegex = /^[1-9]\d*$/;

  if (!integerRegex.test(size) || size > max) {
    errors.push('Size must be integer and between 1 and 999999');
  }

  return errors;
}

function getSize(storage) {
  if (!storage) {
    return null;
  }

  const kibUnitSize = parseSi(storage);

  return formatSi(kibUnitSize, {
    addSuffix:   false,
    increment:   1024,
    minExponent: 3,
    maxExponent: 3
  });
}
