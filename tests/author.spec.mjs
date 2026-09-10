import {test,expect} from '@playwright/test';
const ready=async page=>{await page.goto('/');await expect(page.locator('.project-caption')).toHaveCount(4);await expect(page.locator('.ux-article-meta')).toHaveCount(3)};
test.beforeEach(async({page})=>{await page.route(/youtube|google|simpleicons|wikimedia|flagcdn|git-fork|jsdelivr/,r=>r.abort())});

test('profile is real HTML, games precede articles, navigation precedes the artwork',async({page})=>{
 await ready(page);await expect(page.locator('#hero-banner h1')).toHaveText('Nathan Tandille');
 await expect(page.locator('#heroRoles')).toHaveText('Production · QA · Level Design');
 const order=await page.evaluate(()=>['.header','#hero-banner','#projects','#cases','#about','#contact'].map(s=>document.querySelector(s).getBoundingClientRect().top+scrollY));
 expect(order).toEqual([...order].sort((a,b)=>a-b));
 await expect(page.locator('.hero-cta,.project-cta,.case-link')).toHaveCount(0);
});

for(const theme of ['light','dark'])test(`${theme}: shared botanical tokens and readable project captions`,async({page})=>{
 await page.emulateMedia({colorScheme:theme});await ready(page);
 await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
 const styles=await page.evaluate(()=>{
  const root=getComputedStyle(document.documentElement),title=document.querySelector('.project-caption h3 a');
  const toRGB=hex=>hex.replace('#','').match(/../g).map(x=>parseInt(x,16)/255);
  const luminance=rgb=>rgb.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
  const ratio=(a,b)=>{a=luminance(toRGB(a));b=luminance(toRGB(b));return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
  const value=n=>root.getPropertyValue(n).trim();
  return {accent:value('--accent-500'),shared:value('--author-accent'),font:getComputedStyle(title).fontFamily,
   colour:getComputedStyle(title).color,ink:value('--read-text'),contrast:ratio(value('--read-soft'),value('--read-panel'))};
 });
 expect(styles.accent).toBe(theme==='light'?'#626e49':'#b8bd8c');expect(styles.accent).toBe(styles.shared);
 expect(styles.font).toContain('Georgia');expect(styles.colour).not.toBe('rgb(255, 255, 255)');expect(styles.contrast).toBeGreaterThanOrEqual(4.5);
 for(const card of await page.locator('.project-tile').all()){
  const picture=await card.locator('.thumb').boundingBox(),caption=await card.locator('.project-caption').boundingBox();
  expect(caption.y).toBeGreaterThanOrEqual(picture.y+picture.height-1);
  await expect(card.locator('a')).toHaveCount(1);
 }
});

test('theme switches artwork but never recolours or replaces game screenshots',async({page})=>{
 await ready(page);const before=await page.locator('#projectList img,#caseList img').evaluateAll(imgs=>imgs.map(i=>i.src));
 await page.locator('#themeBtn').click();
 expect(await page.locator('#projectList img,#caseList img').evaluateAll(imgs=>imgs.map(i=>i.src))).toEqual(before);
 expect(await page.locator('#hero-banner .hero-img.night').evaluate(e=>getComputedStyle(e).backgroundImage)).toContain('bannerN.png');
 expect(await page.locator('#curtain .right').evaluate(e=>getComputedStyle(e,'::after').backgroundImage)).toContain('leaf_rightN.png');
});

test('language changes keep the frame, captions and leaf marks unique',async({page})=>{
 await ready(page);await page.locator('#langBtn').click();await expect(page.locator('.author-note')).toHaveText('Hello, I’m Nathan');
 await expect(page.locator('.project-caption')).toHaveCount(4);await expect(page.locator('.card-leaf')).toHaveCount(7);
 await page.evaluate(async()=>{const m=await import('/js/author.js');m.applyAuthorCards();m.applyAuthorCards()});
 await expect(page.locator('.project-caption')).toHaveCount(4);await expect(page.locator('.card-leaf')).toHaveCount(7);
 await page.locator('#langBtn').click();await expect(page.locator('.author-note')).toHaveText('Bienvenue, moi c’est Nathan');
});

for(const width of [320,390,640,768,1024,1440])test(`author header and reading zones fit ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await ready(page);
 for(const selector of ['#profileTitle','#heroRoles','#heroDesc','.header-actions', '.author-intro']){
  const box=await page.locator(selector).boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width+1);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 if(width<=640){
  const intro=await page.locator('.author-intro').boundingBox(),banner=await page.locator('#hero-banner').boundingBox();
  expect(intro.y+intro.height).toBeLessThanOrEqual(banner.y+banner.height);
 }
});

test('reading tools keep the shared type and colours',async({page})=>{
 await ready(page);await page.locator('.case-title a').first().click();
 await expect(page.locator('.ux-reading-mode')).toBeVisible();
 expect(await page.locator('.ux-reading-heading h2').evaluate(e=>getComputedStyle(e).fontFamily)).toContain('Georgia');
 await page.keyboard.press('Escape');await expect(page.locator('.modal')).toHaveCount(0);
});
