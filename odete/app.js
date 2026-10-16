import {SONG_TEXT,SONG_SECTION_TEXT} from './synth.mjs';
import {createComposer} from './composer.js';
const $=id=>document.getElementById(id);
const presets={classic:[0,-1,96,0],tiny:[9,2,85,12],evil:[-8,-2,100,4],space:[3,-1,70,36]};
const keys=['pitch','rate','robotic','crush'];
let ctx,source,buffer,analyser,wave,busy=false,mode='speech',cues=[],started=0,customText='Olá, humano. Eu sou a Odete. Vamos cantar?',job=0,worker;
const composer=createComposer();
function labels(){keys.forEach(k=>$(k+'-value').textContent=$(k).value+(k==='pitch'?' st':k==='rate'?'':'%'));}
function selectPreset(name){keys.forEach((k,i)=>$(k).value=presets[name][i]);document.querySelectorAll('.preset').forEach(b=>{b.classList.toggle('active',b.dataset.preset===name);b.setAttribute('aria-pressed',String(b.dataset.preset===name))});labels();}
document.querySelectorAll('.preset').forEach(b=>b.onclick=()=>selectPreset(b.dataset.preset));
keys.forEach(k=>$(k).oninput=()=>{labels();document.querySelectorAll('.preset').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});});
$('reset').onclick=()=>selectPreset('classic');
function count(){$('count').textContent=String($('text').value.length).padStart(3,'0')+' / 1200';}
$('text').oninput=count;
document.querySelectorAll('[data-text]').forEach(b=>b.onclick=()=>{setMode('speech');$('text').value=b.dataset.text;count()});
$('crt').onclick=()=>{let enabled=document.body.classList.toggle('crt');$('crt').textContent='CRT: '+(enabled?'ON':'OFF');$('crt').setAttribute('aria-pressed',String(enabled));};
function setMode(value){
 if(value===mode)return;stop();if(mode==='speech')customText=$('text').value;
 mode=value;$('text').value=value==='song'?SONG_SECTION_TEXT[$('song-section').value]||SONG_TEXT:customText;$('text').readOnly=value==='song';
 $('tempo-wrap').hidden=value==='speech';$('rate').disabled=value!=='speech';
 $('song-section-wrap').hidden=value!=='song';
 $('composer-panel').hidden=value!=='custom';$('text').hidden=value==='custom';document.querySelector('.input-label').hidden=value==='custom';document.querySelector('.quick').hidden=value==='custom';
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===value)));
 $('speak').textContent=value==='custom'?'♫ CANTAR COMPOSIÇÃO':value==='song'?'♫ CANTAR DAISY BELL':'▶ GERAR & TOCAR';
 $('mode-note').textContent=value==='custom'?'Seu estúdio está abaixo ↓ · edite a letra, as notas e o ritmo.':value==='song'?'Partitura fixa · primeira estrofe · notas e sílabas sincronizadas':'Texto livre · regras simples de português + palavras inglesas de demonstração';count();
}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$('tempo').oninput=()=>$('tempo-value').textContent=$('tempo').value+' BPM';
$('song-section').onchange=()=>{if(mode==='song'){stop();$('text').value=SONG_SECTION_TEXT[$('song-section').value];count();}};
const canvas=$('scope'),pen=canvas.getContext('2d'),pad=$('vowel-pad'),vpen=pad.getContext('2d');
let lastCue;
function plot(current){
 const w=pad.width=pad.clientWidth*devicePixelRatio,h=pad.height=190*devicePixelRatio,d=devicePixelRatio;
 const left=36*d,right=w-22*d,top=18*d,bottom=h-30*d;
 const x=f=>left+(2600-f)/2000*(right-left),y=f=>top+(f-200)/700*(bottom-top);
 vpen.fillStyle='#142921';vpen.fillRect(0,0,w,h);vpen.font=`${9*d}px monospace`;vpen.lineWidth=d;
 vpen.strokeStyle='#b9e6b026';vpen.fillStyle='#b9e6b088';
 for(let f of [300,500,700,900]){vpen.beginPath();vpen.moveTo(left,y(f));vpen.lineTo(right,y(f));vpen.stroke();vpen.fillText(f,3*d,y(f)+3*d);}
 for(let f of [800,1600,2400]){vpen.beginPath();vpen.moveTo(x(f),top);vpen.lineTo(x(f),bottom);vpen.stroke();vpen.fillText(f,x(f)-10*d,h-10*d);}
 vpen.fillStyle='#b9e6b0';for(let [letter,f1,f2] of [['I',270,2290],['E',530,1840],['A',730,1090],['O',570,840],['U',300,870]])vpen.fillText(letter,x(f2)-3*d,y(f1)+3*d);
 let f1=current?.f1||Number($('f1').value),f2=current?.f2||Number($('f2').value);
 vpen.fillStyle='#ed633b';vpen.fillRect(x(f2)-4*d,y(f1)-4*d,8*d,8*d);vpen.strokeStyle='#ed633b';vpen.strokeRect(x(f2)-8*d,y(f1)-8*d,16*d,16*d);
 $('formant-readout').textContent=`F1 ${Math.round(f1)} Hz / F2 ${Math.round(f2)} Hz`;
}
function draw(){
 let width=Math.round(canvas.clientWidth*devicePixelRatio),height=52*devicePixelRatio;
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}pen.clearRect(0,0,width,height);pen.strokeStyle='#b9e6b0';pen.lineWidth=devicePixelRatio;pen.beginPath();
 if(analyser){wave??=new Uint8Array(1024);analyser.getByteTimeDomainData(wave);}
 for(let x=0;x<width;x++){let v=analyser?(wave[Math.floor(x/width*wave.length)]-128)/128:0,y=height/2+v*height*.45;x?pen.lineTo(x,y):pen.moveTo(x,y);}pen.stroke();
 let current=source?cues.find(c=>ctx.currentTime-started>=c.time&&ctx.currentTime-started<c.end):undefined;
 if(current!==lastCue){lastCue=current;plot(current);composer.setActive(source&&mode==='custom'?current?.eventIndex??null:null);$('phoneme').textContent=current?`${current.lyric||current.phone} ${current.note?'· MIDI '+current.note:''}`:'FONEMA: —';}requestAnimationFrame(draw);
}
function stop(){
 job++;worker?.terminate();worker=null;busy=false;$('speak').disabled=false;$('vowel-play').disabled=false;$('sing-score').disabled=false;composer.setActive(null);
 if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();source=null;}if(analyser){analyser.disconnect();analyser=null;}
 document.body.classList.remove('playing');$('stop').disabled=true;$('signal').textContent='SIGNAL: IDLE';$('robot-message').textContent='ODETE ONLINE_';
}
$('stop').onclick=()=>{stop();$('status').textContent='TRANSMISSÃO INTERROMPIDA.';};
function play(){
 if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();}analyser?.disconnect();
 source=ctx.createBufferSource();source.buffer=buffer;analyser=ctx.createAnalyser();analyser.fftSize=1024;source.connect(analyser);analyser.connect(ctx.destination);
 source.onended=()=>{stop();$('status').textContent='TRANSMISSÃO CONCLUÍDA. WAV PRONTO PARA EXPORTAR.';};started=ctx.currentTime;source.start();$('stop').disabled=false;document.body.classList.add('playing');$('signal').textContent='SIGNAL: FORMANT SYNTH';$('robot-message').textContent='ODETE FALANDO_';
}
async function generate(requestMode=mode){
 if(busy)return;let text=$('text').value.trim();if(requestMode==='speech'&&!text){$('status').textContent='ESCREVA ALGUMA COISA PARA COMEÇAR.';$('text').focus();return;}
 let score;try{if(requestMode==='custom')score=composer.getScore();}catch(error){composer.message(error.message,true);$('status').textContent=error.message;return;}
 stop();busy=true;const thisJob=job;$('speak').disabled=true;$('vowel-play').disabled=true;$('sing-score').disabled=true;$('stop').disabled=false;$('export').disabled=true;$('replay').disabled=true;$('status').textContent='CONSTRUINDO PULSOS E FORMANTES…';
 const options={...Object.fromEntries(keys.map(k=>[k,Number($(k).value)])),text,score,mode:requestMode,section:$('song-section').value,tempo:Number($('tempo').value),f1:Number($('f1').value),f2:Number($('f2').value)};
 try{
  ctx??=new AudioContext();await ctx.resume();if(thisJob!==job)return;
  let data=await new Promise((resolve,reject)=>{worker=new Worker('./synth-worker.js',{type:'module'});worker.onmessage=({data})=>data.ok?resolve(data):reject(Error(data.error));worker.onerror=()=>reject(Error('Falha no motor de síntese. Recarregue o aplicativo.'));worker.postMessage(options);});
  if(thisJob!==job)return;worker.terminate();worker=null;buffer=ctx.createBuffer(1,data.samples.length,data.sampleRate);buffer.copyToChannel(data.samples,0);cues=data.cues;
  $('export').disabled=false;$('replay').disabled=false;$('status').textContent=`${requestMode==='song'||requestMode==='custom'?'CANTANDO':'TRANSMITINDO'} · ${data.duration.toFixed(1)}s · SÍNTESE POR FORMANTES`;play();if(requestMode==='song')$('robot-message').textContent='ODETE CANTANDO_';if(requestMode==='custom')composer.message(`Cantando sua composição · ${data.duration.toFixed(1)} segundos. Use WAV no painel superior para salvar o áudio.`);
 }catch(error){if(thisJob===job)$('status').textContent='ERRO: '+error.message;}
 finally{if(thisJob===job){busy=false;$('speak').disabled=false;$('vowel-play').disabled=false;$('sing-score').disabled=false;if(!source)$('stop').disabled=true;worker?.terminate();worker=null;}}
}
$('speak').onclick=()=>generate();$('vowel-play').onclick=()=>generate('vowel');
$('sing-score').onclick=()=>generate('custom');$('stop-score').onclick=()=>$('stop').click();
$('replay').onclick=async()=>{if(!buffer||busy)return;stop();await ctx.resume();play();$('status').textContent='REPRODUZINDO A ÚLTIMA TRANSMISSÃO.';};
function updateVowel(){plot();$('f1-value').textContent=$('f1').value+' Hz';$('f2-value').textContent=$('f2').value+' Hz';}
for(let id of ['f1','f2'])$(id).oninput=updateVowel;
document.querySelectorAll('[data-vowel]').forEach(b=>b.onclick=()=>{let values=b.dataset.vowel.split(',');$('f1').value=values[0];$('f2').value=values[1];updateVowel();generate('vowel');});
let dragging=false;
function point(event){let rect=pad.getBoundingClientRect(),x=Math.max(0,Math.min(1,(event.clientX-rect.left-36)/(rect.width-58))),y=Math.max(0,Math.min(1,(event.clientY-rect.top-18)/(rect.height-48)));$('f1').value=Math.round((200+y*700)/10)*10;$('f2').value=Math.round((2600-x*2000)/10)*10;updateVowel();}
pad.onpointerdown=event=>{if(busy)return;dragging=true;pad.setPointerCapture(event.pointerId);point(event);};pad.onpointermove=event=>{if(dragging)point(event);};pad.onpointerup=event=>{if(!dragging)return;dragging=false;point(event);generate('vowel');};pad.onpointercancel=()=>dragging=false;
function wav(audio){let samples=audio.getChannelData(0),bytes=new ArrayBuffer(44+samples.length*2),view=new DataView(bytes);const str=(offset,s)=>{for(let i=0;i<s.length;i++)view.setUint8(offset+i,s.charCodeAt(i));};str(0,'RIFF');view.setUint32(4,36+samples.length*2,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,audio.sampleRate,true);view.setUint32(28,audio.sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,samples.length*2,true);for(let i=0;i<samples.length;i++)view.setInt16(44+i*2,Math.max(-1,Math.min(1,samples[i]))*32767,true);return new Blob([bytes],{type:'audio/wav'});}
$('export').onclick=()=>{if(!buffer)return;let url=URL.createObjectURL(wav(buffer)),a=document.createElement('a');a.href=url;a.download='odete-voz.wav';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
window.addEventListener('resize',updateVowel);
$('tempo-value').textContent=$('tempo').value+' BPM';
selectPreset('classic');count();updateVowel();draw();
