import { SOURCE_TYPE } from '@/config/map';
import { DATA_VOLUME } from '@/config/types';
export function vmNetworks(spec, getters, errors, validatorArgs) {
  const { domain: { devices: { interfaces } }, networks } = spec;

  const allNames = new Set();

  interfaces.map( (I, index) => {
    allNames.add(I.name);
    const N = networks.find( N => I.name === N.name);

    if (I.name.length > 20) {
      const message = getters['i18n/t']('validation.custom.tooLongName', { max: 20 });

      errors.push(`network[${ index + 1 }]: ${ message }`);
    }

    if (!I.name || !N.name) {
      errors.push(`network[${ index + 1 }]: name is required`);
    }

    if (N.multus) {
      if (!N.multus.networkName) {
        errors.push(`network[${ index + 1 }]: Network Name is required`);
      }
    }

    if (I.macAddress && !isValidMac(I.macAddress)) {
      errors.push(`network[${ index + 1 }]: Invalid MAC address format.`);
    }

    const portsName = new Set();
    const portsNumber = new Set();

    if (I.masquerade && I.ports) {
      const ports = I?.ports || [];

      ports.forEach((P) => {
        portsName.add(P.name);
        portsNumber.add(P.port);
      });

      if (portsName.size !== I.ports.length) {
        errors.push(`network[${ index + 1 }]: Duplicate name of the port.`);
      }

      if (portsNumber.size !== I.ports.length) {
        errors.push(`network[${ index + 1 }]: Duplicate number of the port`);
      }
    }

    // if (this.value.isIpamStatic) {
    //   if (!this.value.cidr) {
    //     return this.getInvalidMsg('cidr');
    //   }
    // }

    // if (this.value.isIpamStatic && this.value.cidr) {
    //   this.validateCidr(this.value.cidr);
    // }
  });

  if (allNames.size !== interfaces.length) {
    errors.push('network with this name already exists!.');
  }

  return errors;
}

export function vmDisks(spec, getters, errors, validatorArgs) {
  const _volumes = spec?.template?.spec?.volumes || [];
  const _dataVolumeTemplates = spec?.dataVolumeTemplates || [];
  const _disks = spec?.template?.spec?.domain?.devices?.disks || [];

  const allNames = new Set();

  _disks.forEach((D, idx) => {
    if (D.name.length > 30) {
      const message = getters['i18n/t']('validation.custom.tooLongName', { max: 30 });

      errors.push(`volume[${ idx + 1 }]: ${ message }`);
    }

    if (!D.name) {
      errors.push(`volume[${ idx + 1 }]: name is required!`);
    }

    allNames.add(D.name);
  });

  if (allNames.size !== _disks.length) {
    errors.push('volume with this name already exists!.');
  }

  // volume type logic
  _volumes.forEach((V, idx) => {
    const { type, typeValue } = getVolumeType(V, _dataVolumeTemplates);

    if (type === SOURCE_TYPE.NEW || type === SOURCE_TYPE.IMAGE) {
      if (!/([1-9]|[1-9][0-9]+)[a-zA-Z]+/.test(typeValue?.spec?.pvc?.resources?.requests?.storage)) {
        errors.push(`volume[${ idx + 1 }]: "Size" is required!`);
      }

      if (type === SOURCE_TYPE.IMAGE && !typeValue?.spec?.source?.http?.url) { // type === SOURCE_TYPE.IMAGE
        if (idx === 0) {
          errors.push('"Image" is required!');
        } else {
          errors.push(`volume[${ idx + 1 }]: "Image" is required!`);
        }
      }
    }

    if (type === SOURCE_TYPE.ATTACH_VOLUME) {
      const dvList = getters['cluster/all'](DATA_VOLUME);
      const hasExistingVolume = dvList.find(DV => DV.metadata.name === V?.dataVolume?.name);

      if (!hasExistingVolume) {
        errors.push(`volume[${ idx + 1 }]: "Volume" is required!`);
      }
    }

    if (V?.containerDisk) {
      if (!V.containerDisk.image) {
        errors.push(`volume[${ idx + 1 }]: "Docker Image" is required!`);
      }
    }
  });

  return errors;
}

export function vmMemoryUnit(spec, getters, errors, validatorArgs) {
  if (!/([1-9]|[1-9][0-9]+)[a-zA-Z]+/.test(spec)) {
    errors.push(`"Memory" is required!`);
  }

  return errors;
}

export function isValidMac(value) {
  return /^[A-Fa-f0-9]{2}(-[A-Fa-f0-9]{2}){5}$|^[A-Fa-f0-9]{2}(:[A-Fa-f0-9]{2}){5}$/.test(value);
}

export function isValidCidr(value) {
  return !!/^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-9]|[1-2]\d|3[0-2])$/.test(value);
}

export function getVolumeType(V, DVTS) {
  let outValue = null;

  if (V.dataVolume && V.dataVolume.name) { // maybe is new or existing or image type, but existing type can’t find DVT
    outValue = DVTS.find((DVT) => { // image type
      return V.dataVolume.name === DVT.metadata?.name && DVT.spec?.source?.http;
    });

    if (outValue) {
      return {
        type:      SOURCE_TYPE.IMAGE,
        typeValue: outValue
      };
    }

    // new type
    outValue = DVTS.find((DVT) => {
      return DVT.spec?.source?.blank;
    });

    if (outValue) {
      return {
        type:      SOURCE_TYPE.NEW,
        typeValue: outValue
      };
    }

    // existing, container type volume doesn't need validator
    return {
      type:      SOURCE_TYPE.ATTACH_VOLUME,
      typeValue: null
    };
  }

  return {};
}
