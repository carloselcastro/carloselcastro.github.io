export const MAX_NOTES=96;
export const PITCHES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export function noteName(note){return note===null?'Pausa':PITCHES[note%12]+(Math.floor(note/12)-1);}
export function parseNote(text){
  let match=/^([A-G])([#b]?)(-?\d)$/.exec(text.trim());
  if(!match)throw Error('Use notas como C3, F#3 ou Bb3.');
  let value=(+match[3]+1)*12+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[match[1]]+(match[2]==='#'?1:match[2]==='b'?-1:0);
  if(value<36||value>84)throw Error('Escolha uma nota de C2 até C6.');return value;
}
const vowel=c=>/[aeiouáéíóúâêôãõü]/i.test(c||' ');
function splitWord(word){
  if(word.includes('-'))return word.split('-').filter(Boolean);
  let cuts=[],i=0;
  while(i<word.length){
    if(!vowel(word[i])){i++;continue;}
    let end=i+1;
    while(vowel(word[end])&&/^(ai|au|ei|eu|oi|ou|ui|ão|ãe|õe)$/i.test(word.slice(end-1,end+1)))end++;
    let next=end;while(next<word.length&&!vowel(word[next]))next++;
    if(next>=word.length)break;
    let cluster=word.slice(end,next).toLowerCase(),cut=next;
    if(cluster.length===1)cut=end;
    else if(cluster.length>=2)cut=next-(/^(br|cr|dr|fr|gr|pr|tr|vr|bl|cl|fl|gl|pl|ch|lh|nh|rr|ss)$/.test(cluster.slice(-2))?2:1);
    if(cut>0&&!cuts.includes(cut))cuts.push(cut);
    i=next;
  }
  let points=[0,...cuts,word.length];return points.slice(1).map((end,i)=>word.slice(points[i],end)).filter(Boolean);
}
export function splitLyrics(text){
  const words=text.normalize('NFC').match(/[a-zà-ÿ]+(?:-[a-zà-ÿ]+)*|[~_]/gi)||[];
  return words.flatMap(word=>{
    if(word==='~'||word==='_')return [{lyric:word,wordStart:true,wordEnd:true}];
    let parts=splitWord(word);return parts.map((lyric,i)=>({lyric,wordStart:i===0,wordEnd:i===parts.length-1,previousLetter:i?parts[i-1].slice(-1):''}));
  });
}
export function makeScore(text,{rhythm='steady',pattern='arc'}={}){
  let syllables=splitLyrics(text);if(!syllables.length)throw Error('Digite uma letra para compor.');
  if(syllables.length>MAX_NOTES)throw Error(`Use até ${MAX_NOTES} sílabas por composição.`);
  const melody={arc:[48,52,55,57,55,52,50,48],steps:[48,50,52,53,55,53,52,48],daisy:[55,52,48,43,45,47,48,45]}[pattern]||[48];
  const durations={steady:[1],bounce:[.5,.5,1],waltz:[1.5,.5,1]}[rhythm]||[1];
  return syllables.map((syllable,i)=>({...syllable,note:syllable.lyric==='_'?null:melody[i%melody.length],beats:durations[i%durations.length],pronunciation:''}));
}
export function validateScore(score,tempo=112){
  if(!Array.isArray(score)||!score.length||score.length>MAX_NOTES)throw Error(`Crie de 1 a ${MAX_NOTES} passos.`);
  if(!Number.isFinite(tempo)||tempo<40||tempo>200)throw Error('Use um andamento de 40 a 200 BPM.');
  let total=0,hasVoice=false;
  for(let row of score){
    if(row.note!==null&&(!Number.isInteger(row.note)||row.note<36||row.note>84))throw Error('As notas devem ficar entre C2 e C6.');
    if(!Number.isFinite(row.beats)||row.beats<.0625||row.beats>16)throw Error('Cada passo precisa ter de 0,0625 a 16 tempos.');
    if(String(row.lyric||'').length>40||String(row.pronunciation||'').length>60)throw Error('Use até 40 letras por sílaba e 60 na pronúncia.');
    if(row.note!==null&&!String(row.lyric||'').trim())throw Error('Preencha a sílaba de cada nota. Use ~ para sustentar a vogal anterior.');
    if(row.note!==null&&row.lyric!=='_'&&row.lyric!=='~')hasVoice=true;
    total+=row.beats;
  }
  if(!hasVoice)throw Error('Inclua pelo menos uma sílaba cantada.');
  if(total*60/tempo>180)throw Error('A composição pode durar até 3 minutos.');
  return total;
}
export function fitLyrics(score,text){
  let syllables=splitLyrics(text),notes=score.filter(r=>r.note!==null);
  if(syllables.length!==notes.length)throw Error(`A melodia tem ${notes.length} notas e a letra tem ${syllables.length} sílabas. Ajuste a letra (use ~ para prolongar).`);
  let i=0;return score.map(row=>row.note===null?{...row}:{...row,...syllables[i++],pronunciation:''});
}
