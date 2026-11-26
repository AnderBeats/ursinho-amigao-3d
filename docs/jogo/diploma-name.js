// Local, optional diploma personalization. Never stored or transmitted.
function askDiplomaName(language) {
    const copy = {
        pt: ['Seu diploma está chegando!', 'Qual primeiro nome você quer no diploma?', 'Opcional. Você também pode continuar sem nome.', 'Primeiro nome', 'Criar diploma', 'Continuar sem nome'],
        en: ['Your diploma is ready!', 'What first name would you like on your diploma?', 'Optional. You can also continue without a name.', 'First name', 'Create diploma', 'Continue without a name'],
        es: ['¡Tu diploma está listo!', '¿Qué nombre quieres en tu diploma?', 'Opcional. También puedes continuar sin nombre.', 'Nombre', 'Crear diploma', 'Continuar sin nombre']
    }[language] || ['Your diploma is ready!', 'What first name would you like on your diploma?', 'Optional.', 'First name', 'Create diploma', 'Continue without a name'];
    return new Promise(resolve => {
        const previousFocus = document.activeElement;
        const dialog = document.createElement('dialog');
        dialog.className = 'diploma-name-dialog';
        dialog.setAttribute('aria-labelledby', 'diploma-name-title');
        dialog.setAttribute('aria-describedby', 'diploma-name-help');
        const form = document.createElement('form');
        const title = document.createElement('h2');
        title.id = 'diploma-name-title';
        title.textContent = '🎓 ' + copy[0];
        const label = document.createElement('label');
        label.htmlFor = 'diploma-first-name';
        label.textContent = copy[1];
        const help = document.createElement('p');
        help.id = 'diploma-name-help';
        help.textContent = copy[2];
        const input = document.createElement('input');
        input.id = 'diploma-first-name';
        input.type = 'text';
        input.maxLength = 30;
        input.placeholder = copy[3];
        input.autocomplete = 'off';
        input.setAttribute('autocapitalize', 'words');
        input.enterKeyHint = 'done';
        const actions = document.createElement('div');
        actions.className = 'diploma-name-actions';
        const create = document.createElement('button');
        create.type = 'submit';
        create.textContent = copy[4];
        const skip = document.createElement('button');
        skip.type = 'button';
        skip.className = 'diploma-name-skip';
        skip.textContent = copy[5];
        let settled = false;
        const finish = value => {
            if (settled) return;
            settled = true;
            const name = value.trim().split(/\s+/)[0].slice(0, 30);
            dialog.close();
            dialog.remove();
            if (previousFocus?.isConnected) previousFocus.focus();
            resolve(name);
        };
        form.addEventListener('submit', event => {
            event.preventDefault();
            finish(input.value);
        });
        skip.addEventListener('click', () => finish(''));
        dialog.addEventListener('cancel', event => {
            event.preventDefault();
            finish('');
        });
        dialog.addEventListener('close', () => finish(''));
        // Keep game keyboard shortcuts from receiving typing or Enter.
        for (const type of ['keydown', 'keyup']) dialog.addEventListener(type, event => event.stopPropagation());
        actions.append(create, skip);
        form.append(title, label, help, input, actions);
        dialog.append(form);
        document.body.append(dialog);
        dialog.showModal();
        // Focus the action first so the mobile keyboard opens only on request.
        create.focus();
    });
}
