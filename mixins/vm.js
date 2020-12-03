import _ from 'lodash';
import randomstring from 'randomstring';
import { safeLoad, safeDump } from 'js-yaml';
import { sortBy } from '@/utils/sort';
import { allHash } from '@/utils/promise';
import { STORAGE_CLASS_LABEL, HARVESTER_CREATOR, HARVESTER_IMAGE_NAME, HARVESTER_DISK_NAMES } from '@/config/labels-annotations';
// import { formatSi, parseSi } from '@/utils/units';
import { SOURCE_TYPE } from '@/config/map';
import {
  NAMESPACE, PVC, VM_TEMPLATE, IMAGE, SSH, STORAGE_CLASS, NETWORK_ATTACHMENT, POD, VM, DATA_VOLUME
} from '@/config/types';

const TEMPORARY_VALUE = '$occupancy_url';
// const NETWROK_ANNOTATION = 'k8s.v1.cni.cncf.io/networks';
const MANAGEMENT_NETWORK = 'management Network';

const baseSpec = {
  dataVolumeTemplates: [],
  running:             true,
  template:            {
    metadata: {},
    spec:     {
      domain: {
        cpu: {
          cores:   null,
          sockets: 1,
          threads: 1
        },
        devices: {
          inputs: [{
            bus:  'usb',
            name: 'tablet',
            type: 'tablet'
          }],
          interfaces: [{
            masquerade: {},
            model:      'virtio',
            name:       'default'
          }],
          disks: [],
        },
        resources: { requests: { memory: null } }
      },
      hostname: '',
      networks: [{
        name: 'default',
        pod:  {}
      }],
      volumes: []
    }
  }
};

