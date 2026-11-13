import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)(process.env.TEMP+'/atc-browser-tools/node_modules/playwright-core');
const base=process.argv[2],out=process.env.TEMP+'/atc-polish-hosted-states';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const scopes=[
 ['/csv-json-converter/',['Load example','Convert table']],
 ['/compare-two-lists/',['Load example','Compare lists']],
 ['/text-diff/',['Load example','Compare text']],
 ['/unicode-inspector/',['Load example','Inspect text']],
 ['/url-query-builder/',['Fill example','Load parameters','Build output']],
 ['/html-markdown-converter/',['Fill example','Convert content']],
 ['/xml-formatter/',['Load example','Format XML']],
 ['/markdown-table-converter/',['Load example','Convert table']],
 ['/json-formatter/',[]],['/file-base64-converter/',[]],['/batch-text-files/',[]],
 ['/text-cleaner/',[]],['/comma-separated-to-list/',[]],['/',[]]
];
const records=[];
try{for(const width of [375,1280]){
 const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});const p=await context.newPage();p.setDefaultTimeout(15000);
 await p.route('**/*',route=>/googlesyndication|doubleclick|google-analytics|googletagmanager|fundingchoices/.test(route.request().url())?route.abort():route.continue());
 for(const [path,buttons]of scopes){
  await p.goto(base+path);for(const name of buttons)await p.getByRole('button',{name,exact:true}).click();
  if(path==='/json-formatter/'){await p.getByLabel('JSON source',{exact:true}).fill('{"invoice":9007199254740993,"city":"Montréal"}');await p.getByRole('button',{name:'Format JSON',exact:true}).click();await p.getByRole('status').filter({hasText:'JSON result ready.'}).waitFor();}
  if(path==='/file-base64-converter/'){await p.getByLabel('Open binary file',{exact:true}).setInputFiles({name:'local-demo.txt',mimeType:'text/plain',buffer:Buffer.from('Hello café')});await p.getByRole('button',{name:'Encode file',exact:true}).click();await p.getByRole('status').filter({hasText:'Base64 is ready.'}).waitFor();}
  if(path==='/batch-text-files/'){await p.getByLabel('Choose .txt files').setInputFiles([{name:'cities.txt',mimeType:'text/plain',buffer:Buffer.from('Toronto\nMontréal\nToronto')},{name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from([0xc3,0x28])}]);await p.getByLabel('Transformation').selectOption('deduplicate-lines');await p.getByRole('button',{name:'Convert files',exact:true}).click();await p.getByRole('heading',{name:'File results · 1 ready'}).waitFor();}
  if(path==='/text-cleaner/'){await p.locator('main textarea').first().fill('  blue   sky\nnext line  ');await p.getByRole('button',{name:'Clean text',exact:true}).click();}
  if(path==='/comma-separated-to-list/'){await p.locator('main textarea').first().fill('"Toronto, ON",Montréal');await p.getByRole('button',{name:'Convert to List',exact:true}).click();}
  if(path==='/'){await p.getByText('Multi-step text workflow',{exact:true}).click();await p.getByRole('textbox',{name:'Workflow source',exact:true}).fill('  red\n  blue');}
  if(path==='/text-diff/'||path==='/compare-two-lists/')await p.getByRole('heading',{name:'Comparison results',exact:true}).waitFor();
  if(path==='/unicode-inspector/')await p.getByLabel('Unicode inspection table',{exact:true}).waitFor();
  if(path==='/xml-formatter/')await p.getByRole('button',{name:'Copy XML',exact:true}).waitFor();
  if(path==='/html-markdown-converter/')await p.getByRole('status').filter({hasText:'Conversion complete'}).waitFor();
  if(path==='/markdown-table-converter/')await p.getByRole('status').filter({hasText:'converted.'}).waitFor();
  if(path==='/csv-json-converter/')await p.getByRole('status').filter({hasText:'Converted '}).waitFor();
  const name=path==='/'?'workflow':path.split('/')[1];
  await p.screenshot({path:out+'/'+width+'-'+name+'-result.png',animations:'disabled'});
  if(path==='/text-diff/'||path==='/compare-two-lists/')await p.getByRole('heading',{name:'Comparison results',exact:true}).scrollIntoViewIfNeeded();
  else if(path==='/batch-text-files/')await p.getByRole('heading',{name:'File results · 1 ready'}).scrollIntoViewIfNeeded();
  else if(path==='/file-base64-converter/')await p.getByRole('heading',{name:'Base64 result',exact:true}).scrollIntoViewIfNeeded();
  if(['/text-diff/','/compare-two-lists/','/batch-text-files/','/file-base64-converter/'].includes(path))await p.screenshot({path:out+'/'+width+'-'+name+'-detail.png',animations:'disabled'});
  if(path==='/text-cleaner/'){
   await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('Denied'))}}));
   await p.getByRole('button',{name:'Copy text',exact:true}).click();
   await p.getByRole('alert').filter({hasText:'Clipboard access failed.'}).waitFor();
   await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:out+'/'+width+'-clipboard-error.png',animations:'disabled'});
  }
  records.push({width,path,overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  if(path==='/text-cleaner/'||path==='/comma-separated-to-list/'){
   await p.locator('#how-it-works').screenshot({path:out+'/'+width+'-'+name+'-guide.png'});
   await p.locator('#faq details').first().locator('summary').click();await p.locator('#faq').screenshot({path:out+'/'+width+'-'+name+'-faq.png'});
  }
 }
 if(width===375){await p.goto(base+'/');await p.getByRole('button',{name:'Open menu',exact:true}).click();await p.getByRole('textbox',{name:'Search tools',exact:true}).fill('no-such-tool-xyz');await p.screenshot({path:out+'/375-menu.png'});await p.keyboard.press('Escape');await p.emulateMedia({colorScheme:'dark'});await p.screenshot({path:out+'/375-dark-preference.png'});}
 await context.close();console.log('Captured states at',width);
}await writeFile(out+'/states.json',JSON.stringify(records,null,2));}finally{await browser.close();}
