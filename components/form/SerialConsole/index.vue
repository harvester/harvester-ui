<script>
import { allHash } from '@/utils/promise';
import { addParams } from '@/utils/url';
import { base64Decode, base64Encode } from '@/utils/crypto';
import Select from '@/components/form/Select';

import Socket, {
  EVENT_CONNECTED,
  EVENT_CONNECTING,
  EVENT_DISCONNECTED,
  EVENT_MESSAGE,
  //  EVENT_FRAME_TIMEOUT,
  EVENT_CONNECT_ERROR,
} from '@/utils/socket';

const DEFAULT_COMMAND = ['/bin/sh', '-c', 'TERM=xterm-256color; export TERM; [ -x /bin/bash ] && ([ -x /usr/bin/script ] && /usr/bin/script -q -c "/bin/bash" /dev/null || exec /bin/bash) || exec /bin/sh'];

export default {
  props:      {
    value: {
      type:     Object,
      required: true,
    },
    show: {
      type:    Boolean,
      default: false,
    }
  },

  data() {
    return {
      socket:      null,
      terminal:    null,
      fitAddon:    null,
      searchAddon: null,
      isOpen:      false,
      isOpening:   false,
      backlog:     []
    };
  },

  computed: {
    xtermConfig() {
      return {
        cursorBlink:  true,
        useStyle:     true,
        fontSize:     12,
      };
    },
  },

  beforeDestroy() {
    if ( this.socket ) {
      this.socket.disconnect();
    }

    if ( this.terminal ) {
      this.terminal.dispose();
    }
  },

  async mounted() {
    await this.setupTerminal();
    await this.connect();
  },

  methods: {
    async setupTerminal() {
      const docStyle = getComputedStyle(document.querySelector('body'));
      const xterm = await import(/* webpackChunkName: "xterm" */ 'xterm');

      const addons = await allHash({
        fit:      import(/* webpackChunkName: "xterm" */ 'xterm-addon-fit'),
        webgl:    import(/* webpackChunkName: "xterm" */ 'xterm-addon-webgl'),
        weblinks: import(/* webpackChunkName: "xterm" */ 'xterm-addon-web-links'),
        search:   import(/* webpackChunkName: "xterm" */ 'xterm-addon-search'),
      });

      const terminal = new xterm.Terminal({
        theme: {
          background: docStyle.getPropertyValue('--terminal-bg').trim(),
          cursor:     docStyle.getPropertyValue('--terminal-cursor').trim(),
          foreground: docStyle.getPropertyValue('--terminal-text').trim()
        },
        ...this.xtermConfig,
      });

      this.fitAddon = new addons.fit.FitAddon();
      this.searchAddon = new addons.search.SearchAddon();

      terminal.loadAddon(this.fitAddon);
      terminal.loadAddon(this.searchAddon);
      terminal.loadAddon(new addons.weblinks.WebLinksAddon());
      terminal.open(this.$refs.xterm);
      terminal.loadAddon(new addons.webgl.WebglAddon());

      this.fit();
      this.flush();

      terminal.onData((input) => {
        const msg = this.str2ab(input);

        this.write(msg);
      });

      this.terminal = terminal;
    },

    str2ab(str) {
      const enc = new TextEncoder();

      return enc.encode(str);
    },

    write(msg) {
      if ( this.isOpen ) {
        this.socket.send(msg);
      } else {
        this.backlog.push(msg);
      }
    },

    clear() {
      this.terminal.clear();
    },

    getSocketUrl() {
      const isDev = process.env.dev;

      const ip = !isDev ? `` : `wss://${ process.env.api.split('//')[1] }`;

      return `${ ip }${ this.value?.getSerialConsolePath }`;
    },

    async connect() {
      if ( this.socket ) {
        await this.socket.disconnect();
        this.socket = null;
        this.terminal.reset();
      }

      const url = this.getSocketUrl();

      if ( !url ) {
        return;
      }

      this.socket = new Socket(url);

      this.socket.addEventListener(EVENT_CONNECTING, (e) => {
        this.isOpen = false;
        this.isOpening = true;
      });

      this.socket.addEventListener(EVENT_CONNECT_ERROR, (e) => {
        this.isOpen = false;
        this.isOpening = false;
        console.error('Connect Error', e); // eslint-disable-line no-console
      });

      this.socket.addEventListener(EVENT_CONNECTED, (e) => {
        this.isOpen = true;
        this.isOpening = false;
        if (this.show) {
          this.fit();
          this.flush();
        }
      });

      this.socket.addEventListener(EVENT_DISCONNECTED, (e) => {
        this.isOpen = false;
        this.isOpening = false;
        this.$emit('close');
      });

      this.socket.addEventListener(EVENT_MESSAGE, async(e) => {
        const msg = await e.detail.data.text();

        this.terminal.write(msg);
      });

      this.socket.connect();
      this.terminal.focus();
    },

    flush() {
      const backlog = this.backlog.slice();

      this.backlog = [];

      for ( const data of backlog ) {
        this.socket.send(data);
      }
    },

    fit(arg) {
      this.fitAddon.fit();

      const { rows, cols } = this.fitAddon.proposeDimensions();

      if ( !this.isOpen ) {
        return;
      }

      const message = JSON.stringify({
        Width:  cols,
        Height: rows
      });

      // this.socket.send(this.str2ab(message));
    },
  }
};
</script>

<template>
  <div>
    <div class="shell-container" :class="{'open': isOpen, 'closed': !isOpen}">
      <div ref="xterm" class="shell-body" />
      <resize-observer @notify="fit" />
    </div>
  </div>
</template>

<style lang="scss">
  @import '@/node_modules/xterm/css/xterm.css';

  .shell-container {
    height: 100%;
    overflow: hidden;
  }

  .shell-body {
    padding: calc( 2 * var(--outline-width) );
    height: 100%;

    & > .terminal.focus {
      outline: var(--outline-width) solid var(--outline);
    }
  }
</style>
