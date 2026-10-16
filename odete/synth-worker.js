import { synthesize } from './synth.mjs';
self.onmessage=({data})=>{
  try{let result=synthesize(data);self.postMessage({ok:true,...result},[result.samples.buffer]);}
  catch(error){self.postMessage({ok:false,error:error.message});}
};
