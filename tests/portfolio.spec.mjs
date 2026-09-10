import {test, expect} from '@playwright/test';
import fs from 'node:fs/promises';
const article='/journal/distant-shore-readability/';
const project='/projets/distant-shore-bretagne/';

test('home preserves all projects and journal entries with a clear hierarchy', async({page})=>{
 await page.goto('/');
 await expect(page.locator('#projects .project-card')).toHaveCount(4);
 await expect(page.locator('#journal .journal-card')).toHaveCount(3);
 await expect(page.locator('#skills .expertise-card')).toHaveCount(3);
 await expect(page.locator('h1')).toContainText('L’intention devient');
 await expect(page.getByRole('link',{name:'Long Time A Girl',exact:true}).first()).toBeVisible();
 await page.locator('.hero-actions a').first().click();
 await expect(page).toHaveURL(/#projects$/);
 await expect(page.locator('.primary-nav a[href="/#projects"]')).toHaveAttribute('aria-current','location');
});

test('day and night persist through navigation and refresh',async({page})=>{
 await page.emulateMedia({colorScheme:'light'});await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.locator('[data-theme-toggle]').click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.goto(project);await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.locator('[data-theme-toggle]').click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});

test('system theme works until an explicit choice is made',async({page})=>{
 await page.emulateMedia({colorScheme:'dark'});await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.emulateMedia({colorScheme:'light'});
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});

test('language switch preserves the current article',async({page})=>{
 await page.goto(article);await page.locator('.language-switch').click();
 await expect(page).toHaveURL('/en/journal/distant-shore-readability/');
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await expect(page.locator('h1')).toContainText('Revamping the Steam demo');
 await page.locator('.language-switch').click();await expect(page).toHaveURL(article);
});

test('real project/article routes survive refresh and browser history',async({page})=>{
 await page.goto('/');await page.locator('#projects .project-feature h3 a').click();
 await expect(page).toHaveURL(project);await page.reload();await expect(page.locator('h1')).toContainText('Distant Shore');
 await page.locator('.journal-card h3 a').click();await expect(page).toHaveURL(article);
 await page.goBack();await expect(page).toHaveURL(project);
 await page.goBack();await expect(page).toHaveURL('/');
});

test('article table of contents keeps its fragment on reload',async({page})=>{
 await page.goto(article);await page.locator('.toc a[href="#section-3"]').click();
 await expect(page).toHaveURL(/#section-3$/);await page.reload();
 await expect(page).toHaveURL(/#section-3$/);
 await expect.poll(()=>page.locator('#section-3').evaluate(el=>Math.abs(el.getBoundingClientRect().top))).toBeLessThan(250);
});

test('legacy project and case-study links redirect, ordinary anchors remain intact',async({page})=>{
 await page.goto('/#project=dordogne');await expect(page).toHaveURL('/projets/dordogne/');
 await page.goto('/#kase=distant-shore-readability');await expect(page).toHaveURL(article);
 await page.goto('/#cases');await expect(page).toHaveURL('/#journal');
 await page.goto('/#contact');await expect(page).toHaveURL('/#contact');
});

test('journal filters, accent-insensitive search and empty state',async({page})=>{
 await page.goto('/journal/');
 await page.locator('[data-filter="qa"]').click();
 await expect(page.locator('.journal-card:visible')).toHaveCount(1);
 await expect(page.locator('.journal-card:visible')).toContainText('Un retour de test');
 await page.locator('[data-filter="all"]').click();
 await page.locator('[data-search-input]').fill('magnétique');
 await expect(page.locator('.journal-card:visible')).toHaveCount(1);
 await page.reload();await expect(page.locator('[data-search-input]')).toHaveValue('magnétique');
 await page.locator('[data-search-input]').fill('inexistant-xyz');await expect(page.locator('[data-empty]')).toBeVisible();
 await page.locator('[data-reset]').click();await expect(page.locator('.journal-card:visible')).toHaveCount(3);
 await expect(page.locator('[data-search-input]')).toBeFocused();
});

test('project filter exposes the correct disciplines',async({page})=>{
 await page.goto('/projets/');await page.locator('[data-filter="production"]').click();
 await expect(page.locator('.project-card:visible')).toHaveCount(1);
 await expect(page.locator('.project-card:visible h3')).toHaveText('PYLA');
 await page.locator('[data-filter="design"]').click();await expect(page.locator('.project-card:visible')).toHaveCount(2);
});

test('lightbox provides keyboard navigation and returns focus',async({page})=>{
 await page.goto(project);const opener=page.locator('[data-lightbox]').first();await opener.click();
 await expect(page.locator('dialog')).toBeVisible();await expect(page.locator('dialog [data-close]')).toBeFocused();
 await expect(page.locator('dialog figcaption')).toContainText('1 /');
 await page.keyboard.press('ArrowRight');await expect(page.locator('dialog figcaption')).toContainText('2 /');
 await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible();await expect(opener).toBeFocused();
});

test('mobile menu closes on navigation and Escape',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 const menu=page.locator('.menu-toggle');await expect(menu).toBeVisible();await menu.click();
 await expect(menu).toHaveAttribute('aria-expanded','true');await page.locator('.primary-nav a[href="/#journal"]').click();
 await expect(page).toHaveURL('/#journal');await expect(menu).toHaveAttribute('aria-expanded','false');
 await menu.click();await page.keyboard.press('Escape');await expect(menu).toHaveAttribute('aria-expanded','false');await expect(menu).toBeFocused();
});

test('linked skills open their corresponding disclosure',async({page})=>{
 await page.goto('/competences/');const skill=page.locator('.skill-item').first();const id=await skill.getAttribute('id');
 await expect(page.locator('.skill-item')).toHaveCount(29);
 await page.goto('/competences/#'+id);await expect(page.locator('#'+id)).toHaveAttribute('open','');
});

test('reduced motion and the user pause switch disable animation',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('data-motion','off');
 await expect(page.locator('[data-motion-toggle]')).toBeDisabled();
 await page.emulateMedia({reducedMotion:'no-preference'});await expect(page.locator('html')).toHaveAttribute('data-motion','on');
 await page.locator('[data-motion-toggle]').click();await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-motion','off');
});

for(const width of [320,390,768,1024,1440])test(`no horizontal overflow at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 for(const route of ['/',article,project,'/competences/','/en/journal/']){
  await page.goto(route);await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});

test('content and links remain usable without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4173/');await expect(page.locator('#projects .project-card')).toHaveCount(4);
 await page.locator('#projects h3 a').first().click();await expect(page.locator('h1')).toContainText('Distant Shore');
 await page.locator('.journal-card h3 a').click();await expect(page.locator('.article-prose section')).toHaveCount(10);
 await context.close();
});

test('all routes are free of JavaScript exceptions and failed local resources',async({page})=>{
 test.setTimeout(60000);
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:4173')&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 const info=JSON.parse(await fs.readFile('dist/build-info.json','utf8'));
 for(const route of info.pages){
  await page.goto(route);
  await page.locator('img[loading="lazy"]').evaluateAll(images=>images.forEach(i=>i.loading='eager'));
  const broken=await page.evaluate(async()=>{
   const images=[...document.images].filter(i=>i.src);
   await Promise.all(images.map(i=>i.decode().catch(()=>null)));
   return images.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src);
  });
  errors.push(...broken.map(src=>`Undecodable image: ${src}`));
 }
 expect(errors).toEqual([]);
});

test('visual captures: day, night, scrolled tree, mobile and article',async({page},testInfo)=>{
 await page.emulateMedia({colorScheme:'light'});await page.goto('/');
 async function ready(){await page.locator('img[loading="lazy"]').evaluateAll(images=>images.forEach(i=>i.loading='eager'));await page.evaluate(()=>Promise.all([...document.images].filter(i=>i.src).map(i=>i.decode().catch(()=>null))));}
 await ready();await page.screenshot({path:testInfo.outputPath('home-day.png'),fullPage:true});
 await page.locator('[data-theme-toggle]').click();await page.waitForTimeout(1000);await page.screenshot({path:testInfo.outputPath('home-night.png'),fullPage:true});
 await page.locator('#projects').scrollIntoViewIfNeeded();await page.waitForTimeout(1200);await page.screenshot({path:testInfo.outputPath('tree-scroll.png')});
 await page.locator('[data-theme-toggle]').click();await page.setViewportSize({width:390,height:844});await page.goto('/');await ready();await page.screenshot({path:testInfo.outputPath('home-mobile.png'),fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.goto(article);await ready();await page.screenshot({path:testInfo.outputPath('article.png'),fullPage:true});
});
