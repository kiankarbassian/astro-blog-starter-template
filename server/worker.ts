interface Env { ASSETS: { fetch(request: Request): Promise<Response> }; AI: { run(model:string, input:Record<string,unknown>):Promise<any> }; }
const requests = new Map<string, {count:number; expires:number}>();
export default {
 async fetch(request:Request, env:Env):Promise<Response> {
  const url=new URL(request.url);
  if(url.pathname!=='/api/generate') return env.ASSETS.fetch(request);
  const json=(message:string,status:number)=>Response.json({error:message},{status});
  if(request.method!=='POST') return json('Use POST.',405);
  if(request.headers.get('origin')!==url.origin) return json('Request origin is not allowed.',403);
  if(!env.AI) return json('The live demo is not connected yet. Try again once the API key is configured.',503);
  if(Number(request.headers.get('content-length'))>4096) return json('Please use a shorter prompt.',413);
  const ip=request.headers.get('CF-Connecting-IP')||'local';
  const now=Date.now();
  for(const [key,value] of requests) if(value.expires<now) requests.delete(key);
  const entry=requests.get(ip)||{count:0,expires:now+60000};
  if(entry.count>=10)return json('You’ve tried 10 questions this minute. Please wait a moment before trying another.',429);
  let prompt:string;
  try{const body=await request.text();if(body.length>4096)return json('Please use a shorter prompt.',413);prompt=JSON.parse(body).prompt;if(typeof prompt!=='string'||!prompt.trim()||prompt.length>240)return json('Enter a prompt of 1–240 characters.',400);}catch{return json('Please enter a valid prompt.',400);}
  entry.count++;requests.set(ip,entry);
  try{
   const data=await env.AI.run('@cf/qwen/qwen3.8-27b', {
    messages:[{role:'system',content:'You are answering in a compact educational portfolio demo. Answer in one concise sentence of at most 20 words. Give only the direct answer, with no introduction, follow-up question, lists, or extra explanation. Do not include internal reasoning.'},{role:'user',content:prompt}],
    logprobs:true,top_logprobs:5,temperature:0.7,max_completion_tokens:64,
    chat_template_kwargs:{enable_thinking:false},stream:true
   });
   return new Response(data as ReadableStream,{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-store'}});
  }catch(error){const message=error instanceof Error?error.message:'';const quota=/quota|neuron|rate limit|429/i.test(message);return json(quota?'The demo has reached its daily AI allowance or is busy. Please try again later.':'The model is unavailable. Please try again.',quota?429:502);}
 }
};
