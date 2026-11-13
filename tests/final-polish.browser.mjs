import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { testStagedTool } from './staged-tool-browser.mjs';

await testStagedTool('/', async ({page, width}) => {
  const editor = page.getByRole('textbox', {name:'Text editor input',exact:true});
  await editor.fill('A café 👨‍👩‍👧\nSecond line');
  await page.getByRole('button',{name:'UPPERCASE',exact:true}).click();
  assert.equal(await editor.inputValue(),'A CAFÉ 👨‍👩‍👧\nSECOND LINE');
  await page.getByRole('button',{name:/Undo/}).first().click();
  assert.equal(await editor.inputValue(),'A café 👨‍👩‍👧\nSecond line');
  const labels = await page.locator('aside[data-ad-placement]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')));
  assert.equal(new Set(labels).size, labels.length);
  if(width < 768) {
    const trigger=page.getByRole('button',{name:'Open menu',exact:true});
    await trigger.click();
    const dialog=page.getByRole('dialog',{name:'Menu',exact:true});
    await dialog.getByRole('textbox',{name:'Search tools',exact:true}).fill('zzzz-no-match');
    await dialog.getByRole('button',{name:'Show all tools',exact:true}).focus();
    for(const key of ['Tab','Tab','Shift+Tab','Shift+Tab']) {
      await page.keyboard.press(key);
      assert.ok(await page.evaluate(()=>document.querySelector('dialog')?.contains(document.activeElement)), key+' stays inside modal');
    }
    await dialog.getByRole('button',{name:'Show all tools',exact:true}).click();
    assert.ok(await dialog.getByRole('link').count()>20);
    await page.keyboard.press('Escape');
    await dialog.waitFor({state:'detached'});
    assert.ok(await trigger.evaluate(el=>el===document.activeElement));
    await trigger.click();
    await page.setViewportSize({width:1280,height:850});
    await dialog.waitFor({state:'detached'});
    assert.notEqual(await page.evaluate(()=>document.body.style.overflow),'hidden');
    await page.setViewportSize({width,height:850});
  }
  if(process.env.POLISH_SCREENSHOTS) {
    await mkdir(process.env.POLISH_SCREENSHOTS,{recursive:true});
    await editor.fill(''); await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:process.env.POLISH_SCREENSHOTS+'/'+width+'-home.png'});
  }
}, {indexable:true});

await testStagedTool('/text-cleaner/', async ({page}) => {
  const picker = page.locator('main input[type=file]').first();
  assert.notEqual(await picker.evaluate(el=>getComputedStyle(el).display),'none');
  await picker.focus();
  const chosen = page.waitForEvent('filechooser');
  await page.keyboard.press('Enter');
  await (await chosen).setFiles({name:'local-note.txt',mimeType:'text/plain',buffer:Buffer.from('  blue   sky  ')});
  const editor = page.locator('main textarea').first();
  await page.waitForFunction(()=>document.querySelector('main textarea').value==='  blue   sky  ');
  await page.getByRole('button',{name:'Clean text',exact:true}).click();
  assert.equal(await editor.inputValue(),'blue sky');
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('Permission denied'))}}));
  await page.getByRole('button',{name:'Copy text',exact:true}).click();
  const failure = page.getByText('Clipboard access failed. Select the text and copy it manually.',{exact:true});
  await failure.waitFor();
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{}}}));
  await page.getByRole('button',{name:'Copy text',exact:true}).click();
  await failure.waitFor({state:'detached'});
}, {indexable:true,widths:[320,1280]});
