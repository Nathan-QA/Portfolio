import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{
 await page.route(/youtube|google|simpleicons|wikimedia|flagcdn|git-fork|jsdelivr/,r=>r.abort());
 await page.goto('/');await expect(page.locator('.project-caption')).toHaveCount(4);
});
test('identity is inside the actual watercolour and projects precede articles',async({page})=>{
 await expect(page.locator('html')).toHaveAttribute('data-design','atelier-2026');
 await expect(page.locator('#hero-banner h1')).toHaveText('Nathan Tandille');
 await expect(page.locator('#main h1')).toHaveCount(0);
 const boxes=await Promise.all(['.header','#hero-banner','#projects','#cases'].map(s=>page.locator(s).boundingBox()));
 expect(boxes[0].y+boxes[0].height).toBeLessThanOrEqual(boxes[1].y+1);
 expect(boxes[1].y+boxes[1].height).toBeLessThanOrEqual(boxes[2].y+1);
 expect(boxes[2].y+boxes[2].height).toBeLessThanOrEqual(boxes[3].y+1);
 expect(await page.locator('h1').evaluate(el=>getComputedStyle(el).fontFamily)).toContain('Georgia');
});
test('project copy is on paper, below the art, with no inherited overlay shadow',async({page})=>{
 for(const card of await page.locator('.project-tile').all()){
  const image=await card.locator('.thumb').boundingBox(),caption=await card.locator('.project-caption').boundingBox();
  expect(caption.y).toBeGreaterThanOrEqual(image.y+image.height-1);
  await expect(card.locator('.project-tile-summary')).toHaveCSS('text-shadow','none');
  await expect(card.locator('.role-badge')).not.toHaveCSS('color','rgb(255, 255, 255)');
  await expect(card.locator('a')).toHaveCount(1);
 }
});
test('theme switches preserve the real game images and the layout',async({page})=>{
 const images=await page.locator('#projectList img,#caseList img').evaluateAll(imgs=>imgs.map(i=>i.getAttribute('src')));
 const paper=await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
 const font=await page.locator('h1').evaluate(el=>getComputedStyle(el).fontFamily);
 await page.locator('#themeBtn').click();
 expect(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(paper);
 expect(await page.locator('h1').evaluate(el=>getComputedStyle(el).fontFamily)).toBe(font);
 expect(await page.locator('#projectList img,#caseList img').evaluateAll(imgs=>imgs.map(i=>i.getAttribute('src')))).toEqual(images);
 await expect(page.locator('.hero-img.night')).toHaveCSS('opacity','1');
});
test('language changes rebuild postcards once and translate chapter notes',async({page})=>{
 await page.locator('#langBtn').click();await expect(page.locator('.project-caption')).toHaveCount(4);
 await expect(page.locator('#projects .section-note')).toHaveText('Games & collaborations');
 await expect(page.locator('#contact .section-note')).toHaveText('The next step starts with a conversation');
 await page.locator('#langBtn').click();await expect(page.locator('.project-caption')).toHaveCount(4);
 await expect(page.locator('#projects .section-note')).toHaveText('Jeux & collaborations');
});
test('theme text and links on paper have a readable contrast',async({page})=>{
 for(const theme of ['light','dark']){
  await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  const ratios=await page.evaluate(()=>{
   const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
   const lum=c=>c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0);
   return ['.project-caption .role-badge','.project-tile-summary','.case-lead','.ux-email'].map(sel=>{
    const el=document.querySelector(sel);const fg=lum(rgb(getComputedStyle(el).color));
    let parent=el;while(parent&&getComputedStyle(parent).backgroundColor==='rgba(0, 0, 0, 0)')parent=parent.parentElement;
    const bg=lum(rgb(getComputedStyle(parent||document.body).backgroundColor));return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
   });
  });for(const ratio of ratios)expect(ratio).toBeGreaterThanOrEqual(4.5);
 }
});
