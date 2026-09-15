const modalRoot=document.getElementById("modalRoot");
const toastRoot=document.getElementById("toastRoot");
const app=document.getElementById("app");
const screen=document.getElementById("screen");
const statusText=document.getElementById("statusText");
const shutdownBtn=document.getElementById("shutdownBtn");

const state={discovered:new Set(),attempts:0,terms:false,shutdown:false};

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function toast(t){const x=document.createElement("div");x.className="toast";x.textContent=t;toastRoot.appendChild(x);setTimeout(()=>x.remove(),2600)}
function achieve(title,desc){
  if(state.discovered.has(title))return;
  state.discovered.add(title);
  const x=document.createElement("div");x.className="achievement";
  x.innerHTML=`<b>🏆 ${title}</b><p>${desc}</p>`;
  document.getElementById("achievements").appendChild(x);
  setTimeout(()=>x.remove(),4200);
}
function modal({title,sub="",body="",actions="",small=false}){
  modalRoot.innerHTML=`<div class="modal-backdrop"><section class="modal ${small?"small":""}">
    <header class="modal-head"><h2>${title}</h2><p>${sub}</p></header>
    <div class="modal-body">${body}</div><footer class="modal-actions">${actions}</footer>
  </section></div>`;
  return modalRoot.querySelector(".modal");
}
function closeModal(){modalRoot.innerHTML=""}
function count(){state.attempts++;statusText.textContent=`Computador ligado · ${state.attempts} tentativa${state.attempts===1?"":"s"}`}

shutdownBtn.addEventListener("click",confirmShutdown);

function confirmShutdown(){
  modal({
    title:"Tem certeza disso?",
    sub:"Desligar o computador é uma operação permanente.",
    body:`<p style="color:#aaa;font-size:13px;line-height:1.7">Para continuar, você deve ler e aceitar integralmente os Termos e Condições de Desligamento Computacional.</p>
    <button class="btn" id="readTerms">Ler termos</button>`,
    actions:`<button class="btn" id="cancel">Cancelar</button><button class="btn primary" id="continue" disabled>Continuar</button>`,
    small:true
  });
  modalRoot.querySelector("#cancel").onclick=closeModal;
  modalRoot.querySelector("#readTerms").onclick=showTerms;
}
function showTerms(){
  const paragraphs=Array.from({length:18},(_,i)=>`Cláusula ${i+1}. Ao solicitar o desligamento, o usuário declara compreender que o computador possui o direito operacional de permanecer ligado caso julgue que o momento do desligamento não seja apropriado. O usuário também reconhece que clicar em “SIM” várias vezes não aumenta suas chances de sucesso.`);
  modal({
    title:"Termos e Condições",
    sub:"Documento oficial · versão 7.41",
    body:`<div class="terms"><h3>TERMOS DE CONSENTIMENTO PARA DESLIGAMENTO COMPUTACIONAL</h3>${paragraphs.map(p=>`<p>${p}</p>`).join("")}<p>Cláusula final. O usuário confirma que leu este documento, inclusive esta cláusula, mesmo que esteja pensando em apenas clicar no botão e ir embora.</p></div>
    <label class="check"><input type="checkbox" id="agree"> Li e concordo com tudo, inclusive com o que não li.</label>`,
    actions:`<button class="btn" id="back">Voltar</button><button class="btn primary" id="confirm" disabled>CONFIRMAR DESLIGAMENTO</button>`
  });
  const check=modalRoot.querySelector("#agree"), confirm=modalRoot.querySelector("#confirm");
  check.onchange=()=>confirm.disabled=!check.checked;
  modalRoot.querySelector("#back").onclick=confirmShutdown;
  confirm.onclick=adminError;
}
async function adminError(){
  closeModal();count();app.classList.add("shake");setTimeout(()=>app.classList.remove("shake"),400);
  await sleep(300);
  modal({
    title:"Algo deu errado.",
    sub:"O pedido de desligamento foi recusado.",
    body:`<p style="color:#aaa;line-height:1.7">Você está conectado como <b>USUÁRIO</b>.<br>Esta operação exige privilégios de <b>ADMINISTRADOR</b>.</p>
    <div class="error-code">ERRO 0x7A41 · SHUTDOWN_PRIVILEGE_DENIED</div>`,
    actions:`<button class="btn primary" id="ok">OK</button>`
  });
  modalRoot.querySelector("#ok").onclick=()=>{closeModal();showMethods();achieve("Primeiro obstáculo","O botão de desligar não era tão simples assim.")};
}
function showMethods(){
  modal({
    title:"Central de desligamento",
    sub:"Encontre uma maneira de desligar este computador.",
    body:`<p style="color:#777;font-size:12px;margin-top:0">O sistema recusou o método normal. Talvez exista outro.</p>
      <div class="method-grid">
        <button class="method" data-m="password"><strong>🔑 Redefinir senha</strong><span>Talvez uma conta com mais privilégios resolva.</span></button>
        <button class="method" data-m="restart"><strong>🔄 Reiniciar</strong><span>Se desligar não funciona, tente reiniciar.</span></button>
        <button class="method" data-m="terminal"><strong>⌨️ Terminal</strong><span>Existe um comando para tudo... certo?</span></button>
        <button class="method" data-m="schedule"><strong>⏱️ Agendar desligamento</strong><span>Deixe o computador fazer sozinho.</span></button>
        <button class="method" data-m="captcha"><strong>🤖 Verificação humana</strong><span>Prove que você é um humano.</span></button>
        <button class="method" data-m="trash"><strong>🗑️ Lixeira</strong><span>Talvez seja possível apagar o computador.</span></button>
        <button class="method" data-m="keyboard"><strong>⌨️ Atalhos</strong><span>Há combinações que podem funcionar.</span></button>
        <button class="method" data-m="negotiate"><strong>🧠 Negociar</strong><span>Converse com o computador.</span></button>
        <button class="method" data-m="wait"><strong>💤 Esperar</strong><span>Talvez ele desligue sozinho.</span></button>
        <button class="method" data-m="physical"><strong>🔌 Desligamento físico</strong><span>O último recurso.</span></button>
      </div>`,
    actions:`<button class="btn" id="closeMethods">Fechar</button>`
  });
  modalRoot.querySelector("#closeMethods").onclick=closeModal;
  modalRoot.querySelectorAll(".method").forEach(b=>b.onclick=()=>runMethod(b.dataset.m));
}

