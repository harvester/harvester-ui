export function options(pl) {
  if ( pl !== 'rancher' ) {
    return {};
  }

  return {
    'footer.docs':   'https://docs.harvesterhci.io/',
    'footer.forums': 'https://forums.rancher.com/',
    'footer.slack':  'https://slack.rancher.io',
    'footer.issue':  'https://github.com/harvester/harvester/issues/new/choose',
  };
}
