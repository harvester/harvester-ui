import { CATTLE_API_GROUP, SUBTYPE_MAPPING } from '@/models/management.cattle.io.roletemplate';
import { uniq } from '@/utils/array';
import { HARVESTER_ROLE_BUILTIN, HARVESTER_ROLE_DISPLAY_NAME, HARVESTER_ROLE_CONTEXT } from '@/config/labels-annotations';
import Role from './rbac.authorization.k8s.io.role';

export default {
  ...Role,

  subtype() {
    return SUBTYPE_MAPPING.RBAC_CLUSTER_ROLE.key;
  },

  namespaceResources() {
    return this.allResources.filter(r => r.attributes.namespaced && !r.attributes.group.includes(CATTLE_API_GROUP));
  },

  resources() {
    return uniq(this.namespaceResources.map(r => r.attributes?.kind)).sort();
  },

  builtin() {
    return this.getLabelValue(HARVESTER_ROLE_BUILTIN) === 'true';
  },

  displayName() {
    return this.getAnnotationValue(HARVESTER_ROLE_DISPLAY_NAME) || this?.metadata?.name;
  },

  clusterRole() {
    return this.getLabelValue(HARVESTER_ROLE_CONTEXT) === 'cluster';
  },

  namespaceRole() {
    return this.getLabelValue(HARVESTER_ROLE_CONTEXT) === 'namespace';
  },

  isOwner() {
    return this.id === 'harvester-namespace-owner';
  },

  isMember() {
    return this.id === 'harvester-namespace-member';
  },

  isReadOnly() {
    return this.id === 'harvester-read-only';
  }
};
