import _ from 'lodash';
import randomstring from 'randomstring';
import { safeLoad, safeDump } from 'js-yaml';
import { sortBy } from '@/utils/sort';
import { allHash } from '@/utils/promise';
import { SOURCE_TYPE } from '@/config/map';
import {
  NAMESPACE, PVC, VM_TEMPLATE, IMAGE, SSH, STORAGE_CLASS, NETWORK_ATTACHMENT, POD
} from '@/config/types';
import { STORAGE_CLASS_LABEL, HARVESTER_CREATOR, HARVESTER_IMAGE_NAME } from '@/config/labels-annotations';

const TEMPORARY_VALUE = '$occupancy_url';
const NETWROK_ANNOTATION = 'k8s.v1.cni.cncf.io/networks';

export default {
  inheritAttrs: false,

  props: {
    value: {
      type:    [String, Number, Object],
      default: ''
    },
  },

  async fetch() {
    await allHash({
      pods:               this.$store.dispatch('cluster/findAll', { type: POD }),
      ssh:                this.$store.dispatch('cluster/findAll', { type: SSH }),
      pvcs:               this.$store.dispatch('cluster/findAll', { type: PVC }),
      image:              this.$store.dispatch('cluster/findAll', { type: IMAGE }),
      template:           this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.template }),
      storageClass:       this.$store.dispatch('cluster/findAll', { type: STORAGE_CLASS, opt: { url: `${ STORAGE_CLASS }es` } }),
      templateVersion:    this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.version }),
      networkAttachment:  this.$store.dispatch('cluster/findAll', { type: NETWORK_ATTACHMENT, opt: { url: 'k8s.cni.cncf.io.network-attachment-definitions' } }),
    });
  },

  data() {
    return {
      networkScript:     '',
      userScript:        '',
      sshKey:            [],
      imageName:         '',
      sshName:           '',
      publicKey:         '',
      showCloudInit:     false,
      sshAuthorizedKeys:   '',
      useCustomHostname: false
    };
  },

  computed: {
    ssh() {
      const ssh = this.$store.getters['cluster/all'](SSH);

      return ssh;
    },

    memory: {
      get() {
        return this.spec.template.spec.domain.resources.requests.memory;
      },
      set(neu) {
        this.$set(this.spec.template.spec.domain.resources.requests, 'memory', neu);
      }
    },

    namespaceOptions() {
      const choices = this.$store.getters['cluster/all'](NAMESPACE);

      return sortBy(
        choices
          .map((obj) => {
            return {
              label: obj.nameDisplay,
              value: obj.id
            };
          }),
        'label'
      );
    },

    images() {
      return this.$store.getters['cluster/all'](IMAGE);
    },

    storageClasses() {
      return this.$store.getters['cluster/all'](STORAGE_CLASS);
    },

    defaultStorageClass() {
      let defaultValue = '';

      this.storageClasses.map( (O) => {
        if (O.metadata?.annotations?.[STORAGE_CLASS_LABEL.DEFAULT_CALSS] === 'true') {
          defaultValue = O.metadata.name;
        }
      });

      return defaultValue;
    },

    diskRows: {
      get() {
        const _volumes = this.spec?.template?.spec?.volumes || [];
        const _dataVolumeTemplates = this.spec?.dataVolumeTemplates || [];
        const _disks = this.spec?.template?.spec?.domain?.devices?.disks || [];
        let out = [];

        if (_disks.length === 0) {
          out.push({
            index:            0,
            source:           SOURCE_TYPE.IMAGE,
            name:             'disk-0',
            accessMode:       'ReadWriteOnce',
            bus:              'virtio',
            pvcNS:            '',
            pvcName:          '',
            size:             '10Gi',
            type:             'disk',
            storageClassName: this.defaultStorageClass,
            image:            this.imageName,
            disableDelete:    true,
            volumeMode:       'Filesystem',
          });
        } else {
          out = _disks.map( (DISK, index) => {
            const volume = _volumes.find( V => V.name === DISK.name );

            let source = '';
            let pvcName = '';
            const pvcNS = '';
            let accessMode = '';
            let size = '';
            let volumeMode = '';
            let storageClassName = '';
            let image = '';
            let container = '';

            const type = DISK?.cdrom ? 'cd-rom' : 'disk';

            if (volume?.containerDisk) { // is SOURCE_TYPE.CONTAINER_DISK
              source = SOURCE_TYPE.CONTAINER_DISK;
              container = volume.containerDisk.image;
            }

            if (volume?.dataVolume && volume?.dataVolume?.name) {
              const volumeName = volume.dataVolume.name;
              const DVT = _dataVolumeTemplates.find( (T) => {
                return T.metadata.name === volumeName;
              });

              if (DVT) {
                if (DVT.spec?.source?.blank) {
                  source = SOURCE_TYPE.BLANK;
                } else if (DVT.spec?.source?.http) { // url may empty
                  source = SOURCE_TYPE.IMAGE;
                  const imageUrl = DVT.spec.source.http.url;

                  image = this.getImageSource(imageUrl);
                  if (index === 0) {
                    this.imageName = image;
                  }
                }

                accessMode = DVT?.spec?.pvc?.accessModes?.[0];
                size = DVT?.spec?.pvc?.resources?.requests?.storage || '10Gi';
                volumeMode = DVT?.spec?.pvc?.volumeMode;
                storageClassName = DVT?.spec?.pvc?.storageClassName || this.defaultStorageClass;
              } else { // mayby is SOURCE_TYPE.ATTACH_VOLUME
                const choices = this.$store.getters['cluster/all'](PVC);

                const pvcResource = choices.find( O => O.metadata.name === volume?.dataVolume?.name);

                if (pvcResource) {
                  source = SOURCE_TYPE.ATTACH_VOLUME;
                  accessMode = pvcResource?.spec?.accessModes;
                  size = pvcResource?.spec?.resources?.requests?.storage;
                  storageClassName = pvcResource?.spec?.storageClassName;
                  volumeMode = pvcResource?.spec?.volumeMode;
                  pvcName = volume?.dataVolume?.name;
                }
              }
            }

            const bus = DISK?.disk?.bus || DISK?.cdrom?.bus;

            const bootOrder = DISK?.bootOrder;

            return {
              index,
              bootOrder,
              source,
              name:          DISK.name,
              bus,
              pvcName,
              pvcNS,
              container,
              accessMode,
              size,
              volumeMode:    volumeMode || 'Filesystem',
              image,
              type,
              disableDelete: index === 0,
              storageClassName,
            };
          });
        }

        return out.filter( (O) => {
          return O.name !== 'cloudinitdisk';
        });
      },

      set(neu) {
        this.parseDiskRows(neu);
      }
    },

    networkRows: {
      get() {
        const networks = this.spec?.template?.spec?.networks || [];
        const interfaces = this.spec?.template?.spec?.domain?.devices?.interfaces || [];
        const templateAnnotations = this.spec?.template?.metadata?.annotations;
        let networkAnnotition = [];

        if (templateAnnotations?.[NETWROK_ANNOTATION]) {
          networkAnnotition = JSON.parse(templateAnnotations?.[NETWROK_ANNOTATION]);
        }

        const out = interfaces.map( (O, index) => {
          const network = networks.find( (N) => {
            return O.name === N.name;
          });

          const netwrokAnnotation = networkAnnotition.find((N) => {
            return (O.name === N.nname) && (network?.multus?.networkName === N.name);
          });

          const type = O.sriov ? 'sriov' : O.bridge ? 'bridge' : 'masquerade';
          const isPod = !!network?.pod;

          return {
            ...O,
            type,
            model:        O.model || 'virtio',
            networkName:  network?.multus?.networkName || 'Pod Network',
            index,
            isIpamStatic: !!netwrokAnnotation,
            cidr:         netwrokAnnotation?.ips || '',
            isPod
          };
        });

        return out;
      },

      set(neu) {
        this.parseNetworkRows(neu);
      }
    }
  },

  methods: {
    getCloudInit() {
      let out = this.userScript;

      try {
        let newInitScript = {};

        if (out) {
          newInitScript = safeLoad(out);
        }

        if (newInitScript?.sshAuthorizedKeys) {
          newInitScript.sshAuthorizedKeys = [...this.getSSHListValue(this.sshKey), ...newInitScript.sshAuthorizedKeys];
        } else {
          newInitScript.sshAuthorizedKeys = this.getSSHListValue(this.sshKey);
        }
        out = safeDump(newInitScript);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('has error set', error);

        return '#cloud-config';
      }

      const hasCloundConfig = out.startsWith('#cloud-config');

      return hasCloundConfig ? out : `#cloud-config\n${ out }`;
    },
    updateSSHKey(neu) {
      this.$set(this, 'sshKey', neu);
    },
    normalizeSpec() {
      this.parseNetworkRows(this.networkRows);

      this.parseDiskRows(this.diskRows);
    },

    getImageSource(url) {
      if (!url) {
        return;
      }
      const image = this.images.find( I => url === I?.status?.downloadUrl);

      return image?.spec?.displayName;
    },

    getUrlFromImage(name) {
      const image = this.images.find( I => name === I?.spec?.displayName);

      return image?.status?.downloadUrl;
    },

    getImageResource(name) {
      return this.images.find( I => name === I?.spec?.displayName);
    },

    parseDisk(R) {
      let _disk = {};

      if (R.type === 'disk') {
        _disk = {
          disk: { bus: R.bus },
          name: R.name,
        };
      } else if (R.type === 'cd-rom') {
        _disk = {
          cdrom: { bus: R.bus },
          name:  R.name,
        };
      }

      if ( R.bootOrder ) {
        _disk.bootOrder = R.bootOrder;
      }

      return _disk;
    },

    parseVolume(R, dataVolumeName, isCloudInitDisk = false) {
      if (R.source === SOURCE_TYPE.ATTACH_VOLUME) {
        dataVolumeName = R.pvcName;
      }

      const _volume = { name: R.name };

      if (R.source === SOURCE_TYPE.CONTAINER_DISK) {
        _volume.containerDisk = { image: R.container };
      } else if (R.source === SOURCE_TYPE.IMAGE || R.source === SOURCE_TYPE.BLANK || R.source === SOURCE_TYPE.ATTACH_VOLUME) {
        _volume.dataVolume = { name: dataVolumeName };
      } else if (isCloudInitDisk) {
        // cloudInitNoCloud
      }

      return _volume;
    },

    parseDateVolumeTemplate(R, dataVolumeName) {
      const accessModel = R.accessMode;

      const _dataVolumeTemplate = {
        apiVersion: 'cdi.kubevirt.io/v1alpha1',
        kind:       'DataVolume',
        metadata:   { name: dataVolumeName },
        spec:       {
          pvc: {
            accessModes: [accessModel],
            resources:   { requests: { storage: R.size } },
            volumeMode:  R.volumeMode
          }
        }
      };

      switch (R.source) {
      case SOURCE_TYPE.BLANK:
        _dataVolumeTemplate.spec.pvc.storageClassName = R.storageClassName;
        _dataVolumeTemplate.spec.source = { blank: {} };
        break;
      case SOURCE_TYPE.IMAGE: {
        _dataVolumeTemplate.spec.pvc.storageClassName = R.storageClassName;
        _dataVolumeTemplate.spec.source = { http: { url: this.getUrlFromImage(R.image) } };

        const imageResource = this.getImageResource(R.image);
        const imageId = imageResource?.id;

        _dataVolumeTemplate.metadata.annotations = { 'harvester.cattle.io/imageId': imageId };
        break;
      }
      }

      return _dataVolumeTemplate;
    },

    parseSshKeys(checkedSSH) {
      const out = [];

      checkedSSH.map( (O) => {
        const ssh = _.find(this.ssh, S => S?.spec?.publicKey === O);

        if (!ssh) {
          out.push(O);
        }
      });

      return out;
    },

    getInSshList(arr) {
      const out = [];

      arr.map( (O) => {
        const ssh = _.find(this.ssh, S => S.spec.publicKey === O);

        if (ssh) {
          out.push(ssh.metadata.name);
        }
      });

      return out;
    },

    parseDiskRows(disk) {
      const disks = [];
      const volumes = [];
      const dataVolumeTemplates = [];

      disk.forEach( (R) => {
        const prefixName = this.value.metadata?.name || '';
        const dataVolumeName = `${ prefixName }-${ R.name }-${ randomstring.generate(5).toLowerCase() }`;

        const _disk = this.parseDisk(R);
        const _volume = this.parseVolume(R, dataVolumeName);
        const _dataVolumeTemplate = this.parseDateVolumeTemplate(R, dataVolumeName);

        disks.push(_disk);
        volumes.push(_volume);

        if (R.source !== SOURCE_TYPE.CONTAINER_DISK && R.source !== SOURCE_TYPE.ATTACH_VOLUME) {
          dataVolumeTemplates.push(_dataVolumeTemplate);
        }
      });

      if (!disks.find( D => D.name === 'cloudinitdisk')) {
        disks.push({
          name: 'cloudinitdisk',
          disk: { bus: 'virtio' }
        });

        const userData = this.getCloudInit();

        volumes.push({
          name:             'cloudinitdisk',
          cloudInitNoCloud: {
            userData,
            networkData: this.networkScript
          }
        });
      }

      const spec = {
        ...this.spec,
        running:  this.isRunning,
        dataVolumeTemplates,
        template: {
          ...this.spec.template,
          metadata: {
            ...this.value.spec.template.metadata,
            labels: {
              [HARVESTER_CREATOR]:          'harvester',
              [HARVESTER_IMAGE_NAME]:  this.value?.metadata?.name
            }
          },
          spec: {
            ...this.spec.template?.spec,
            domain: {
              ...this.spec.template?.spec?.domain,
              devices: {
                ...this.spec.template?.spec?.domain?.devices,
                disks,
              },
            },
            volumes,
          }
        }
      };

      if (this.pageType !== 'vm') {
        if (!this.imageName) {
          spec.dataVolumeTemplates[0].spec.source.http.url = TEMPORARY_VALUE;
        }
      }

      if (volumes.length === 0) {
        delete spec.template.spec.volumes;
        delete spec.dataVolumeTemplates;
      }

      if (this.pageType === 'vm') {
        this.$set(this.value, 'spec', spec);
        this.$set(this, 'spec', spec);
      } else {
        this.$set(this, 'spec', spec);
      }
    },

    getSSHValue(name) {
      const sshResource = this.ssh.find( O => O.metadata.name === name);

      return sshResource?.spec?.publicKey || undefined;
    },

    getSSHListValue(arr) {
      return arr.map( name => this.getSSHValue(name)).filter( O => O !== undefined);
    },

    parseInterface(R) {
      const _interface = {};
      const type = R.type;

      _interface[type] = {};

      if (R.macAddress) {
        _interface.macAddress = R.macAddress;
      }

      if (R.ports && R.type === 'masquerade') {
        const ports = [];

        for (const item of R.ports) {
          ports.push({
            ...item,
            port: parseInt(item.port)
          });
        }

        _interface.ports = ports;
      }

      _interface.model = R.model;
      _interface.name = R.name;

      return _interface;
    },

    parseNetwork(R) {
      const _network = {};

      if (R.isPod) {
        _network.pod = {};
      } else {
        _network.multus = { networkName: R.networkName };
      }
      _network.name = R.name;

      return _network;
    },

    parseTemplateNetworkAnnotation(R) {
      return {
        name:  R.networkName,
        ips:   R.cidr,
        nname: R.name
      };
    },

    parseNetworkRows(networkRow) {
      const interfaces = [];
      const networks = [];
      const templateNetworkAnnotation = [];

      networkRow.forEach( (R) => {
        const _interface = this.parseInterface(R);
        const _network = this.parseNetwork(R);

        if (R.isIpamStatic) {
          const _templateNetwrokAnnotation = this.parseTemplateNetworkAnnotation(R);

          templateNetworkAnnotation.push(_templateNetwrokAnnotation);
        }

        interfaces.push(_interface);
        networks.push(_network);
      });

      const spec = {
        ...this.spec.template.spec,
        domain: {
          ...this.spec.template.spec.domain,
          devices: {
            ...this.spec.template.spec.domain.devices,
            interfaces,
          },
        },
        networks
      };

      if (!this.value.spec.template.metadata.annotations) {
        this.$set(this.value.spec.template.metadata, 'annotations', {});
      }

      Object.assign(this.value.spec.template.metadata.annotations, { [NETWROK_ANNOTATION]: JSON.stringify(templateNetworkAnnotation) });

      if (this.pageType === 'vm') {
        this.$set(this.value.spec.template, 'spec', spec);
        this.$set(this.spec.template, 'spec', spec);
      } else {
        this.$set(this.spec.template, 'spec', spec);
      }
    },

    updateCloudConfig(userData, networkData) {
      this.userScript = userData;
      this.networkScript = networkData;
    }
  },

  watch: {
    imageName: {
      handler(neu) {
        if (this.diskRows.length > 0) {
          const _diskRows = _.cloneDeep(this.diskRows);

          _diskRows[0].image = neu;
          this.$set(this, 'diskRows', _diskRows);
        }
      },
    },
  }
};
