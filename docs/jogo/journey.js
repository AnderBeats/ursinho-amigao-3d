const Journey = (() => {
    const texts = {
        pt: {goal:'SEU OBJETIVO',subject:'Matéria',play:'▶ Jogar',home:'Voltar ao início',newTitle:'Começar uma nova campanha?',newBody:'Seu progresso, matérias liberadas e diplomas salvos no jogo serão apagados. A nova campanha começa na 1ª série. As imagens já salvas na galeria permanecem.',cancel:'Cancelar',confirm:'Apagar progresso e começar',complete:'Parabéns! Você completou o jogo!',congratulation:'Você completou todas as fases e ajudou o Ursinho Amigão e sua turma a passarem de ano! Agora é hora de celebrar!',storage:'Não foi possível apagar o progresso. Tente novamente antes de iniciar uma nova campanha.'},
        en: {goal:'YOUR GOAL',subject:'Subject',play:'▶ Play',home:'Back to start',newTitle:'Start a new campaign?',newBody:'Your game progress, unlocked subjects and saved diplomas will be erased. The new campaign starts in Grade 1. Images already saved to your gallery remain.',cancel:'Cancel',confirm:'Erase progress and start',complete:'Congratulations! You completed the game!',congratulation:'You completed every stage and helped Ursinho Amigão and friends pass the school year! Now it is time to celebrate!',storage:'Your progress could not be erased. Please try again before starting a new campaign.'},
        es: {goal:'TU OBJETIVO',subject:'Materia',play:'▶ Jugar',home:'Volver al inicio',newTitle:'¿Empezar una campaña nueva?',newBody:'Se borrarán el progreso, las materias desbloqueadas y los diplomas guardados en el juego. La nueva campaña comienza en el primer grado. Las imágenes guardadas en la galería permanecerán.',cancel:'Cancelar',confirm:'Borrar progreso y empezar',complete:'¡Felicidades! ¡Completaste el juego!',congratulation:'¡Completaste todas las fases y ayudaste a Ursinho Amigão y su pandilla a pasar de año! ¡Ahora es hora de celebrar!',storage:'No se pudo borrar el progreso. Inténtalo de nuevo antes de empezar una campaña nueva.'}
    };
    const objectives = {
        pt: ['Encontre as três pedras e a chave. Depois, encoste no baú para abri-lo.','Pegue um ticket e depois o sorvete do sabor indicado. Repita até completar os quatro pares!','Recolha os troféus, as bolas e as pipas. Siga os objetivos destacados até completar a brincadeira.','Encontre os tubos de ensaio, os ímãs e os microscópios para completar a descoberta.','Reúna os elefantes, leões e aves. Depois, escolha o habitat certo para cada animal.','Recolha as pinturas, esculturas e fósseis. Depois, escolha a descrição correta de cada peça.','Recolha as cestas de piquenique, as bolas e os brinquedos do parque.','Reúna os livros. Depois, organize a história: plantar, regar e ver a flor crescer.','Ative a lixeira indicada e recolha três itens do material correspondente. Repita com as outras lixeiras.','Encontre as plantas nativas, animais selvagens e telescópios.','Recolha os pincéis, tintas e argila. Depois, complete a sequência de formas.','Recolha os instrumentos. Depois, toque as três notas na ordem indicada para compor sua melodia.'],
        en: ['Find the three stones and the key. Then touch the chest to open it.','Collect one ticket, then the ice cream with the indicated flavor. Complete all four pairs!','Collect the trophies, balls and kites. Follow the highlighted goals to finish.','Find the test tubes, magnets and microscopes to complete your discovery.','Collect the elephants, lions and birds. Then choose the right habitat for each animal.','Collect paintings, sculptures and fossils. Then choose the correct description for each exhibit.','Collect the picnic baskets, balls and playground toys.','Collect the books. Then put the story in order: plant, water and watch the flower grow.','Activate the indicated bin and collect three items of the matching material. Repeat with the other bins.','Find the native plants, wild animals and telescopes.','Collect the brushes, paints and clay. Then finish the shape pattern.','Collect the instruments. Then play the three notes in the indicated order to compose your melody.'],
        es: ['Encuentra las tres piedras y la llave. Después, toca el cofre para abrirlo.','Recoge un vale y después el helado del sabor indicado. ¡Completa las cuatro parejas!','Recoge los trofeos, las pelotas y las cometas. Sigue los objetivos destacados hasta terminar.','Encuentra los tubos de ensayo, imanes y microscopios para completar el descubrimiento.','Reúne los elefantes, leones y aves. Después, elige el hábitat correcto de cada animal.','Recoge pinturas, esculturas y fósiles. Después, elige la descripción correcta de cada pieza.','Recoge las cestas de pícnic, pelotas y juguetes del parque.','Reúne los libros. Después, ordena la historia: plantar, regar y ver crecer la flor.','Activa el contenedor indicado y recoge tres objetos del material correspondiente. Repite con los otros contenedores.','Encuentra las plantas nativas, animales salvajes y telescopios.','Recoge pinceles, pinturas y arcilla. Después, completa la secuencia de formas.','Recoge los instrumentos. Después, toca las tres notas en el orden indicado para componer tu melodía.']
    };
    const icons=['🔑 📦','🎟️ 🍦','⚽ 🪁','🧪 🧲','🐘 🦁','🎨 🗿','🧺 ⚽','📚 🌱','♻️','🌳 🔭','🖌️ 🔺','🎹 🎵'];
    const copy = lang => texts[lang] || texts.en;
    let active = null;
    function modal({heading,body,eyebrow='',icon='',label='',accept,cancel}) {
        if(active) return Promise.resolve(false);
        return new Promise(resolve=>{
            const dialog=document.createElement('dialog');dialog.className='journey-dialog';active=dialog;
            const previous=document.activeElement;
            const add=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;dialog.append(e);return e;};
            if(eyebrow)add('p',eyebrow,'journey-eyebrow');
            const title=add('h2',heading);title.id='journey-title';dialog.setAttribute('aria-labelledby',title.id);
            if(icon)add('div',icon,'journey-icons').setAttribute('aria-hidden','true');
            if(label)add('p',label,'journey-label');
            const description=add('p',body,'journey-description');description.id='journey-description';dialog.setAttribute('aria-describedby',description.id);
            const yes=add('button',accept,'journey-accept');yes.type='button';
            yes.onclick=()=>dialog.close('accept');
            let no;if(cancel){no=add('button',cancel,'journey-cancel');no.type='button';no.onclick=()=>dialog.close('cancel');}
            dialog.addEventListener('close',()=>{const accepted=dialog.returnValue==='accept';active=null;dialog.remove();previous?.focus?.();resolve(accepted);},{once:true});
            document.body.append(dialog);dialog.showModal();(no||yes).focus();
        });
    }
    return {copy,objectives,
        objective(lang,series,phase,heading){const c=copy(lang);const grade=lang==='pt'?series+'ª série':lang==='es'?series+'.º grado':'Grade '+series;return modal({heading,eyebrow:grade+' · '+c.subject+' '+phase,icon:icons[phase-1],label:c.goal,body:(objectives[lang]||objectives.en)[phase-1],accept:c.play});},
        confirmNew(lang){const c=copy(lang);return modal({heading:c.newTitle,body:c.newBody,icon:'🎒',accept:c.confirm,cancel:c.cancel});},
        storageError(lang){const c=copy(lang);return modal({heading:c.storage,body:'',accept:c.cancel});},
        vacationAlt(lang,series){return ({pt:['A turma em um piquenique no parque','A turma acampando sob as estrelas','A turma construindo um castelo de areia na praia'],en:['The friends at a park picnic','The friends camping under the stars','The friends building a sandcastle at the beach'],es:['La pandilla de pícnic en el parque','La pandilla acampando bajo las estrellas','La pandilla construyendo un castillo de arena en la playa']}[lang]||[])[series-1]||'Vacation';}
    };
})();

