// User-initiated exports only. Never reads existing photos or sends files to a server.
const ImageActions = (() => {
    const messages = {
        pt: {save:'Salvar imagem',share:'Compartilhar',pack:'Baixar cartilha completa (ZIP)',busy:'Preparando…',saved:'Imagem salva na galeria!',fileSaved:'Arquivo salvo!',download:'Download solicitado. Confira os downloads do navegador.',shared:'Opções de compartilhamento abertas.',cancel:'Operação cancelada.',error:'Não foi possível concluir. Tente novamente.',unsupported:'Compartilhamento indisponível neste navegador. Use Salvar imagem.',ios:'No iOS, abra a imagem e mantenha o dedo sobre ela para salvar em Fotos.',open:'Abrir imagem para salvar',next:'Continuar a aventura'},
        en: {save:'Save image',share:'Share',pack:'Download full coloring pack (ZIP)',busy:'Preparing…',saved:'Image saved to your photo library!',fileSaved:'File saved!',download:'Download requested. Check your browser downloads.',shared:'Sharing options opened.',cancel:'Operation cancelled.',error:'Unable to finish. Please try again.',unsupported:'Sharing is unavailable in this browser. Use Save image.',ios:'On iOS, open the image and touch and hold it to save to Photos.',open:'Open image to save',next:'Continue the adventure'},
        es: {save:'Guardar imagen',share:'Compartir',pack:'Descargar cuaderno completo (ZIP)',busy:'Preparando…',saved:'¡Imagen guardada en la galería!',fileSaved:'¡Archivo guardado!',download:'Descarga solicitada. Revisa las descargas del navegador.',shared:'Opciones para compartir abiertas.',cancel:'Operación cancelada.',error:'No se pudo completar. Inténtalo de nuevo.',unsupported:'Este navegador no permite compartir. Usa Guardar imagen.',ios:'En iOS, abre la imagen y mantenla pulsada para guardarla en Fotos.',open:'Abrir imagen para guardar',next:'Continuar la aventura'}
    };
    const pending = new Map();
    window.ursinhoExportResult = (id, result) => {
        const done = pending.get(id);
        if (done) { pending.delete(id); done(result); }
    };
    function nativeExport(action, source, filename) {
        return new Promise((resolve, reject) => {
            const id = 'export-' + Date.now() + '-' + Math.random().toString(36).slice(2);
            pending.set(id, resolve);
            try { window.UrsinhoAndroid.exportFile(action, source, filename, id); }
            catch (error) { pending.delete(id); reject(error); }
        });
    }
    function dataBlob(source) {
        const [header, data] = source.split(',');
        const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
        return new Blob([bytes], {type: header.slice(5).split(';')[0]});
    }
    function controls(sourceOrFactory, filename, lang, pack = false) {
        const text = messages[lang] || messages.en;
        const box = document.createElement('div');
        box.className = 'image-export-actions';
        const save = document.createElement('button');
        save.type = 'button'; save.className = 'sequence-action'; save.textContent = pack ? text.pack : text.save;
        const share = document.createElement('button');
        share.type = 'button'; share.className = 'sequence-action image-export-share'; share.textContent = text.share;
        const status = document.createElement('p');
        status.className = 'image-export-status'; status.setAttribute('role','status');
        box.append(save); if (!pack) box.append(share); box.append(status);
        const native = typeof window.UrsinhoAndroid?.exportFile === 'function';
        let file, source, prepared;
        const prepare = () => {
            if (prepared) return prepared;
            source = typeof sourceOrFactory === 'function' ? sourceOrFactory() : sourceOrFactory;
            if (native) return prepared = Promise.resolve();
            prepared = (source.startsWith('data:') ? Promise.resolve(dataBlob(source)) : fetch(source).then(r => {if(!r.ok)throw Error('asset'); return r.blob();}))
                .then(blob => {file = new File([blob], filename, {type:blob.type});});
            return prepared;
        };
        // Preload files so the Share call retains the user's click activation.
        save.disabled = share.disabled = true;
        Promise.resolve().then(prepare).then(() => { save.disabled = share.disabled = false; }).catch(() => {
            status.textContent = text.error; prepared = null; save.disabled = share.disabled = false;
        });
        async function act(action) {
            if (save.disabled) return;
            save.disabled = share.disabled = true;
            status.textContent = text.busy;
            try {
                if (!prepared || (!native && !file)) {
                    await prepare();
                    if (action === 'share') { status.textContent = ({pt:'Arquivo pronto. Toque em Compartilhar novamente.',en:'File ready. Tap Share again.',es:'Archivo listo. Toca Compartir de nuevo.'})[lang] || 'File ready. Tap Share again.'; return; }
                }
                if (native) {
                    const result = await nativeExport(action, source, filename);
                    status.textContent = ({saved:text.saved,fileSaved:text.fileSaved,shared:text.shared,cancel:text.cancel,error:text.error})[result] || text.error;
                } else if (action === 'share') {
                    if (navigator.canShare?.({files:[file]}) && navigator.share) {
                        await navigator.share({files:[file]}); status.textContent = text.shared;
                    } else status.textContent = text.unsupported;
                } else {
                    const url = URL.createObjectURL(file);
                    const link = document.createElement('a');
                    link.href = url; link.download = filename; link.dataset.exportManaged = 'true';
                    document.body.append(link); link.click(); link.remove();
                    status.textContent = text.download;
                    if (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
                        status.textContent += ' ' + text.ios;
                        const open = document.createElement('a'); open.href=url; open.target='_blank'; open.rel='noopener'; open.textContent=text.open;
                        status.append(document.createElement('br'),open);
                    }
                    setTimeout(() => URL.revokeObjectURL(url), 300000);
                }
            } catch (error) { status.textContent = error.name === 'AbortError' ? text.cancel : text.error; }
            finally { save.disabled = share.disabled = false; }
        }
        save.addEventListener('click', () => act('save'));
        share.addEventListener('click', () => act('share'));
        return box;
    }
    return {controls, messages};
})();
