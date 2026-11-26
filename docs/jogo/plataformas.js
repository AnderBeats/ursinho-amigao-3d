function configurePlatforms() {
    const svg = (body) => '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">' + body + '</svg>';
    const arrows = {
      btnUp: ['Cima', '12,5 21,19 3,19'],
      btnDown: ['Baixo', '3,5 21,5 12,19'],
      btnLeft: ['Esquerda', '5,12 19,3 19,21'],
      btnRight: ['Direita', '5,3 19,12 5,21']
    };
    Object.keys(arrows).forEach(id => {
      const button = document.getElementById(id);
      if (!button) return;
      button.innerHTML = svg('<polygon points="' + arrows[id][1] + '"/>');
      button.setAttribute('aria-label', arrows[id][0]);
    });
    const sound = document.getElementById('soundControlBtn');
    if (sound) sound.innerHTML = '<svg id="soundOnIcon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/></svg><svg id="soundOffIcon" style="display:none" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="m17 9 5 6m0-6-5 6"/></svg>';

    const native = window.ursinhoNative === true || location.hostname === 'appassets.androidplatform.net';
    const expand = document.getElementById('expandGame');
    if (native && expand) expand.hidden = true;
    // Preserve the existing mute settings when replacing the SVGs.
    const on = document.getElementById('soundOnIcon'), off = document.getElementById('soundOffIcon');
    const muted = Number(document.getElementById('musicLevel')?.value) === 0 && Number(document.getElementById('effectsLevel')?.value) === 0;
    if (on && off) { on.style.display = muted ? 'none' : ''; off.style.display = muted ? '' : 'none'; }
    for (const [id,key] of Object.entries({btnUp:'w',btnDown:'s',btnLeft:'a',btnRight:'d'})) {
      document.getElementById(id)?.addEventListener('touchcancel', () => document.dispatchEvent(new KeyboardEvent('keyup',{key})));
    }
    // Native Android shares user-requested downloads from local resources only.
    const shareDownload = link => {
      if (link.dataset.exportManaged || !window.UrsinhoAndroid || !link.hasAttribute('download')) return false;
      const url = new URL(link.href, location.href), name = link.download || 'arquivo';
      if (url.origin === location.origin && url.hostname === 'appassets.androidplatform.net') {
        window.UrsinhoAndroid.shareAsset(url.pathname, name);
        return true;
      }
      if (url.protocol !== 'data:' && url.protocol !== 'blob:') return false;
      if (url.protocol === 'data:' && url.href.length > 12 * 1024 * 1024) return true;
      (async () => {
        try {
          const response = await fetch(url.href);
          const blob = await response.blob();
          if (blob.size > 8 * 1024 * 1024) throw new Error('size');
          const reader = new FileReader();
          reader.onload = () => window.UrsinhoAndroid.shareData(String(reader.result), name);
          reader.readAsDataURL(blob);
        } catch { window.alert('Não foi possível preparar o arquivo. Tente novamente.'); }
      })();
      return true;
    };
    if (window.UrsinhoAndroid) {
      // Some game exports click detached anchors, which do not bubble to document.
      const originalClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        if (!shareDownload(this)) originalClick.call(this);
      };
      document.addEventListener('click', event => {
        const link = event.target instanceof Element ? event.target.closest('a[download]') : null;
        if (link && shareDownload(link)) event.preventDefault();
      }, true);
    }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',configurePlatforms,{once:true});
else configurePlatforms();
