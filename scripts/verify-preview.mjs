// Read-only validation of this branch's public Netlify preview. No deployment
// command, secrets or authenticated third-party requests are used here.
import {chromium,expect} from '@playwright/test';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const base='https://deploy-preview-5--beautiful-syrniki-085a32.netlify.app';
const output='test-results/deployed';
const hash=s=>createHash('sha256').update(s).digest('hex');
const expected=hash(await readFile('ux.css'));
let matched=false;
for(let attempt=0;attempt<12;attempt++){
 try{
  const response=await fetch(base+'/ux.css?verify='+Date.now(),{signal:AbortSignal.timeout(12000)});
  if(response.ok&&hash(await response.text())===expected){matched=true;break}
 }catch{}
 await new Promise(resolve=>setTimeout(resolve,5000));
}
if(!matched)throw new Error('Deployed stylesheet does not match this build');
await mkdir(output,{recursive:true});
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},locale:'fr-FR',colorScheme:'light'});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 // Only the external video provider is excluded from UI checks, never site assets.
 await page.route(/youtube|google|simpleicons|wikimedia|flagcdn|git-fork|jsdelivr/,r=>r.abort());
 const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 if(!response?.ok())throw new Error('Preview HTTP status: '+response?.status());
 await expect(page.locator('html')).toHaveAttribute('data-design','atelier-2026');
 await expect(page.locator('.project-caption')).toHaveCount(4);
 await expect(page.locator('.case-tile')).toHaveCount(3);
 await page.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));
 await page.evaluate(()=>Promise.all([...document.images].filter(i=>i.src).map(i=>i.decode().catch(()=>null))));
 await page.waitForTimeout(700);
 await page.screenshot({path:output+'/opening-day.png'});
 await page.locator('#themeBtn').click();await page.waitForTimeout(800);
 await page.screenshot({path:output+'/opening-night.png'});
 await page.locator('#themeBtn').click();
 await page.locator('#primaryNav a[href="#projects"]').click();await expect(page).toHaveURL(/#projects$/);
 await page.waitForTimeout(750);await page.mouse.move(3,3);
 await page.screenshot({path:output+'/projects.png'});
 await page.locator('.project-caption h3 a').first().click();await expect(page.locator('.modal--project')).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('.modal')).toHaveCount(0);
 await page.locator('#primaryNav a[href="#cases"]').click();await page.waitForTimeout(700);
 await page.screenshot({path:output+'/articles.png'});
 await page.locator('.case-title a').first().click();await expect(page.locator('.modal--case-study')).toBeVisible();
 await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('.modal--case-study')).toBeVisible();
 await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.waitForTimeout(700);await page.screenshot({path:output+'/mobile-opening.png'});
 await page.locator('#navToggle').click();await page.locator('#primaryNav a[href="#cases"]').click();
 await expect(page.locator('#navToggle')).toHaveAttribute('aria-expanded','false');
 await page.locator('.case-tile').first().screenshot({path:output+'/mobile-article.png'});
 if(errors.length)throw new Error(errors.join('\n'));
 await writeFile(output+'/verification.json',JSON.stringify({url:base,commit:process.env.GITHUB_SHA,stylesheetSHA256:expected,actualDeployedSite:true,checks:['HTTP success','matching CSS bytes','day/night','4 projects before 3 articles','project modal','article reload','mobile navigation'],externalVideoPlaybackTested:false,errors},null,2));
 console.log('Verified live preview: matching stylesheet, day/night and core navigation');
}finally{await browser.close()}
