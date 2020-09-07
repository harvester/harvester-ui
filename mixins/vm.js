/* eslint-disable */
import _ from 'lodash';
import { safeLoad, safeDump } from 'js-yaml';
import randomstring from 'randomstring';
import { sortBy } from '@/utils/sort';
import { allHash } from '@/utils/promise';
import { MemoryUnit, SOURCE_TYPE } from '@/config/map';
import {
  NAMESPACE, PVC, VM_TEMPLATE, IMAGE, SSH, VMI, STORAGE_CLASS, NETWORK_ATTACHMENT
} from '@/config/types';
import { STORAGE_CLASS_LABEL } from '@/config/labels-annotations';

export default {
  inheritAttrs: false,

  props: {
    value: {
      type:    [String, Number, Object],
      default: ''
    },
  },

  async fetch() {
    const hash = await allHash({
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
    let cloudInit = `name: default`;;

    return {
      cloudInit,
      sshKey:     [],
      imageName:  '',
      sshName:    '',
      publicKey:  '',
      showCloudInit: false,
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
        this.$set(this.spec.template.spec.domain.resources.requests, 'memory', neu)
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

    storageClasss() {
      return this.$store.getters['cluster/all'](STORAGE_CLASS)
    },

    defaultStorageClass() {
      let defaultValue = '';
      this.storageClasss.map( (O) => {
        if (O.metadata?.annotations?.[STORAGE_CLASS_LABEL.DEFAULT_CALSS]) {
          defaultValue = O.metadata.name;
        }
      });
      return defaultValue
    },

    diskRows: {
      get() {
        const _volumes = this.spec?.template?.spec?.volumes || [];
        const _dataVolumeTemplates = this.spec?.dataVolumeTemplates || [];
        const _disks = this.spec?.template?.spec?.domain?.devices?.disks || [];
        let out = [];

        if (_disks.length === 0) {
          out.push({
            index: 0,
            source: SOURCE_TYPE.IMAGE,
            name: "disk-0",
            accessMode: 'ReadWriteOnce',
            bus: 'virtio',
            pvcNS: "",
            pvcName: "",
            size: '10Gi',
            type: 'disk',
            storageClassName: this.defaultStorageClass,
            image: this.imageName,
            disableDelete: true,
            volumeMode: "Filesystem",
          })
        } else {
          out = _disks.map( (DISK, index) => {
            const volume = _volumes.find( (V) => V.name === DISK.name );

            let source = '';
            let pvcName = '';
            let pvcNS = '';
            let accessMode = '';
            let size = '';
            let volumeMode = '';
            let storageClassName = '';
            let image = '';
            let container = '';

            let type = DISK?.cdrom ? 'cd-rom' : 'disk';

            if(volume?.containerDisk) { // is SOURCE_TYPE.CONTAINER_DISK
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
                  let imageUrl = DVT.spec.source.http.url;
                  image = this.getImageSource(imageUrl);
                  if (index === 0) {
                    this.imageName = image;
                  }
                }

                accessMode = DVT?.spec?.pvc?.accessModes?.[0];
                size = DVT?.spec?.pvc?.resources?.requests?.storage || '10Gi';
                volumeMode = DVT?.spec?.pvc?.volumeMode;
                storageClassName = DVT?.spec?.pvc?.storageClassName  || this.defaultStorageClass;
              }

            }

            const bus = DISK?.disk?.bus || DISK?.cdrom?.bus;

            const bootOrder = DISK?.bootOrder;

            return {
              index,
              bootOrder,
              source,
              name: DISK.name,
              bus,
              pvcName,
              pvcNS,
              container,
              accessMode,
              size,
              volumeMode,
              image,
              type,
              disableDelete: index === 0 ? true : false,
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

        let out = interfaces.map( (O, index) => {
          const network = networks.find( (N) => {
            return O.name === N.name;
          });

          const type = O.sriov ? 'sriov' : O.bridge ? 'bridge' : 'masquerade';
          const isPod = network?.pod ? true : false;
          return {
            ...O,
            type,
            networkName: network?.multus?.networkName || 'Pod Network',
            index,
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
    updateSSHKey(neu) {
      this.$set(this, 'sshKey', neu);
    },
    normalizeSpec() {
      this.parseNetworkRows(this.networkRows);

      this.parseDiskRows(this.diskRows);
    },

    getImageSource(url) {
      if (!url) return;
      const image = this.images.find( (I) => {
        return url === I?.status?.downloadUrl;
      });
      return image?.spec?.displayName
    },

    getUrlFromImage(name) {
      const image = this.images.find( (I) => {
        return name === I?.spec?.displayName;
      });
      return image?.status?.downloadUrl;
    },

    getImageResource(name) {
      return this.images.find( (I) => {
        return name === I?.spec?.displayName;
      });
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
          name: R.name,
        };
      }
      
      if ( R.bootOrder ) {
        _disk.bootOrder = R.bootOrder;
      }
      
      return _disk;
    },

    parseVolume(R, dataVolumeName, isCloudInitDisk = false) {
      const _volume = {
        name:       R.name,
      };

      if (R.source === SOURCE_TYPE.CONTAINER_DISK) {
        _volume.containerDisk = {
          image: R.container
        }
      } else if (R.source === SOURCE_TYPE.IMAGE || R.source === SOURCE_TYPE.BLANK) {
        _volume.dataVolume = {
          name: dataVolumeName
        }
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
            accessModes: [ accessModel ],
            resources:  { requests: { storage: R.size } },
            volumeMode: R.volumeMode
          }
        }
      };
      switch (R.source) {
        case SOURCE_TYPE.BLANK:
          _dataVolumeTemplate.spec.pvc.storageClassName = R.storageClassName;
          _dataVolumeTemplate.spec.source = { blank: {} };
          break;
        case SOURCE_TYPE.IMAGE:
          _dataVolumeTemplate.spec.source = { http: { url: this.getUrlFromImage(R.image) } };
          const imageId = this.getImageResource(R.image)?.id?.replace('/', ':')

          _dataVolumeTemplate.metadata.annotations = {
            'harvester.cattle.io/imageId': imageId
          }
          break;
      }

      return _dataVolumeTemplate
    },

    parseSshKeys(checkedSSH) {
      let out = [];
      checkedSSH.map( O => {
        const ssh = _.find(this.ssh, S => S?.spec?.publicKey === O)

        if (!ssh) {
          out.push(O);
        }
      });

      return out;
    },

    getInSshList(arr) {
      const out = [];
      arr.map( O => {
        const ssh = _.find(this.ssh, S => S.spec.publicKey === O)

        if (ssh) {
          out.push(ssh.metadata.name)
        }
      });
      return out;
    },

    parseDiskRows(disk) {
      const disks = [];
      const volumes = [];
      const dataVolumeTemplates = [];

      disk.forEach( (R) => {
        const dataVolumeName = `${ this.hostname }-${ R.name }-${ randomstring.generate(5).toLowerCase() }`;

        const _disk = this.parseDisk(R);
        const _volume = this.parseVolume(R, dataVolumeName);
        const _dataVolumeTemplate = this.parseDateVolumeTemplate(R, dataVolumeName);

        disks.push(_disk);
        volumes.push(_volume);

        if (R.source !== SOURCE_TYPE.CONTAINER_DISK) {
          dataVolumeTemplates.push(_dataVolumeTemplate);
        }
      });


      if (!disks.find( D => D.name === 'cloudinitdisk')) {
        disks.push({
          name: 'cloudinitdisk',
          disk: { bus: 'virtio' }
        });

        volumes.push({
          name:             'cloudinitdisk',
          cloudInitNoCloud: {
            userData: `#cloud-config\n${ this.cloudInit }`
          }
        });
      }

      const spec = {
        ...this.spec,
        running:  this.isRunning,
        dataVolumeTemplates,
        template: {
          ...this.spec.template,
          spec: {
            ...this.spec.template?.spec,
            domain: {
              ...this.spec.template?.spec?.domain,
              devices: {
                ...this.spec.template?.spec?.domain?.devices,
                disks,
              },
            },
            volumes
          }
        }
      };

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

    getSSHString() {
      const sshValue = this.ssh.filter( (O) => {
        if (this.sshKey.includes(O.metadata.name)) {
          return true;
        }
      });
      if (sshValue.length === 0) {
        return '';
      }

      let sshString = '\nssh_authorized_keys:';

      sshValue.map( (S) => {
        const sshKey = S.spec.publicKey.replace(/s\+/g, '    \n    ');

        sshString += `\n   - >-\n    ${ sshKey }`;
      });

      return sshString
    },

    getSSHValue(name) {
      const sshResource = this.ssh.find( O => O.metadata.name === name);
      return sshResource?.spec?.publicKey || undefined
    },

    getSSHListValue(arr) {
      return arr.map( name => this.getSSHValue(name))
    },

    parseInterface(R) {
      const _interface = {};
      const type = R.type;
      _interface[type] = {};

      if (R.macAddress) {
        _interface.macAddress = R.macAddress;
      }
      
      _interface.model = R.model;
      _interface.name = R.name;

      return _interface
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

    parseNetworkRows(networkRow) {
      const interfaces = [];
      const networks = [];

      networkRow.forEach( (R) => {
        const _interface = this.parseInterface(R);
        const _network = this.parseNetwork(R);
    
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
      
      if (this.pageType === 'vm') {
        this.$set(this.value.spec.template, 'spec', spec);
        this.$set(this.spec.template, 'spec', spec);
      } else {
        this.$set(this.spec.template, 'spec', spec);
      }
    },
  },

  watch: {
    imageName: {
      handler(neu) {
        if (this.pageType === 'vm') {
          const randomName = this.getRandomHostname(neu);
          this.spec.template.spec.hostname = randomName;
        }

        if (this.diskRows.length > 0) {
          const _diskRows = _.cloneDeep(this.diskRows);
          const imageUrl = this.getUrlFromImage(neu);
          _diskRows[0].image = neu;
          this.$set(this, 'diskRows', _diskRows);
        }
      },
      immediate: true
    },

    sshKey(neu) {
      try {
        const oldCloudConfig = safeLoad(this.cloudInit);
        if (oldCloudConfig.ssh_authorized_keys) {
          const checkedSSH = oldCloudConfig.ssh_authorized_keys;
          const out = this.parseSshKeys(checkedSSH);
          const ssh_authorized_keys = this.getSSHListValue(neu);
          ssh_authorized_keys.push(...out);
          oldCloudConfig.ssh_authorized_keys = ssh_authorized_keys;
        } else {
          const ssh_authorized_keys = this.getSSHListValue(neu)
          oldCloudConfig.ssh_authorized_keys = ssh_authorized_keys
        }

        const neuCloudConfig = safeDump(oldCloudConfig);

        this.$set(this, 'cloudInit', neuCloudConfig);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('---watch sshKey has error');
      }
    },

    cloudInit(neu) {
      let newInitScript = {};
      let sshString = '';
      if (neu) {
        try {
          newInitScript = safeLoad(neu);
          console.log('----newInitScript', newInitScript)
          if (newInitScript.hostname) {
            this.hostname = newInitScript.hostname;
          } else {
            this.hostname = '';
          }

          if (newInitScript.ssh_authorized_keys) {
            const checkedSSH = newInitScript.ssh_authorized_keys
            const inSshList = this.getInSshList(checkedSSH)
            this.$set(this, 'sshKey', inSshList)
          }
        } catch (error) {
          console.log('----watch cloudinit err', error)
        }
      }
    }
  }
};
