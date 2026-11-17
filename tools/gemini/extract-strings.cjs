const fs=require('fs'),path=require('path')
const skip=/celebData|koname|engine\/|constants|legal|\.test\./
const files=[];(function w(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);fs.statSync(p).isDirectory()?w(p):/\.ts$/.test(p)&&files.push(p)}})('src')
const re=/(['"`])((?:\\.|(?!\1).)*?)\1/g
let items=[],id=0
for(const f of files){ if(skip.test(f))continue
  const s=fs.readFileSync(f,'utf8'); let m
  while((m=re.exec(s))){ const t=m[2]; if(!/[가-힣]/.test(t))continue
    items.push({id:'s'+(id++),file:f.replace('src/',''),ko:t.replace(/\\'/g,"'").replace(/\\n/g,'\n'),vars:/\$\{/.test(t)}) } }
const seen=new Map();const uniq=[]
for(const it of items){ if(!seen.has(it.ko)){seen.set(it.ko,it.id);uniq.push(it)} }
fs.writeFileSync('tools/gemini/i18n/all.json',JSON.stringify(uniq,null,1))
const N=Number(process.env.N||120);let b=0
for(let i=0;i<uniq.length;i+=N){fs.writeFileSync(`tools/gemini/i18n/batch-${String(b++).padStart(3,'0')}.json`,JSON.stringify(uniq.slice(i,i+N).map(x=>({id:x.id,ko:x.ko})),null,0))}
console.log('total',items.length,'unique',uniq.length,'withVars',uniq.filter(x=>x.vars).length,'batches',b,'chars',uniq.reduce((a,x)=>a+x.ko.length,0))
