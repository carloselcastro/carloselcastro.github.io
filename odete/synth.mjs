// Source-filter synthesizer. All sound is built from excitation and resonators;
// no recordings, speech services or operating-system voices are used.
import {validateScore} from './music.mjs';
export const SAMPLE_RATE = 22050;
export const VOWELS = {
  a: [730, 1090, 2440], e: [530, 1840, 2480], E: [610, 1900, 2600],
  i: [270, 2290, 3010], o: [570, 840, 2410], O: [500, 950, 2500],
  u: [300, 870, 2240], A: [620, 1220, 2550], I: [390, 1990, 2550],
  U: [440, 1020, 2240], '@': [500, 1500, 2500],
  AE:[660,1720,2410], AH:[640,1190,2390], ER:[490,1350,1690], AO:[570,840,2410]
};
const CONSONANTS = {
  m: [[250,1100,2100], .85, .03, .55], n: [[280,1700,2600], .8,.03,.55],
  N: [[300,2100,2800],.8,.03,.5], l: [[400,1200,2600],1,.01,.65],
  r: [[400,1300,1800],1,.03,.6], R: [[450,1200,2500],.25,.65,.45],
  w: [[300,700,2200],1,.01,.75], y: [[280,2200,3000],1,.01,.75],
  v: [[450,1500,2600],.5,.6,.5], z: [[350,3900,5500],.4,.7,.5],
  Z: [[400,2200,3500],.45,.6,.55], f: [[600,1600,3000],0,1,.5],
  s: [[700,4300,5800],0,1,.5], S: [[500,2100,3300],0,1,.6],
  h: [[700,1200,2600],0,.6,.45], p: [[600,1100,2500],0,.9,.65],
  t: [[500,2500,4500],0,1,.65], k: [[400,1800,3000],0,1,.65],
  b: [[400,1000,2200],.7,.45,.65], d: [[400,1700,2600],.7,.5,.65],
  g: [[350,1500,2400],.7,.5,.65], D:[[400,1500,2600],.6,.25,.6], T:[[500,1600,2800],0,.55,.5],
  J:[[400,2200,3500],.55,.65,.55]
};
const LEXICON = {
  daisy:'d e y z i', bell:'b E l', hello:'h @ l o w', human:'h y u m @ n',
  i:'a y', am:'AE m', give:'g I v', me:'m i', your:'y AO r', answer:'AE n s ER',
  do:'d u', im:'a y m', half:'h AE f', crazy:'k r e y z i', all:'AO l',
  for:'f AO r', the:'D @', love:'l AH v', of:'@ v', you:'y u',
  it:'I t', wont:'w o w n t', be:'b i', a:'@', stylish:'s t a y l I S',
  marriage:'m E r I J', cant:'k AE n t', afford:'@ f AO r d', carriage:'k AE r I J',
  but:'b AH t', youll:'y u l', look:'l U k', sweet:'s w i t', upon:'@ p AO n',
  seat:'s i t', bicycle:'b a y s I k @ l', built:'b I l t', two:'t u',
  welcome:'w E l k @ m', to:'t u', my:'m a y', laboratory:'l A b r @ t O r i',
  robot:'r o b O t', computer:'k @ m p y u t @ r', space:'s p e y s'
};
const DIGITS = ['zero','um','dois','tres','quatro','cinco','seis','sete','oito','nove'];
function portuguese(word,{wordStart=true,wordEnd=true,previousLetter=''}={}) {
  const original=word.toLowerCase().replace(/ç/g,'ss');
  let w = original.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const result=[];
  for(let i=0;i<w.length;i++) {
    let c=w[i], next=w[i+1]||'', pair=w.slice(i,i+2), prev=w[i-1]||'';
    let multi={nh:'N',lh:'l y',ch:'S',sh:'S',rr:'R',ss:'s',th:'t'}[pair];
    if(multi){result.push(...multi.split(' '));i++;continue;}
    if((c==='q'||c==='g')&&next==='u'&&/[ei]/.test(w[i+2]||' ')){result.push(c==='q'?'k':'g');i++;continue;}
    if('aeiou'.includes(c)) {
      let accented={é:'E',ê:'e',ó:'o',ô:'O',á:'a',í:'i',ú:'u'}[original[i]];
      result.push(accented||(wordEnd&&i===w.length-1?(c==='e'?'i':c==='o'?'u':c):c));
      if(/[ãõ]/.test(original[i]))result.push('n');
    } else if(c==='c')result.push(/[ei]/.test(next||' ')?'s':'k');
    else if(c==='g')result.push(/[ei]/.test(next||' ')?'Z':'g');
    else if(c==='j')result.push('Z');
    else if(c==='x')result.push('S');
    else if(c==='s')result.push(/[aeiouáéíóúãõêô]/.test(prev||previousLetter||' ')&&/[aeiou]/.test(next||' ')?'z':'s');
    else if(c==='r')result.push(i===0&&wordStart?'R':'r');
    else if(c==='h')continue;
    else if(CONSONANTS[c])result.push(c);
  }
  return result;
}
export function phonemes(text) {
  let normalized=text.toLowerCase().replace(/[’']/g,'').replace(/\d/g,d=>` ${DIGITS[+d]} `);
  return (normalized.match(/[a-zà-ÿ]+|[.,!?;:\n]/g)||[]).flatMap(word=>{
    if(/^[.,!?;:\n]$/.test(word)) return [{phone:'_',duration: /[,;:]/.test(word)?.16:.3}];
    let sequence=LEXICON[word]?.split(' ')||portuguese(word);
    return [...sequence.map(phone=>({phone,duration:VOWELS[phone]?.13: /[ptkbdg]/.test(phone)?.065:.085})),{phone:'_',duration:.045}];
  });
}
// First verse of the public-domain song (Harry Dacre, 1892), syllable by syllable.
// Notes in C major, 3/4. The score controls pitch independently of vowel resonances.
const SONG = [
 ['d e y',67,3,'Dai'],['z i',64,2.9,'sy'],['_',64,.1,''],
 ['d e y',60,3,'Dai'],['z i',55,2.9,'sy'],['_',55,.1,''],
 ['g I v',57,1,'give'],['m i',59,1,'me'],['y AO r',60,1,'your'],
 ['AE n',57,2,'an'],['s ER',60,1,'swer'],['d u',55,5,'do'],['_',55,1,''],
 ['a y m',62,3,"I'm"],['h AE f',67,3,'half'],['k r e y',64,3,'cra'],['z i',60,3,'zy'],
 ['AO l',57,1,'all'],['f AO r',59,1,'for'],['D @',60,1,'the'],
 ['l AH v',62,2,'love'],['@ v',64,1,'of'],['y u',62,4,'you'],['_',62,1,''],
 ['I t',64,1,'It'],['w o w n t',65,1,'wont'],['b i',64,1,'be'],
 ['@',62,1,'a'],['s t a y',67,2,'sty'],['l I S',64,1,'lish'],
 ['m E r',62,1,'mar'],['I J',60,4,'riage'],['_',60,0,''],
 ['a y',62,1,'I'],['k AE n t',64,2,'cant'],['@',60,1,'a'],['f AO r d',57,2,'fford'],
 ['@',60,1,'a'],['k AE r',57,1,'car'],['I J',55,3,'riage'],['_',55,1,''],
 ['b AH t',55,1,'But'],['y u l',60,2,'youll'],['l U k',64,1,'look'],
 ['s w i t',62,2,'sweet',1],['@',60,2,'u'],['p AO n',64,1,'pon'],
 ['D @',62,1,'the'],['s i t',64,1,'seat'],['_',64,0,''],
 ['@ v',65,1,'of'],['@',67,1,'a'],['b a y',64,1,'bi'],['s I',60,.5,'cy'],
 ['k @ l',60,.5,'cle'],['b I l t',62,2,'built'],['f AO r',55,1,'for'],['t u',60,5,'two']
];
export const SONG_TEXT = 'Daisy, Daisy, give me your answer, do. I’m half crazy, all for the love of you. It won’t be a stylish marriage, I can’t afford a carriage. But you’ll look sweet upon the seat of a bicycle built for two.';
export const SONG_SECTIONS={all:[0,58],answer:[6,12],love:[13,23],marriage:[24,40],bicycle:[41,58]};
export const SONG_SECTION_TEXT={all:SONG_TEXT,answer:'Give me your answer, do.',love:'I’m half crazy, all for the love of you.',marriage:'It won’t be a stylish marriage, I can’t afford a carriage.',bicycle:'But you’ll look sweet upon the seat of a bicycle built for two.'};
function singSyllable(phones,note,beats,lyric,tempo,eventIndex){
  const duration=beats*60/tempo;
  if(note===null||phones[0]==='_')return [{phone:'_',duration}];
  if(!phones.length)throw Error(`Não consegui pronunciar “${lyric}”. Escreva o som no campo Pronúncia.`);
  let vowels=phones.map((phone,i)=>VOWELS[phone]?i:-1).filter(i=>i>=0);
  if(!vowels.length)vowels=[phones.length-1];
  let consonantTimes=phones.map((phone,i)=>vowels.includes(i)?0:/^[sSZJ]$/.test(phone)?.085:/^[fvTD]$/.test(phone)?.065:/^[ptkbdg]$/.test(phone)?.04:.06);
  let consonantTotal=consonantTimes.reduce((a,b)=>a+b,0),scale=Math.min(1,duration*.38/(consonantTotal||1));
  let vowelTime=duration-consonantTotal*scale,weight=vowels.length===1?1:1+(vowels.length-1)*.3;
  return phones.map((phone,i)=>({phone,note,lyric,eventIndex,duration:vowels.includes(i)?vowelTime*(i===vowels[0]?1:.3)/weight:consonantTimes[i]*scale}));
}
function songSequence(tempo,section='all'){
  let range=SONG_SECTIONS[section];if(!range)throw Error('Escolha um trecho válido da música.');
  return SONG.slice(...range).flatMap(([phones,note,beats,lyric,restAfter=0],i)=>beats>0?[
    ...singSyllable(phones.split(' '),note-12,beats,lyric,tempo,i+range[0]),
    ...(restAfter?[{phone:'_',duration:restAfter*60/tempo}]:[])
  ]:[]);
}
function scoreSequence(score,tempo){
  validateScore(score,tempo);let lastVowel;
  return score.flatMap((row,i)=>{
    if(row.note===null||row.lyric==='_')return [{phone:'_',duration:row.beats*60/tempo}];
    let phones;
    if(row.lyric==='~'){
      if(!lastVowel)throw Error('A primeira nota precisa ter uma sílaba antes de usar ~.');phones=[lastVowel];
    }else{
      phones=portuguese(row.pronunciation?.trim()||row.lyric,row.pronunciation?{wordEnd:false}:row);
      lastVowel=phones.findLast(p=>VOWELS[p])||phones.at(-1);
    }
    return singSyllable(phones,row.note,row.beats,row.lyric,tempo,i);
  });
}
function smooth(t){return t*t*(3-2*t);}
export function synthesize({text='',mode='speech',section='all',score,pitch=0,rate=0,robotic=90,crush=0,tempo=112,f1=600,f2=1300}={}) {
  let sequence=mode==='custom'?scoreSequence(score,tempo):mode==='song'?songSequence(tempo,section):mode==='vowel'?[{phone:'a',label:'VOGAL',duration:2.3,formants:[f1,f2,2600]}]:phonemes(text.slice(0,1200));
  if(!sequence.some(s=>s.phone!=='_'))throw Error('Digite palavras com letras para sintetizar.');
  const speed=mode==='speech'?2**(rate/7):1, transpose=2**(pitch/12), sr=SAMPLE_RATE;
  let total=sequence.reduce((a,s)=>a+Math.ceil(s.duration/speed*sr),0)+Math.round(.12*sr);
  let samples=new Float32Array(total),levelsRms=new Float32Array(total),cues=[],offset=0,phase=0,previousGlottal=0,previousNoise=0,rng=1961;
  let states=Array.from({length:3},()=>[0,0]), previous=[500,1500,2500];
  let roboticMix=Math.max(0,Math.min(1,robotic/100)),previousLevel=0;
  for(let segmentIndex=0;segmentIndex<sequence.length;segmentIndex++){
    let segment=sequence[segmentIndex];
    let {phone}=segment, n=Math.ceil(segment.duration/speed*sr), start=offset/sr;
    if(phone==='_'){offset+=n;states.forEach(s=>s.fill(0));previousLevel=0;continue;}
    let vowel=VOWELS[phone], consonant=CONSONANTS[phone];
    let target=segment.formants||vowel||consonant?.[0]||VOWELS['@'];
    let voiced=vowel?1:consonant?.[1]||0, noise=vowel ? .008 : consonant?.[2]||0;
    let amp=vowel?1:consonant?.[3]||.5, stop=/^[ptkbdg]$/.test(phone);
    let phraseStart=segmentIndex===0||sequence[segmentIndex-1].phone==='_';
    let phraseEnd=segmentIndex===sequence.length-1||sequence[segmentIndex+1].phone==='_';
    let targetLevel=vowel ? .17 : stop ? .06 : voiced>.5 ? .12 : .075;
    const fundamental=(segment.note?440*2**((segment.note-69)/12):115)*transpose;
    cues.push({time:start,end:start+n/sr,phone:segment.label||phone,f1:target[0],f2:target[1],note:segment.note||null,lyric:segment.lyric||'',eventIndex:segment.eventIndex??null});
    let a1=[],a2=[],gain=[];
    for(let i=0;i<n;i++){
      let t=i/sr,u=i/n,glide=smooth(Math.min(1,t/(vowel ? .018 : .008)));
      if(i%32===0)for(let j=0;j<3;j++){
        let freq=previous[j]+(target[j]-previous[j])*glide;
        let bandwidth=(vowel?[65,90,140]:[100,150,220])[j];
        let r=Math.exp(-Math.PI*bandwidth/sr);
        a1[j]=2*r*Math.cos(2*Math.PI*freq/sr);a2[j]=-r*r;gain[j]=1-r;
      }
      let vibrato=1+(1-roboticMix)*.012*Math.sin(2*Math.PI*5.2*(offset+i)/sr);
      phase=(phase+fundamental*vibrato/sr)%1;
      // A smooth glottal opening/closure followed by radiation differentiation.
      let glottal=phase<.42?.5*(1-Math.cos(Math.PI*phase/.42)):phase<.58?Math.cos(Math.PI*(phase-.42)/.32):0;
      let excitation=(glottal-previousGlottal)*18;previousGlottal=glottal;
      rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;
      let white=(rng>>>0)/2147483648-1, hiss=(white-previousNoise)*.45;previousNoise=white;
      // Only fade at phrase edges. A vowel, nasal or fricative does not start
      // from silence at every phone boundary; stop closures remain explicit.
      let envelope=Math.min(1,phraseStart?i/(sr*.008):1,phraseEnd?(n-i)/(sr*.012):1);
      let closure=stop?(u<.42?.12:1):1;
      let burst=stop?(u<.42?0:Math.exp(-(u-.42)*segment.duration/.009)):1;
      let x=excitation*voiced*closure+white*noise*.35*burst;
      for(let j=0;j<3;j++){
        let state=states[j], y=gain[j]*x+a1[j]*state[0]+a2[j]*state[1];
        state[1]=state[0];state[0]=y;x=y;
      }
      let fricative=/^[sfSZzhfvTDJ]$/.test(phone)?hiss*noise*.006*(phone==='J'?Math.min(1,u*4):1):0;
      samples[offset+i]=(x+fricative)*amp*envelope;
      levelsRms[offset+i]=(previousLevel+(targetLevel-previousLevel)*smooth(Math.min(1,t/.012)))*envelope;
    }
    previousLevel=targetLevel;previous=[...target];offset+=n;
  }
  // Look-ahead loudness balancing over the continuous signal replaces separate
  // phone normalisation, which caused abrupt gain jumps at consonant/vowel joins.
  let energy=new Float64Array(total+1),balance=new Float32Array(total),radius=Math.round(sr*.016);
  for(let i=0;i<total;i++)energy[i+1]=energy[i]+samples[i]*samples[i];
  for(let i=0;i<total;i++){
    let lo=Math.max(0,i-radius),hi=Math.min(total,i+radius+1),rms=Math.sqrt(Math.max(0,energy[hi]-energy[lo])/(hi-lo));
    balance[i]=levelsRms[i]/Math.max(1e-6,rms);
  }
  let smoothing=1-Math.exp(-1/(sr*.006)),level=0;
  for(let i=0;i<total;i++){level+=smoothing*(balance[i]-level);balance[i]=level;}
  level=0;for(let i=total-1;i>=0;i--){level+=smoothing*(balance[i]-level);samples[i]=Math.tanh(samples[i]*level*1.15)/1.15;}
  let peak=0;for(let v of samples)peak=Math.max(peak,Math.abs(v));
  if(!Number.isFinite(peak)||peak===0)throw Error('Não foi possível produzir o sinal.');
  let gain=.82/peak, amount=Math.max(0,Math.min(100,crush))/100, levels=2**(15-amount*10), hold=1+Math.floor(amount*4), value=0;
  for(let i=0;i<samples.length;i++){if(i%hold===0)value=Math.round(samples[i]*gain*levels)/levels;samples[i]=Math.max(-.95,Math.min(.95,value));}
  return {samples,sampleRate:sr,cues,duration:samples.length/sr};
}
