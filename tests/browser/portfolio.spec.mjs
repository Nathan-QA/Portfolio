import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
const project='/projets/distant-shore-bretagne/';
const article='/carnet/distant-shore-readability/';
async function settled(page) {
  await page.evaluate(async()=>{for(const details of document.querySelectorAll('details'))details.open=true;await Promise.all([...document.images].filter(img=>img.getAttribute('src')).map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));});
  await page.waitForTimeout(180);
}
test('project URLs reload, browser back restores the collection, language stays on the project', async ({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/'); await page.locator('.project-featured').click();
  await expect(page).toHaveURL(project); await page.reload();
  await expect(page.locator('h1')).toContainText('Distant Shore');
  await page.locator('.lang-link').click(); await expect(page).toHaveURL('/en/projects/distant-shore-bretagne/');
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await page.goBack();await expect(page).toHaveURL(project);
  await page.goBack();await expect(page).toHaveURL('/');
  expect(errors).toEqual([]);
});
test('legacy case/project links and old section anchors survive',async({page})=>{
  await page.goto('/#project=dordogne');await expect(page).toHaveURL('/projets/dordogne/');
  await page.goto('/#kase=distant-shore-readability');await expect(page).toHaveURL(article);
  await page.goto('/#cases');await expect(page).toHaveURL('/#journal');
});
test('theme survives navigation and reload and respects the system default',async({page})=>{
  await page.emulateMedia({colorScheme:'dark'});await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('.theme-toggle').click();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.goto(article);await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});
test('journal search, project filtering, URL state and empty-state reset work',async({page})=>{
  await page.goto('/carnet/');
  const total=await page.locator('[data-filter-item]').count();
  const qaCount=await page.locator('[data-filter-item][data-projects~=dordogne]').count();
  const prodCount=await page.locator('[data-filter-item][data-categories~=production]').count();
  await page.locator('select[name=project]').selectOption('dordogne');
  await expect(page.locator('[data-filter-item]:visible')).toHaveCount(qaCount);
  await page.reload();await expect(page.locator('select[name=project]')).toHaveValue('dordogne');
  await expect(page.locator('[data-filter-item]:visible')).toHaveCount(qaCount);
  await page.locator('input[name=q]').fill('not-a-real-project');
  await expect(page.locator('.empty-state')).toBeVisible();
  await page.locator('[data-reset-filters]').click();await expect(page.locator('[data-filter-item]:visible')).toHaveCount(total);
  await page.locator('[data-filter=production]').click();await expect(page.locator('[data-filter-item]:visible')).toHaveCount(prodCount);
  await expect(page).toHaveURL(/type=production/);
});
test('mobile menu is keyboard-operable and closes on Escape and navigation',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  await page.locator('.menu-toggle').focus();await page.keyboard.press('Enter');
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('.mobile-cv')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.locator('.menu-toggle')).toBeFocused();
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded','false');
  await page.locator('.menu-toggle').click();await page.locator('#primary-nav [data-nav=journal]').click();
  await expect(page).toHaveURL('/#journal');await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded','false');
});
test('gallery opens, changes image, closes with Escape and returns focus',async({page})=>{
  await page.goto(project);const image=page.locator('a[data-gallery]').first();await image.click();
  await expect(page.locator('dialog')).toBeVisible();
  const first=await page.locator('dialog figure img').getAttribute('src');
  await page.keyboard.press('ArrowRight');await expect(page.locator('dialog figure img')).not.toHaveAttribute('src',first);
  await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible();await expect(image).toBeFocused();
});
test('motion follows reduced-motion and can otherwise be paused persistently',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion','off');await expect(page.locator('#leaf-canvas')).not.toBeVisible();
  await page.emulateMedia({reducedMotion:'no-preference'});await expect(page.locator('html')).toHaveAttribute('data-motion','on');
  await page.locator('.motion-toggle').click();await page.reload();await expect(page.locator('html')).toHaveAttribute('data-motion','off');
});
test('tree follows scroll without replacing native page scrolling',async({page})=>{
  await page.goto('/');const initial=await page.locator('.tree').evaluate(x=>getComputedStyle(x).transform);
  await page.evaluate(()=>scrollTo({top:1800,behavior:'instant'}));await page.waitForTimeout(200);
  const later=await page.locator('.tree').evaluate(x=>getComputedStyle(x).transform);expect(later).not.toBe(initial);
  expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(1700);
});
test('all content is server-rendered and navigable without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/');await expect(page.locator('.project-card')).toHaveCount(4);
  await page.locator('.project-featured').click();await expect(page.locator('h1')).toContainText('Distant Shore');
  await page.goto('http://127.0.0.1:4173'+article);await expect(page.locator('.article-prose h2')).toHaveCount(8);
  await context.close();
});
test('all pages load assets without page errors or broken local requests',async({page})=>{
  const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)requests.push(r.url());});
  const manifest=await(await page.request.get('/build-report.json')).json();
  for(const url of manifest.pages){await page.goto(url);await settled(page);const broken=await page.locator('img[src]').evaluateAll(images=>images.filter(x=>!x.closest('dialog')&&(!x.complete||!x.naturalWidth)).map(x=>x.src));expect(broken,url).toEqual([]);}
  expect(errors).toEqual([]);expect(requests).toEqual([]);
});
for(const width of [320,390,768,1440])test(`no horizontal overflow at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  for(const url of ['/',project,article,'/carnet/','/skills/','/en/']){await page.goto(url);await expect(page.locator('h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth),url).toBeLessThanOrEqual(width);}
});
for(const theme of ['light','dark'])test(`accessibility checks in ${theme} theme`,async({page})=>{
  test.setTimeout(120000);
  await page.addInitScript(theme=>localStorage.setItem('pref-theme',theme),theme);
  for(const url of ['/',project,article,'/carnet/','/skills/']){
    await page.goto(url);await settled(page);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(result.violations.map(v=>({id:v.id,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),`${url} ${theme}`).toEqual([]);
  }
});
test('404 responds with a genuine 404 and offers a way home',async({page})=>{
  const response=await page.goto('/missing-page/');expect(response.status()).toBe(404);await expect(page.locator('h1')).toContainText('chemin');
});
test('capture day, night, mobile and reading views',async({page,browserName})=>{
  await mkdir('screenshots',{recursive:true});
  for(const [name,url,width,height,theme]of[['home-day','/',1440,1000,'light'],['home-night','/',1440,1000,'dark'],['home-mobile','/',390,844,'light'],['home-mobile-night','/',390,844,'dark'],['project',project,1440,1000,'light'],['article',article,1440,1000,'light']]){
    await page.setViewportSize({width,height});await page.goto(url);await page.evaluate(theme=>{localStorage.setItem('pref-theme',theme);localStorage.setItem('pref-motion','off');},theme);await page.reload();await settled(page);
    const total=await page.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<total;y+=height)await page.evaluate(y=>scrollTo(0,y),y);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);
    await page.screenshot({path:`screenshots/${browserName}-${name}.png`,fullPage:true});
  }
});
