// Verify hosted bytes after deployment. No browser, GPU, or external credentials.
import {readdirSync,readFileSync,writeFileSync,lstatSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {setTimeout as delay} from 'node:timers/promises';
const [mode,directory,origin]=process.argv.slice(2);
if(!['stamp','verify'].includes(mode)||!directory) throw Error('Usage: stamp|verify ASSET_DIRECTORY [HTTPS_ORIGIN]');
const root=resolve(directory),receiptName='_ci-release.json';
const hash=b=>createHash('sha256').update(b).digest('hex');
const revision=execFileSync('git',['rev-parse','--verify','HEAD'],{encoding:'utf8'}).trim();
if(!/^[a-f0-9]{40}$/.test(revision)) throw Error('No exact Git revision');
for(const key of ['GITHUB_SHA','WORKERS_CI_COMMIT_SHA']) {
 const value=process.env[key]||'';
 if(/^[a-f0-9]{40}$/.test(value)&&value!==revision) throw Error(`${key} disagrees with checkout`);
}
const decoded=b=>b[0]===31&&b[1]===139?gunzipSync(b):b;
function collect(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
 if(e.name.startsWith('.')||['_headers','_redirects','_worker.js',receiptName].includes(e.name)) return [];
 const file=join(dir,e.name);
 if(lstatSync(file).isSymbolicLink()) throw Error('Refusing symlink in published manifest');
 return e.isDirectory()?collect(file):e.isFile()?[file]:[];
});}
const receiptFile=join(root,receiptName);
if(mode==='stamp'){
 const files=collect(root).sort().map(file=>{const b=decoded(readFileSync(file));return {path:relative(root,file).split('\\').join('/'),bytes:b.length,sha256:hash(b)};});
 if(!files.some(f=>f.path==='index.html')) throw Error('Missing HTML entry point');
 writeFileSync(receiptFile,JSON.stringify({schema:1,commit:revision,files})+'\n');
 console.log('CI_STAMPED',JSON.stringify({commit:revision,files:files.length}));
}else{
 const base=new URL(origin);
 if(base.protocol!=='https:'||base.username||base.password||base.pathname!=='/'||base.search||base.hash) throw Error('Expected HTTPS origin');
 const local=readFileSync(receiptFile),receipt=JSON.parse(local);
 if(receipt.commit!==revision) throw Error('Receipt is from another revision');
 async function verify(file){
  // Wait for the new manifest to propagate before verifying every published byte.
  const manifest=file.path===receiptName,attempts=manifest?24:3;
  let last;for(let attempt=0;attempt<attempts;attempt++){
  try{
   let url=new URL(file.path==='index.html'?'/':file.path.split('/').map(encodeURIComponent).join('/'),base);url.searchParams.set('ci_revision',revision);
   let r;for(let redirects=0;redirects<5;redirects++){
    r=await fetch(url,{redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(30000)});
    if(![301,302,303,307,308].includes(r.status)) break;
    if(!r.headers.get('location')) throw Error('Redirect without Location');
    url=new URL(r.headers.get('location'),url);
    if(url.origin!==base.origin) throw Error('Cross-origin redirect');
    await r.body?.cancel();
   }
   if(!r.ok) throw Error(`HTTP ${r.status}`);
   const b=decoded(Buffer.from(await r.arrayBuffer()));
   if(b.length!==file.bytes||hash(b)!==file.sha256) throw Error('Content hash mismatch');
   const type=r.headers.get('content-type')||'';
   if(/\.(m?js)$/.test(file.path)&&!type.includes('javascript')) throw Error('Incorrect JavaScript MIME');
   if(/\.css$/.test(file.path)&&!type.includes('text/css')) throw Error('Incorrect CSS MIME');
   if(/\.wasm$/.test(file.path)&&!type.includes('application/wasm')) throw Error('Incorrect WASM MIME');
   return;
  }catch(error){last=error;if(attempt<attempts-1){
   if(manifest) console.log(`Waiting for published manifest (${attempt+1}/${attempts}): ${error.message}`);
   await delay(manifest?5000:1000*(attempt+1));
  }}
 }throw Error(`${file.path}: ${last.message}`);}
 await verify({path:receiptName,bytes:local.length,sha256:hash(local)});
 for(let i=0;i<receipt.files.length;i+=4) await Promise.all(receipt.files.slice(i,i+4).map(verify));
 console.log('CI_VERIFIED',JSON.stringify({origin:base.origin,commit:revision,files:receipt.files.length,manifestSha256:hash(local)}));
}
