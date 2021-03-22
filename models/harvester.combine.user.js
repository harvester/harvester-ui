// import { MANAGEMENT, HARVESTER_USER } from '@/config/types';
// import { AS, _YAML, MODE, _EDIT } from '@/config/query-params';

export function copyResourceValues(from, to) {
  to.username = from.username;
  to.metadata = from.metadata;
}

export default {
  canCustomEdit() {
    return true;
  },

  // goToEditYaml() {
  //   const isRancher = this.$store.getters['auth/isRancher'];
  //   const detailLocation = this.detailLocation;

  //   if (isRancher) {
  //     detailLocation.params.resource = MANAGEMENT.USER;
  //   } else {
  //     detailLocation.params.resource = HARVESTER_USER;
  //   }

  //   return () => {
  //     const location = detailLocation;

  //     location.query = {
  //       ...location.query,
  //       [MODE]: _EDIT,
  //       [AS]:   _YAML
  //     };

  //     this.currentRouter().push(location);
  //   };
  // },
};
