<script>
import { NAME as VIRTUAL } from '@/config/product/virtual';
const VIRTUAL_MACHINE = 'kubevirt.io.virtualmachine';

export default {
  layout: 'plain',

  middleware({ redirect, route } ) {
    return redirect({
      name:   'c-cluster-product-resource',
      params: {
        ...route.params,
        product:  VIRTUAL,
        resource: VIRTUAL_MACHINE
      }
    });
  }
};
</script>
