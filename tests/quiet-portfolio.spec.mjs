import {test,expect} from '@playwright/test';
async function ready(page){
 await page.goto('/');await expect(page.locator('.ux-article-meta')).toHaveCount(3);
}
test.beforeEach(async({page})=>{
 await page.route(/youtube|google|simpleicons|wikimedia|flagcdn|git-fork|jsdelivr/,r=>r.abort());
});
test('production, QA and level design are the actual bilingual positioning',async({page})=>{
 await ready(page);await expect(page.locator('h1')).toContainText('Production,');await expect(page.locator('h1')).toContainText('QA & Level Design');
 await expect(page).toHaveTitle(/Production, QA/);
 await expect(page.locator('#about .hero-profile>div>span')).toHaveText(['Production','QA','Level Design']);
 await expect(page.locator('#heroDesc')).toContainText('Dordogne');
 await page.locator('#langBtn').click();await expect(page.locator('#heroDesc')).toContainText('I’ve worked');
 await expect(page.locator('h1')).toContainText('Production,');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','en');
});
test('homepage offers one project entry and one contact mail link',async({page})=>{
 await ready(page);await expect(page.locator('.hero-cta,.project-cta,.ux-related-article,.case-link')).toHaveCount(0);
 for(const card of await page.locator('.project-tile').all())await expect(card.locator('a')).toHaveCount(1);
 await expect(page.locator('#contactMount a[href^="mailto:"]')).toHaveCount(1);
 await expect(page.locator('#contactMount [data-copy-email]')).toHaveCount(1);
 await expect(page.locator('#contactMount a[download]')).toHaveCount(0);
 await expect(page.locator('.section-intro')).toHaveCount(0);
});
test('copy email utility works without a second mail CTA',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.copiedEmail=text}}));
 await ready(page);await page.locator('[data-copy-email]').click();
 expect(await page.evaluate(()=>window.copiedEmail)).toBe('tandille.nathan@gmail.com');
 await expect(page.locator('#uxStatus')).toContainText('Adresse e-mail copiée');
});
test('project context stays available but does not precede contributions',async({page})=>{
 await ready(page);await page.locator('[data-project-id="pyla"] h3 a').click();
 await expect(page.locator('.ux-project-context')).toBeVisible();await expect(page.locator('.ux-project-context')).not.toHaveAttribute('open','');
 await expect(page.locator('.modal-body>.project-section')).toBeVisible();
 await page.locator('.ux-project-context>summary').click();await expect(page.locator('.project-info')).toBeVisible();
 await expect(page.locator('.project-lead')).toBeVisible();
});
test('no script or iframe is requested for hover previews at startup',async({page})=>{
 const urls=[];page.on('request',r=>urls.push(r.url()));await ready(page);await page.waitForTimeout(400);
 expect(urls.filter(u=>/youtube/.test(u))).toEqual([]);await expect(page.locator('.project-preview')).toHaveCount(0);
});
// Provider contract tests, not a claim that YouTube itself is available in CI.
async function fakeYouTube(page){
 await page.addInitScript(()=>{
  window.previewLog=[];window.previewMode='playing';window.previewDelay=20;
  window.YT={Player:class {
   constructor(mount,options){
    this.options=options;this.frame=document.createElement('iframe');this.frame.src='about:blank';mount.replaceWith(this.frame);
    window.previewLog.push({event:'create',id:options.videoId,vars:options.playerVars,host:options.host});
    setTimeout(()=>options.events.onReady({target:this}),window.previewDelay);
   }
   getIframe(){return this.frame;}
   mute(){window.previewLog.push({event:'mute'});}
   playVideo(){
    window.previewLog.push({event:'play'});
    if(window.previewMode==='blocked')this.options.events.onAutoplayBlocked();
    else if(window.previewMode==='error')this.options.events.onError({data:150});
    else this.options.events.onStateChange({data:1});
   }
   destroy(){window.previewLog.push({event:'destroy'});this.frame.remove();}
  }};
 });
}
test('hover loads a muted trailer, keeps the card clickable and stops on leave',async({page})=>{
 await fakeYouTube(page);await ready(page);const card=page.locator('[data-project-id="dordogne"]');
 await card.hover();await expect(card).toHaveClass(/preview-playing/);
 const log=await page.evaluate(()=>window.previewLog);
 expect(log.map(x=>x.event)).toEqual(['create','mute','play']);expect(log[0].id).toBe('u0L_mCJJU98');expect(log[0].host).toBe('https://www.youtube-nocookie.com');
 await expect(card.locator('iframe')).toHaveAttribute('allow',/autoplay/);await expect(card.locator('iframe')).toHaveAttribute('tabindex','-1');
 await page.mouse.move(4,4);await expect(page.locator('.project-preview')).toHaveCount(0);await expect(card).not.toHaveClass(/preview-playing/);
});
test('a passing cursor does not create a preview',async({page})=>{
 await fakeYouTube(page);await ready(page);await page.locator('[data-project-id="dordogne"]').hover();await page.mouse.move(4,4);
 await page.waitForTimeout(450);expect(await page.evaluate(()=>window.previewLog)).toEqual([]);
});
test('only one preview runs and opening the project destroys it',async({page})=>{
 await fakeYouTube(page);await ready(page);
 const first=page.locator('[data-project-id="dordogne"]'),second=page.locator('[data-project-id="distant-shore-bretagne"]');
 await first.hover();await expect(first).toHaveClass(/preview-playing/);
 await second.hover();await expect(second).toHaveClass(/preview-playing/);await expect(page.locator('.project-preview')).toHaveCount(1);
 await second.locator('h3 a').click();await expect(page.locator('.modal--project')).toBeVisible();await expect(page.locator('.project-preview')).toHaveCount(0);
});
for(const mode of ['blocked','error'])test(`a ${mode} trailer falls back to the cover`,async({page})=>{
 await fakeYouTube(page);await ready(page);await page.evaluate(mode=>window.previewMode=mode,mode);
 const card=page.locator('[data-project-id="dordogne"]');await card.hover();
 await expect.poll(()=>page.evaluate(()=>window.previewLog.some(e=>e.event==='play'))).toBe(true);
 await expect(page.locator('.project-preview')).toHaveCount(0);await expect(card).not.toHaveClass(/preview-playing/);
 await expect(card.locator('[data-media]>img')).toHaveCSS('opacity','1');
});
test('reduced motion and touch interaction do not autoplay',async({page})=>{
 await fakeYouTube(page);await page.emulateMedia({reducedMotion:'reduce'});await ready(page);
 const card=page.locator('[data-project-id="dordogne"]');await card.hover();await page.waitForTimeout(450);expect(await page.evaluate(()=>window.previewLog)).toEqual([]);
 await page.mouse.move(4,4);await page.emulateMedia({reducedMotion:'no-preference'});
 await card.dispatchEvent('pointerenter',{pointerType:'touch'});await page.waitForTimeout(450);expect(await page.evaluate(()=>window.previewLog)).toEqual([]);
});
test('a pending provider response cannot restart a preview after leaving',async({page})=>{
 await fakeYouTube(page);await ready(page);await page.evaluate(()=>window.previewDelay=800);
 await page.locator('[data-project-id="dordogne"]').hover();await expect(page.locator('.project-preview')).toHaveCount(1);
 await page.mouse.move(4,4);await page.waitForTimeout(900);
 expect(await page.evaluate(()=>window.previewLog.some(x=>x.event==='play'))).toBe(false);await expect(page.locator('.project-preview')).toHaveCount(0);
});
test('trailer parsing accepts supported sources and rejects spoofed providers',async({page})=>{
 await ready(page);const results=await page.evaluate(async()=>{
  const {trailerSource}=await import('/js/hover-preview.js');
  return ['https://youtu.be/u0L_mCJJU98','https://www.youtube.com/watch?v=u0L_mCJJU98','assets/demo.webm','https://youtube.com.evil.invalid/watch?v=u0L_mCJJU98','javascript:alert(1)'].map(trailerSource);
 });
 expect(results[0]).toEqual({type:'youtube',id:'u0L_mCJJU98'});expect(results[1]).toEqual(results[0]);expect(results[2].type).toBe('video');expect(results[3]).toBeNull();expect(results[4]).toBeNull();
});
