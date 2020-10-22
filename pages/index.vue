<script>
export default {
  middleware({ redirect } ) {
    // return redirect({ name: 'clusters' });
    return redirect('/c/local');
  }
};
</script>
