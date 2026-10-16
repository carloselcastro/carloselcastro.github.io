import {makeScore,fitLyrics,noteName,validateScore,MAX_NOTES} from './music.mjs';
import {readMidi,trackToScore,writeMidi} from './midi.mjs';
const $=id=>document.getElementById(id), STORAGE='odete-composer-v1';
const SOLFEGE=['Dó','Dó#','Ré','Ré#','Mi','Fá','Fá#','Sol','Sol#','Lá','Lá#','Si'];
export function createComposer(){
 let score=makeScore('ro-bô can-ta pa-ra mim'),midi,dirty=false,lastActive=null;
 try{let saved=JSON.parse(localStorage.getItem(STORAGE)||localStorage.getItem('daisy-composer-v1'));if(saved){validateScore(saved.score,saved.tempo);localStorage.setItem(STORAGE,JSON.stringify(saved));score=saved.score;dirty=Boolean(saved.dirty);$('composer-lyrics').value=String(saved.text||'').slice(0,1200);$('tempo').value=saved.tempo;}}catch{}
 $('composer-tempo').value=$('tempo').value;
 const message=(text,error=false)=>{$('composer-message').textContent=text;$('composer-message').classList.toggle('error',error);};
 function save(){try{localStorage.setItem(STORAGE,JSON.stringify({score,text:$('composer-lyrics').value,tempo:Number($('tempo').value),dirty}));}catch{}}
 function summary(){
  let beats=score.reduce((sum,row)=>sum+row.beats,0),tempo=Number($('tempo').value);
  $('score-summary').textContent=`${score.filter(r=>r.note!==null).length} notas · ${+beats.toFixed(2)} tempos · ${(beats*60/tempo).toFixed(1)}s`;
 }
 function syncText(){
  $('composer-lyrics').value=score.filter(r=>r.note!==null).map(r=>r.lyric).join(' ');dirty=false;
 }
 function changed(){summary();roll();save();}
 function roll(){
  let svg=$('piano-roll'),NS='http://www.w3.org/2000/svg',total=score.reduce((a,r)=>a+r.beats,0)||1,width=Math.max(600,Math.min(6000,total*42)),height=140;
  svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.style.width=width+'px';
  let notes=score.filter(r=>r.note!==null).map(r=>r.note),low=Math.min(45,...notes)-2,high=Math.max(60,...notes)+2;
  const el=(tag,attrs)=>{let node=document.createElementNS(NS,tag);for(let [k,v]of Object.entries(attrs))node.setAttribute(k,v);svg.append(node);return node;};
  for(let beat=0;beat<=total;beat++)el('line',{x1:beat/total*width,y1:0,x2:beat/total*width,y2:height,stroke:beat%4?'#b9e6b019':'#b9e6b055'});
  let start=0;
  score.forEach((row,index)=>{
   if(row.note!==null){let x=start/total*width,y=12+(high-row.note)/(high-low)*100;
    let rect=el('rect',{x:x+1,y,width:Math.max(3,row.beats/total*width-2),height:12,fill:'#b9e6b0',tabindex:0,role:'button','aria-label':`Passo ${index+1}, ${row.lyric}, ${noteName(row.note)}`,'data-index':index});
    let title=document.createElementNS(NS,'title');title.textContent=`${row.lyric} · ${noteName(row.note)} · ${row.beats} tempos`;rect.append(title);
    const focus=()=>{$('score-rows').children[index]?.querySelector('input')?.focus();};rect.onclick=focus;rect.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();focus();}};
    if(row.beats/total*width>22){let text=el('text',{x:x+4,y:y+28,fill:'#b9e6b0','font-size':10,'font-family':'monospace'});text.textContent=row.lyric.slice(0,10);}
   }start+=row.beats;
  });
 }
 function render(){
  const rows=$('score-rows');rows.replaceChildren();
  score.forEach((row,index)=>{
   let tr=document.createElement('tr');tr.dataset.index=index;
   let number=document.createElement('td');number.textContent=String(index+1).padStart(2,'0');tr.append(number);
   function input(value,label,onchange,{type='text',maxLength=40}={}){
    let td=document.createElement('td'),field=document.createElement('input');field.type=type;field.value=value;field.setAttribute('aria-label',`${label}, passo ${index+1}`);
    if(type==='number'){field.min=.0625;field.max=16;field.step='any';}else field.maxLength=maxLength;
    field.oninput=()=>{let value=Number(field.value);if(type==='number'&&(!field.value.trim()||!Number.isFinite(value)||value<.0625||value>16))return;onchange(field.value);changed();};
    field.onchange=()=>{if(type==='number'&&(!Number.isFinite(Number(field.value))||Number(field.value)<.0625||Number(field.value)>16)){field.value=row.beats;message('Use uma duração de 0,0625 a 16 tempos.',true);return;}onchange(field.value);changed();};td.append(field);tr.append(td);return field;
   }
   input(row.lyric,'Sílaba',value=>{row.lyric=value.trim();row.wordStart=true;row.wordEnd=false;row.previousLetter='';syncText();});
   input(row.pronunciation||'','Pronúncia opcional',value=>row.pronunciation=value,{maxLength:60});
   let td=document.createElement('td'),select=document.createElement('select');select.setAttribute('aria-label',`Nota, passo ${index+1}`);
   let rest=new Option('— Pausa','rest');select.append(rest);
   for(let note=36;note<=84;note++)select.append(new Option(`${noteName(note)} · ${SOLFEGE[note%12]}`,note));
   select.value=row.note===null?'rest':String(row.note);select.onchange=()=>{row.note=select.value==='rest'?null:Number(select.value);if(row.note!==null&&row.lyric==='_')row.lyric='la';changed();render();};td.append(select);tr.append(td);
   input(row.beats,'Duração em tempos',value=>row.beats=Number(value),{type:'number'});
   let removeCell=document.createElement('td'),remove=document.createElement('button');remove.textContent='×';remove.setAttribute('aria-label',`Remover passo ${index+1}`);remove.onclick=()=>{score.splice(index,1);syncText();changed();render();};removeCell.append(remove);tr.append(removeCell);rows.append(tr);
  });summary();roll();lastActive=null;
 }
 $('composer-lyrics').oninput=()=>{dirty=true;save();message('Letra alterada: clique em Criar melodia ou Encaixar nas notas.');};
 $('build-score').onclick=()=>{
  try{score=makeScore($('composer-lyrics').value,{rhythm:$('rhythm').value,pattern:$('melody-pattern').value});dirty=false;render();save();message('Melodia criada. Edite as notas, durações e pronúncias na tabela.');}catch(e){message(e.message,true);}
 };
 $('fit-lyrics').onclick=()=>{try{score=fitLyrics(score,$('composer-lyrics').value);dirty=false;render();save();message('Letra encaixada nas notas.');}catch(e){message(e.message,true);}};
 $('add-note').onclick=()=>{if(score.length>=MAX_NOTES){message(`Limite de ${MAX_NOTES} passos.`,true);return;}score.push({lyric:'la',note:score.at(-1)?.note??48,beats:1,pronunciation:''});syncText();changed();render();};
 $('midi-file').onchange=async()=>{
  try{
   let file=$('midi-file').files[0];if(!file)return;if(file.size>2_000_000)throw Error('Use um MIDI de até 2 MB.');
   midi=readMidi(await file.arrayBuffer());$('midi-track').replaceChildren();
   midi.tracks.forEach((track,index)=>$('midi-track').append(new Option(`${track.name} · ${track.notes.length} notas${track.poly?' · acordes':''}`,index)));
   let mono=midi.tracks.findIndex(t=>!t.poly);$('midi-track').value=String(mono>=0?mono:0);$('midi-track-picker').hidden=false;
   message(`${file.name}: escolha uma faixa e clique em Usar faixa. Tudo é lido neste computador.`);
  }catch(e){midi=null;$('midi-track-picker').hidden=true;message(e.message,true);}
 };
 $('use-midi-track').onclick=()=>{
  try{
   let next=trackToScore(midi,Number($('midi-track').value));score=next;$('tempo').value=Math.max(40,Math.min(200,midi.tempo));$('composer-tempo').value=$('tempo').value;$('tempo-value').textContent=$('tempo').value+' BPM';syncText();render();save();
   message(`Melodia importada. ${midi.tempoChanges?'Mudanças de andamento foram substituídas por um BPM fixo. ':''}${midi.tempo<40||midi.tempo>200?'BPM ajustado ao intervalo de 40–200. ':''}Digite a letra e use Encaixar nas notas; use ~ para sustentar a vogal.`);
  }catch(e){message(e.message,true);}
 };
 function download(bytes,name,type){let url=URL.createObjectURL(new Blob([bytes],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 $('export-midi').onclick=()=>{try{let current=getScore();download(writeMidi(current,Number($('tempo').value)),'odete-composicao.mid','audio/midi');message('MIDI exportado: notas, pausas e sílabas. O áudio da voz é exportado em WAV.');}catch(e){message(e.message,true);}};
 function getScore(){
  if(dirty)throw Error('Aplique a letra com Criar melodia ou Encaixar nas notas antes de cantar.');
  validateScore(score,Number($('tempo').value));return score.map(row=>({...row}));
 }
 function setActive(index){
  if(index===lastActive)return;lastActive=index;
  for(let row of $('score-rows').children)row.classList.toggle('sounding',Number(row.dataset.index)===index);
  for(let note of $('piano-roll').querySelectorAll('rect'))note.setAttribute('fill',Number(note.dataset.index)===index?'#ed633b':'#b9e6b0');
 }
 $('tempo').addEventListener('input',()=>{$('composer-tempo').value=$('tempo').value;summary();save();});
 const updateTempo=()=>{let value=Number($('composer-tempo').value);if(!Number.isFinite(value)||value<40||value>200)return false;$('tempo').value=value;$('tempo').dispatchEvent(new Event('input'));return true;};
 $('composer-tempo').oninput=updateTempo;
 $('composer-tempo').onchange=()=>{if(!updateTempo()){$('composer-tempo').value=$('tempo').value;message('Use de 40 a 200 BPM.',true);}};render();if(dirty)message('Sua letra ainda não foi aplicada. Clique em Criar melodia ou Encaixar nas notas.');
 return {getScore,setActive,message};
}