function runMethod(m){
  switch(m){
    case"password":return password();
    case"restart":return restart();
    case"terminal":return terminal();
    case"schedule":return schedule();
    case"captcha":return captcha();
    case"trash":return trash();
    case"keyboard":return keyboard();
    case"negotiate":return negotiate();
    case"wait":return waitMethod();
    case"physical":return physical();
  }
}
function backMethods(){showMethods()}

function password(){
  modal({title:"Redefinir senha",sub:"Recuperação de acesso",body:`<input id="pass" class="password" type="password" placeholder="Senha atual"><p id="passMsg" style="color:#777;font-size:11px"></p>`,actions:`<button class="btn" id="forgot">ESQUECI A SENHA</button><button class="btn" id="tryPass">Continuar</button><button class="btn primary" id="back">Voltar</button>`});
  modalRoot.querySelector("#back").onclick=backMethods;
  modalRoot.querySelector("#tryPass").onclick=()=>{count();modalRoot.querySelector("#passMsg").textContent="Senha incorreta. Você parecia confiante demais."};
  modalRoot.querySelector("#forgot").onclick=()=>recovery();
}
function recovery(){
  modal({title:"Recuperação de senha",sub:"Uma pergunta de segurança",body:`<p style="color:#aaa;font-size:13px">Qual era o nome do seu primeiro computador?</p><input class="password" id="answer" placeholder="Digite sua resposta"><p id="recMsg" style="color:#777;font-size:11px"></p>`,actions:`<button class="btn" id="send">Responder</button><button class="btn primary" id="back">Voltar</button>`});
  modalRoot.querySelector("#back").onclick=password;
  modalRoot.querySelector("#send").onclick=()=>{count();modalRoot.querySelector("#recMsg").textContent="Resposta incorreta. O computador aparentemente sabe mais sobre você do que deveria.";achieve("Quase administrador","Você chegou perto de uma solução que não existe.")};
}

