<script>
import { NAME as VIRTUAL } from '@/config/product/virtual';

export default {
  layout: 'plain',

  middleware({ redirect, route } ) {
    return redirect({
      name:   'c-cluster-product',
      params: {
        ...route.params,
        product: VIRTUAL,
      }
    });
  }
};
</script>