export default {
  inheritAttrs: false,

  props: {
    value: {
      type:    [Object],
      default: () => {
        return {};
      }
    },
  },

  async fetch() {
    await allHash({
      pods:               this.$store.dispatch('cluster/findAll', { type: POD }),
      ssh:                this.$store.dispatch('cluster/findAll', { type: SSH }),
      pvcs:               this.$store.dispatch('cluster/findAll', { type: PVC }),
      dataVolume:         this.$store.dispatch('cluster/findAll', { type: DATA_VOLUME }),
      image:              this.$store.dispatch('cluster/findAll', { type: IMAGE }),
      template:           this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.template }),
      storageClass:       this.$store.dispatch('cluster/findAll', { type: STORAGE_CLASS, opt: { url: `${ STORAGE_CLASS }es` } }),
      templateVersion:    this.$store.dispatch('cluster/findAll', { type: VM_TEMPLATE.version }),
      networkAttachment:  this.$store.dispatch('cluster/findAll', { type: NETWORK_ATTACHMENT, opt: { url: 'k8s.cni.cncf.io.network-attachment-definitions' } }),
    });
  },

  data() {
    const type = this.$route.params.resource;

    let pageType = '';
    let spec = null;

    if (type === VM) {
      pageType = 'vm';
    } else {
      pageType = 'template';
    }

    if (pageType === 'vm') {
      spec = this.value.spec;

      if ( !spec ) {
        spec = _.cloneDeep(baseSpec);
        this.value.spec = spec;
      }
    } else {
      spec = this.value?.spec?.vm;
    }
    if (!spec) {
      spec = _.cloneDeep(baseSpec);
      this.value.spec = {
        ...this.value.spec,
        vm: spec
      };
    }

    const sshKeyName = spec?.template?.metadata?.annotations?.['harvester.cattle.io/sshNames'] || '[]';
    const sshKey = JSON.parse(sshKeyName) || [];

    const hasCreateVolumes = [];

    spec?.template?.spec?.volumes?.map((V) => { // eslint-disable-line
      if (V?.dataVolume?.name) {
        hasCreateVolumes.push(V.dataVolume.name);
      }
    });

    let userScript = '';
    let networkScript = '';
    const volumes = spec.template?.spec?.volumes || [];

    volumes.forEach((v) => {
      if (v.cloudInitNoCloud) {
        userScript = v.cloudInitNoCloud.userData;
        networkScript = v.cloudInitNoCloud.networkData;
      }
    });

    const diskRows = this.getDiskRows(spec);
    const networkRows = this.getNetworkRows(spec);
    const imageName = this.getRootImage(spec);

    return {
      baseSpec,
      spec,
      sshName:               '',
      publicKey:             '',
      showCloudInit:         false,
      sshAuthorizedKeys:     '',
      useCustomHostname:     false,
      isUseMouseEnhancement:    true,
      hasCreateVolumes,
      networkScript,
      userScript,
      sshKey,
      pageType,
      imageName,
      diskRows,
      networkRows
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
  },

  methods: {
    getDiskRows(spec) {
      const _volumes = spec?.template?.spec?.volumes || [];
      const _dataVolumeTemplates = spec?.dataVolumeTemplates || [];
      const _disks = spec?.template?.spec?.domain?.devices?.disks || [];

      let out = [];

      if (_disks.length === 0) {
        out.push({
          source:           SOURCE_TYPE.IMAGE,
          name:             'disk-0',
          accessMode:       'ReadWriteOnce',
          bus:              'virtio',
          pvcNS:            '',
          volumeName:       '',
          size:             '10Gi',
          type:             'disk',
          // storageClassName: this.defaultStorageClass,
          storageClassName: 'longhorn',
          image:             this.imageName,
          volumeMode:       'Filesystem',
        });
      } else {
        out = _disks.map( (DISK, index) => {
          const volume = _volumes.find( V => V.name === DISK.name );

          let source = '';
          let volumeName = '';
          const pvcNS = '';
          let accessMode = '';
          let size = '';
          let volumeMode = '';
          let storageClassName = '';
          let image = '';
          let container = '';
          let realName = '';

          const type = DISK?.cdrom ? 'cd-rom' : 'disk';

          if (volume?.containerDisk) { // is SOURCE_TYPE.CONTAINER
            source = SOURCE_TYPE.CONTAINER;
            container = volume.containerDisk.image;
          }

          if (volume?.dataVolume && volume?.dataVolume?.name) {
            volumeName = volume.dataVolume.name;
            const DVT = _dataVolumeTemplates.find( T => T.metadata.name === volumeName);

            realName = volumeName;

            if (DVT) {
              if (DVT.spec?.source?.blank) {
                source = SOURCE_TYPE.NEW;
              } else if (DVT.spec?.source?.http) { // url may empty
                source = SOURCE_TYPE.IMAGE;
                const imageUrl = DVT.spec.source.http.url;

                image = this.getImageSource(imageUrl);
              }

              accessMode = DVT?.spec?.pvc?.accessModes?.[0];
              size = DVT?.spec?.pvc?.resources?.requests?.storage || '10Gi';
              volumeMode = DVT?.spec?.pvc?.volumeMode;
              storageClassName = DVT?.spec?.pvc?.storageClassName || this.defaultStorageClass;
            } else { // mayby is SOURCE_TYPE.ATTACH_VOLUME
              const choices = this.$store.getters['cluster/all'](DATA_VOLUME);
              const dvResource = choices.find( O => O.metadata.name === volume?.dataVolume?.name);

              source = SOURCE_TYPE.ATTACH_VOLUME;
              accessMode = dvResource?.spec?.pvc?.accessModes?.[0] || 'ReadWriteOnce';
              size = dvResource?.spec?.pvc?.resources?.requests?.storage || '10Gi';
              storageClassName = dvResource?.spec?.pvc?.storageClassName;
              volumeMode = dvResource?.spec?.pvc?.volumeMode || 'Filesystem';
              volumeName = dvResource?.metadata?.name || '';
            }
          }

          const bus = DISK?.disk?.bus || DISK?.cdrom?.bus;

          const bootOrder = DISK?.bootOrder;

          return {
            bootOrder,
            source,
            name:          DISK.name,
            realName,
            bus,
            volumeName,
            pvcNS,
            container,
            accessMode,
            size,
            volumeMode:    volumeMode || 'Filesystem',
            image,
            type,
            storageClassName,
          };
        });
      }

      return out.filter( (O) => {
        return O.name !== 'cloudinitdisk';
      });
    },
    getNetworkRows(spec) {
      const networks = spec?.template?.spec?.networks || [];
      const interfaces = spec?.template?.spec?.domain?.devices?.interfaces || [];
      // const templateAnnotations = spec?.template?.metadata?.annotations;
      // let networkAnnotition = [];

      // if (templateAnnotations?.[NETWROK_ANNOTATION]) {
      //   networkAnnotition = JSON.parse(templateAnnotations?.[NETWROK_ANNOTATION]);
      // }

      const out = interfaces.map( (O, index) => {
        const network = networks.find( (N) => {
          return O.name === N.name;
        });

        // const netwrokAnnotation = networkAnnotition.find((N) => {
        //   return network?.multus?.networkName === N.name;
        // });
        const type = O.sriov ? 'sriov' : O.bridge ? 'bridge' : 'masquerade';
        const isPod = !!network?.pod;

        return {
          ...O,
          type,
          model:        O.model || 'virtio',
          networkName:  network?.multus?.networkName || MANAGEMENT_NETWORK,
          index,
          // isIpamStatic: !!netwrokAnnotation,
          // cidr:         netwrokAnnotation?.ips || '',
          isPod
        };
      });

      return out;
    },

    getRootImage(spec) {
      const _dataVolumeTemplates = spec?.dataVolumeTemplates || [];
      const imageUrl = _dataVolumeTemplates?.[0]?.spec?.source?.http?.url || '';

      return this.getImageSource(imageUrl);
    },

    getCloudInit() {
      let out = this.userScript;

      try {
        let newInitScript = {};

        if (out) {
          newInitScript = safeLoad(out);
        }

        // eslint-disable-next-line camelcase
        if (newInitScript?.ssh_authorized_keys) {
          const sshList = [...this.getSSHListValue(this.sshKey), ...newInitScript.ssh_authorized_keys];
          const value = new Set(sshList);

          newInitScript.ssh_authorized_keys = [...value];
        } else {
          newInitScript.ssh_authorized_keys = this.getSSHListValue(this.sshKey);
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
      const images = this.$store.getters['cluster/all'](IMAGE);
      const image = images.find( I => url === I?.status?.downloadUrl);

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
        dataVolumeName = R.volumeName || R.name;
      }

      const _volume = { name: R.name };

      if (R.source === SOURCE_TYPE.CONTAINER) {
        _volume.containerDisk = { image: R.container };
      } else if (R.source === SOURCE_TYPE.IMAGE || R.source === SOURCE_TYPE.NEW || R.source === SOURCE_TYPE.ATTACH_VOLUME) {
        _volume.dataVolume = { name: dataVolumeName };
      } else if (isCloudInitDisk) {
        // cloudInitNoCloud
      }

      return _volume;
    },

    parseDateVolumeTemplate(R, dataVolumeName) {
      const accessModel = R.accessMode;

      if (!String(R.size).includes('Gi')) {
        R.size = `${ R.size }Gi`;
      }

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
      case SOURCE_TYPE.NEW:
        _dataVolumeTemplate.spec.pvc.storageClassName = 'longhorn'; // R.storageClassName
        _dataVolumeTemplate.spec.source = { blank: {} };
        break;
      case SOURCE_TYPE.IMAGE: {
        _dataVolumeTemplate.spec.pvc.storageClassName = 'longhorn'; // R.storageClassName
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
      const diskNameLables = [];

      disk.forEach( (R) => {
        const prefixName = this.value.metadata?.name || '';

        let dataVolumeName = '';

        if (!this.hasCreateVolumes.includes(R.realName)) {
          dataVolumeName = `${ prefixName }-${ R.name }-${ randomstring.generate(5).toLowerCase() }`;
        } else if (R.source === SOURCE_TYPE.ATTACH_VOLUME) {
          dataVolumeName = R.volumeName;
        } else {
          dataVolumeName = R.realName;
        }

        const _disk = this.parseDisk(R);
        const _volume = this.parseVolume(R, dataVolumeName);
        const _dataVolumeTemplate = this.parseDateVolumeTemplate(R, dataVolumeName);

        diskNameLables.push(dataVolumeName);
        disks.push(_disk);
        volumes.push(_volume);

        if (R.source !== SOURCE_TYPE.CONTAINER && R.source !== SOURCE_TYPE.ATTACH_VOLUME) {
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
            ...this.spec?.template?.metadata,
            annotations: { ...this.spec?.template?.metadata?.annotations },
            labels:      {
              ...this.spec?.template?.metadata?.labels,
              [HARVESTER_CREATOR]:     'harvester',
              [HARVESTER_IMAGE_NAME]:  this.value?.metadata?.name,
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

      if (this.pageType === 'vm' && this.value?.metadata?.name) {
        Object.assign(spec.template.metadata.annotations, { [HARVESTER_DISK_NAMES]: JSON.stringify(diskNameLables) });
      }

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
      };
    },

    parseNetworkRows(networkRow) {
      const interfaces = [];
      const networks = [];
      // const templateNetworkAnnotation = [];

      networkRow.forEach( (R) => {
        const _interface = this.parseInterface(R);
        const _network = this.parseNetwork(R);

        // if (R.isIpamStatic) {
        //   const _templateNetwrokAnnotation = this.parseTemplateNetworkAnnotation(R);

        //   templateNetworkAnnotation.push(_templateNetwrokAnnotation);
        // }

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

      if (!this.spec?.template?.metadata?.annotations) {
        this.$set(this.spec.template.metadata, 'annotations', {});
      }

      // if (this.pageType === 'vm') {
      //   Object.assign(this.spec.template.metadata.annotations, { [NETWROK_ANNOTATION]: JSON.stringify(templateNetworkAnnotation) });
      // }

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
    }
  }
};
