import {MAX_NOTES,validateScore} from './music.mjs';
// Standard MIDI Files 0/1, metrical time. MIDI data stays on this computer.
export function readMidi(input){
  const data=input instanceof Uint8Array?input:new Uint8Array(input),view=new DataView(data.buffer,data.byteOffset,data.byteLength);
  if(data.length>2_000_000)throw Error('Escolha um MIDI de até 2 MB.');
  let p=0,limit=data.length;
  const need=n=>{if(p+n>limit)throw Error('MIDI incompleto ou inválido.');};
  const u8=()=>{need(1);return data[p++];},u16=()=>{need(2);let n=view.getUint16(p);p+=2;return n;},u32=()=>{need(4);let n=view.getUint32(p);p+=4;return n;};
  const str=n=>{need(n);let s=String.fromCharCode(...data.slice(p,p+n));p+=n;return s;};
  const vlq=()=>{let n=0;for(let i=0;i<4;i++){let b=u8();n=(n<<7)|(b&127);if(!(b&128))return n;}throw Error('Tempo MIDI inválido.');};
  if(str(4)!=='MThd')throw Error('Esse arquivo não é um MIDI padrão (.mid).');
  let size=u32();if(size<6)throw Error('Cabeçalho MIDI inválido.');need(size);
  const format=u16(),trackCount=u16(),division=u16();p+=size-6;
  if(format>1)throw Error('Use um MIDI tipo 0 ou 1.');
  if(division&0x8000||!division)throw Error('Este MIDI usa relógio SMPTE. Exporte em pulsos por tempo (PPQ).');
  let tracks=[],tempos=[];
  for(let trackIndex=0;trackIndex<trackCount;trackIndex++){
    if(str(4)!=='MTrk')throw Error('Faixa MIDI inválida.');let size=u32(),end=p+size;need(size);limit=end;
    let tick=0,running=0,name=`Faixa ${trackIndex+1}`,active=new Map(),notes=[],lyrics=[];
    while(p<end){
      tick+=vlq();let status=u8();
      if(status<128){if(!running)throw Error('Evento MIDI inválido.');p--;status=running;}
      if(status===255){
        let type=u8(),n=vlq();need(n);let bytes=data.slice(p,p+n);p+=n;
        if(type===3)name=new TextDecoder().decode(bytes).replace(/[\x00-\x1f]/g,'').slice(0,80)||name;
        if(type===5)lyrics.push({tick,text:new TextDecoder().decode(bytes).trim()});
        if(type===81&&n===3){let micro=(bytes[0]<<16)|(bytes[1]<<8)|bytes[2];if(micro>0)tempos.push({tick,bpm:60e6/micro});}
        if(type===47)break;
        continue;
      }
      if(status===240||status===247){let n=vlq();need(n);p+=n;running=0;continue;}
      if(status<128||status>=240)throw Error('Evento MIDI não suportado.');
      running=status;let type=status>>4,channel=status&15,a=u8(),b=type===12||type===13?0:u8();
      if(a>127||b>127)throw Error('Dados MIDI inválidos.');
      if(type!==8&&type!==9)continue;
      let key=channel+':'+a;
      if(type===9&&b>0){if(active.has(key))throw Error('O MIDI contém notas repetidas sobrepostas.');active.set(key,{start:tick,note:a,channel});}
      else if(active.has(key)){let note=active.get(key);active.delete(key);if(tick>note.start)notes.push({...note,end:tick});}
    }
    if(active.size)throw Error('O MIDI contém notas sem encerramento.');
    p=end;limit=data.length;
    for(let channel of [...new Set(notes.map(n=>n.channel))]){
      if(channel===9)continue;
      let channelNotes=notes.filter(n=>n.channel===channel).sort((a,b)=>a.start-b.start||a.note-b.note),lastEnd=0,poly=false;
      for(let note of channelNotes){if(note.start<lastEnd)poly=true;lastEnd=Math.max(lastEnd,note.end);}
      tracks.push({name:`${name} · canal ${channel+1}`,notes:channelNotes,lyrics,poly});
    }
  }
  if(!tracks.length)throw Error('Não encontrei notas melódicas neste MIDI.');
  tempos.sort((a,b)=>a.tick-b.tick);
  return {tracks,division,tempo:Math.round(tempos[0]?.bpm||120),tempoChanges:tempos.some(t=>Math.abs(t.bpm-(tempos[0]?.bpm||120))>.01)};
}
export function trackToScore(midi,index){
  let track=midi.tracks[index];if(!track)throw Error('Escolha uma faixa.');
  if(track.poly)throw Error('Essa faixa tem acordes. Escolha uma linha com uma nota por vez.');
  let score=[],cursor=0;
  for(let note of track.notes){
    if(note.note<36||note.note>84)throw Error('A melodia precisa estar entre C2 e C6. Transponha o MIDI antes de importar.');
    let gap=(note.start-cursor)/midi.division;
    if(gap>1e-6)score.push({note:null,beats:gap,lyric:'_',pronunciation:''});
    score.push({note:note.note,beats:(note.end-note.start)/midi.division,lyric:track.lyrics.find(l=>Math.abs(l.tick-note.start)<=1)?.text||'la',pronunciation:''});cursor=note.end;
  }
  if(score.length>MAX_NOTES)throw Error(`Importe um trecho com até ${MAX_NOTES} passos, contando pausas.`);
  validateScore(score,Math.max(40,Math.min(200,midi.tempo)));return score;
}
const vlq=n=>{let out=[n&127];while(n>>=7)out.unshift((n&127)|128);return out;};
export function writeMidi(score,tempo=112){
  validateScore(score,tempo);const ppq=480,events=[];let tick=0;
  for(let row of score){let length=Math.max(1,Math.round(row.beats*ppq));
    if(row.note!==null&&row.lyric!=='_'){
      let lyric=new TextEncoder().encode(row.lyric);
      events.push({tick,order:1,bytes:[255,5,...vlq(lyric.length),...lyric]},{tick,order:2,bytes:[144,row.note,96]},{tick:tick+length,order:0,bytes:[128,row.note,0]});
    }tick+=length;
  }
  events.sort((a,b)=>a.tick-b.tick||a.order-b.order);let us=Math.round(60e6/tempo),body=[0,255,81,3,(us>>16)&255,(us>>8)&255,us&255,0,255,88,4,4,2,24,8],last=0;
  for(let event of events){body.push(...vlq(event.tick-last),...event.bytes);last=event.tick;}
  body.push(...vlq(tick-last),255,47,0);
  let size=body.length;return new Uint8Array([77,84,104,100,0,0,0,6,0,0,0,1,ppq>>8,ppq&255,77,84,114,107,(size>>>24)&255,(size>>>16)&255,(size>>>8)&255,size&255,...body]);
}
