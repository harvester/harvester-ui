export function options(pl) {
  if ( pl !== 'rancher' ) {
    return {};
  }

  return {
    'footer.docs':   'https://github.com/rancher/harvester/tree/master/docs',
    'footer.forums': 'https://forums.rancher.com/',
    'footer.slack':  'https://slack.rancher.io',
    'footer.issue':  'https://github.com/rancher/harvester/issues/new/choose',
  };
}
