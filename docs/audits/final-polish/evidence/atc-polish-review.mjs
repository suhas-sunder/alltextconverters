import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createRequire} from 'node:module';
const [base,build,out,pw,edge,kind]=process.argv.slice(2);
const {chromium}=createRequire(import.meta.url)(pw);
await mkdir(out,{recursive:true});
async function walk(dir,path='/'){
 const entries=await readdir(dir,{withFileTypes:true});
 return (entries.some(e=>e.name==='index.html')?[path]:[]).concat(...await Promise.all(entries.filter(e=>e.isDirectory()).map(e=>walk(join(dir,e.name),path+e.name+'/'))));
}
const all=await walk(build);
const representative=['/','/tools/','/table-to-list/','/csv-to-list/','/word-counter/','/text-cleaner/','/url-query-builder/','/text-diff/','/file-base64-converter/','/batch-text-files/','/json-formatter/','/html-markdown-converter/','/markdown-table-converter/','/about/'];
const browser=await chromium.launch({headless:true,executablePath:edge});
try {
for(const width of [320,375,768,1280,1920]){
 const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
 try{
 const page=await context.newPage();
 const rows=[];
 for(const path of (kind==='after'?representative:width===375?all:representative)){
 const response=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:20000});
 if(response?.status()!==200) throw Error(path+' status '+response?.status());
 await page.locator('main h1').waitFor();
 const record=await page.evaluate(()=>{
 const main=document.querySelector('main');
 return {title:document.title,description:document.querySelector('meta[name=description]')?.content,canonical:document.querySelector('link[rel=canonical]')?.href,robots:document.querySelector('meta[name=robots]')?.content??null,headings:[...main.querySelectorAll('h1,h2,h3')].map(e=>[e.tagName,e.textContent.trim()]),guide:document.querySelector('[aria-labelledby=route-guide-title]')?.innerText??'',links:[...main.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),schema:[...document.querySelectorAll('script[type="application/ld+json"]')].map(e=>JSON.parse(e.textContent)['@type']),width:document.documentElement.scrollWidth,ads:[...document.querySelectorAll('[data-ad-placement]')].map(e=>[e.dataset.adPlacement,e.getAttribute('aria-label')]),text:main.innerText.slice(0,18000)};
 });
 rows.push({path,...record});
 const name=path==='/'?'home':path.split('/')[1];
 if(width===375||representative.includes(path))await page.screenshot({path:join(out,width+'-'+name+'.png'),animations:'disabled',timeout:12000});
 }
 await writeFile(join(out,width+'.json'),JSON.stringify(rows,null,2));
 console.log(width,rows.length,rows.filter(r=>r.width>width).map(r=>r.path));
 }finally{await context.close()}
}
}finally{await browser.close()}