function restart(){
  closeModal();count();app.classList.add("flash");toast("Reiniciando...");
  setTimeout(()=>{app.classList.remove("flash");modal({title:"Reinicialização concluída.",sub:"O computador continua ligado.",body:`<p style="color:#aaa;line-height:1.7">Parabéns. Você reiniciou o computador.<br><br><b>Isso não era o objetivo.</b></p><div class="progress"><i id="rp"></i></div>`,actions:`<button class="btn primary" id="back">Voltar</button>`});
    modalRoot.querySelector("#back").onclick=backMethods;achieve("Plano B","Você tentou reiniciar para conseguir desligar.")},900);
}
function terminal(){
  modal({title:"Terminal",sub:"C:\\Users\\Usuario",body:`<div class="terminal" id="term"><span class="terminal-line"><span class="prompt">C:\\Users\\Usuario&gt;</span> <span id="typed"></span><span class="cursor"></span></span></div>`,actions:`<button class="btn" id="cmd">Executar shutdown</button><button class="btn primary" id="back">Voltar</button>`});
  modalRoot.querySelector("#back").onclick=backMethods;
  modalRoot.querySelector("#cmd").onclick=async()=>{
    count();const t=modalRoot.querySelector("#typed");t.textContent="shutdown";await sleep(400);
    modalRoot.querySelector("#term").innerHTML+=`<span class="terminal-line">Comando reconhecido.</span><span class="terminal-line" style="color:#888">Executando shutdown...</span>`;
    await sleep(700);modalRoot.querySelector("#term").innerHTML+=`<span class="terminal-line" style="color:#aaa">ERRO 0x00000001: o computador decidiu continuar ligado.</span><span class="terminal-line"><span class="prompt">C:\\Users\\Usuario&gt;</span> <span class="cursor"></span></span>`;
    achieve("Hacker de araque","O terminal também não está do seu lado.")};
}
function schedule(){
  modal({title:"Agendar desligamento",sub:"Uma solução elegante.",body:`<p style="color:#aaa">Desligamento programado para:</p><div style="font-size:34px;font-weight:700;margin:10px 0" id="timer">00:10</div><div class="progress"><i id="sp"></i></div><p id="schedMsg" style="color:#777;font-size:11px"></p>`,actions:`<button class="btn" id="cancelSched">Cancelar</button><button class="btn primary" id="back">Voltar</button>`});
  modalRoot.querySelector("#back").onclick=backMethods;let n=10, cancelled=false;
  const timer=modalRoot.querySelector("#timer"),bar=modalRoot.querySelector("#sp"),msg=modalRoot.querySelector("#schedMsg");
  const iv=setInterval(()=>{if(!modalRoot.contains(timer)){clearInterval(iv);return} if(cancelled){clearInterval(iv);return} n--;timer.textContent=`00:${String(n).padStart(2,"0")}`;bar.style.width=`${(10-n)*10}%`;if(n<=0){n=10;msg.textContent="O computador estendeu o prazo por motivos administrativos.";achieve("Paciência em teste","O desligamento foi adiado pelo próprio computador.")}},1000);
  modalRoot.querySelector("#cancelSched").onclick=()=>{cancelled=true;backMethods()};
}
function captcha(){
  const icons=["💻","🖥️","🖥️","📱","⌨️","💻","🖨️","💻","📱"];
  modal({title:"Verificação humana",sub:"Selecione todas as imagens com computadores.",body:`<div class="captcha-grid">${icons.map((x,i)=>`<button class="cap" data-i="${i}">${x}</button>`).join("")}</div><p id="capMsg" style="color:#777;font-size:11px">3 computadores estão escondidos.</p>`,actions:`<button class="btn" id="verify">Verificar</button><button class="btn primary" id="back">Voltar</button>`});
  modalRoot.querySelector("#back").onclick=backMethods;
  modalRoot.querySelectorAll(".cap").forEach(b=>b.onclick=()=>b.classList.toggle("selected"));
  modalRoot.querySelector("#verify").onclick=()=>{count();modalRoot.querySelector("#capMsg").textContent="CAPTCHA incorreto. Uma das imagens era uma calculadora com autoestima de computador.";achieve("Eu sou humano","Você perdeu para um CAPTCHA.")};
}
function trash(){
  modal({title:"Lixeira",sub:"Arquivos encontrados",body:`<div class="terms" style="height:230px"><p>💻 Computador.exe</p><p>⚙️ Sistema operacional.exe</p><p>🌐 Internet.exe</p><p>🧠 Sua paciência.exe</p></div><p style="color:#777;font-size:11px">Selecione um arquivo para excluir.</p>`,actions:`<button class="btn danger" id="delete">Excluir computador.exe</button><button class="btn primary" id="back">Voltar</button>`});
  modalRoot.querySelector("#back").onclick=backMethods;
  modalRoot.querySelector("#delete").onclick=()=>{count();toast("Não é possível excluir o computador enquanto ele está sendo utilizado.");achieve("Paradoxo","Você tentou apagar o computador para desligá-lo.")};
}
function keyboard(){
  modal({title:"Atalhos de teclado",sub:"Tente uma combinação.",body:`<p style="color:#777;font-size:12px">Digite uma combinação conhecida.</p><input class="password" id="key" placeholder="Ex.: ALT + F4"><p id="keyMsg" style="color:#777;font-size:11px"></p>`,actions:`<button class="btn" id="send">Executar</button><button class="btn primary" id="back">Voltar</button>`});
  modalRoot.querySelector("#back").onclick=backMethods;
  modalRoot.querySelector("#send").onclick=()=>{count();let v=modalRoot.querySelector("#key").value.toUpperCase();let msg=v.includes("ALT")&&v.includes("F4")?"Janela protegida. O computador fechou apenas sua esperança.":"Atalho não reconhecido.";modalRoot.querySelector("#keyMsg").textContent=msg;achieve("Atalho inválido","Nem o teclado quis colaborar.")};
}
function negotiate(){
  const opts=["Preciso ir embora.","Você está travando.","Quero dormir.","Porque sim.","Não é da sua conta."];
  modal({title:"Central de negociação",sub:"Explique por que devo ser desligado.",body:`<div style="display:grid;gap:8px">${opts.map((x,i)=>`<button class="method" data-o="${i}">${x}</button>`).join("")}</div><p id="negMsg" style="color:#777;font-size:12px"></p>`,actions:`<button class="btn primary" id="back">Voltar</button>`});
  modalRoot.querySelector("#back").onclick=backMethods;
  modalRoot.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{count();const msgs=["Eu também.","Isso é preconceito contra computadores.","Durma você. Eu fico aqui.","Argumento insuficiente.","Essa conversa terminou por falta de respeito."];modalRoot.querySelector("#negMsg").textContent=msgs[b.dataset.o];achieve("Diplomata","Você tentou convencer o computador.")});
}
function waitMethod(){
  closeModal();count();toast("Aguardando desligamento automático...");
  let n=5;const iv=setInterval(()=>{toast(`Desligamento automático em ${n}...`);n--;if(n<0){clearInterval(iv);toast("Você esperou até aqui? Então não seria divertido desligar agora.");achieve("Paciência desperdiçada","Você literalmente esperou o computador desligar sozinho.")}},1000);
}
function physical(){
  count();app.classList.add("shake");setTimeout(()=>app.classList.remove("shake"),400);
  modal({title:"Desligamento físico detectado",sub:"O sistema bloqueou essa tentativa.",body:`<p style="color:#aaa;line-height:1.7">Você tentou desligar o computador fisicamente.</p><div class="error-code">HARDWARE_SHUTDOWN_ATTEMPT = TRUE<br>RESULT = NEGADO<br>REASON = “NÃO.”</div>`,actions:`<button class="btn primary" id="back">Voltar</button>`});
  modalRoot.querySelector("#back").onclick=backMethods;achieve("Último recurso","Você chegou ao extremo.") ;
}

// Hidden exploration: clicks around the page can reveal extra reactions.
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&modalRoot.innerHTML)closeModal();
  if(e.key==="F12"){e.preventDefault();toast("Ferramentas de desenvolvedor detectadas. Boa tentativa.");achieve("Curioso","Você tentou olhar por trás do sistema.")}
  if(e.key==="Delete"&&modalRoot.innerHTML===""){toast("Delete? O computador não quer ouvir falar disso.");achieve("Destruidor","Você tentou resolver tudo com uma tecla.")}
});
document.addEventListener("contextmenu",e=>{
  if(modalRoot.innerHTML===""){e.preventDefault();toast("Botão direito detectado. E você realmente tentou isso.");achieve("Tentativa","Você descobriu uma reação escondida.");}
});
