import {test,expect} from '@playwright/test';

async function ready(page){
 await page.goto('/');
 await expect(page.locator('.ux-article-meta')).toHaveCount(3);
}
async function imagesReady(page){
 await page.locator('img[loading="lazy"]').evaluateAll(images=>images.forEach(img=>img.loading='eager'));
 const broken=await page.evaluate(async()=>{
  const images=[...document.images].filter(img=>img.src&&new URL(img.src).origin===location.origin);
  await Promise.all(images.map(img=>img.decode().catch(()=>null)));
  return images.filter(img=>!img.naturalWidth).map(img=>img.src);
 });
 expect(broken).toEqual([]);
}
test.beforeEach(async({page})=>{
 await page.route(/youtube|google|simpleicons|wikimedia|flagcdn|git-fork|jsdelivr/,route=>route.abort());
});
test('articles have large framed imagery and readable text on desktop',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await ready(page);
 for(const card of await page.locator('.case-tile').all()){
  const bounds=await card.boundingBox(),image=await card.locator('.case-thumb').boundingBox();
  expect(bounds.height).toBeGreaterThanOrEqual(360);
  expect(image.width).toBeGreaterThan(450);expect(image.height).toBeGreaterThan(300);
  expect(await card.locator('.case-title').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(34);
  expect(await card.locator('.case-lead').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(18);
  await expect(card.locator('a')).toHaveCount(1);
 }
 await expect(page.locator('.hero-cta,.project-cta,.ux-related-article,.case-link')).toHaveCount(0);
});
for(const width of [320,390,640])test(`articles retain full-width illustrations on ${width}px mobile`,async({page})=>{
 await page.setViewportSize({width,height:900});await ready(page);
 for(const card of await page.locator('.case-tile').all()){
  const image=await card.locator('.case-thumb').boundingBox(),body=await card.locator('.case-body').boundingBox();
  expect(image.width).toBeGreaterThan(width*.73);expect(image.height).toBeGreaterThan(155);
  expect(body.y).toBeGreaterThanOrEqual(image.y+image.height-1);
  expect(await card.locator('.case-title').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(26);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
});
test('contents align below the toolbar without scrolling the background',async({page})=>{
 await ready(page);await page.locator('#cases').evaluate(el=>el.scrollIntoView({behavior:'instant'}));
 await page.locator('.case-title a').first().click();
 await expect(page.locator('.modal')).toHaveClass(/ux-reading-mode/);
 await page.locator('.ux-toc summary').click();
 const before=await page.evaluate(()=>scrollY);
 await page.locator('.ux-toc a').nth(2).click();
 await expect.poll(()=>page.locator('#article-section-3').evaluate(el=>{
  const header=el.closest('.modal').querySelector('header');
  return Math.abs(el.getBoundingClientRect().top-header.getBoundingClientRect().bottom-20);
 })).toBeLessThan(8);
 expect(await page.evaluate(()=>scrollY)).toBe(before);
 await page.locator('.ux-toc-toggle').click();
 await expect(page.locator('.ux-toc summary')).toBeFocused();
});
test('slow images above an article anchor cannot displace its heading',async({page})=>{
 await page.route('**/assets/projects/*.webp',async route=>{await new Promise(resolve=>setTimeout(resolve,400));await route.continue()});
 await ready(page);await page.locator('.case-title a').first().click();await page.locator('.ux-toc summary').click();
 await page.locator('.ux-toc a').nth(2).click();await page.waitForTimeout(1300);
 await expect.poll(()=>page.locator('#article-section-3').evaluate(el=>{
  return Math.abs(el.getBoundingClientRect().top-el.closest('.modal').querySelector('header').getBoundingClientRect().bottom-20);
 })).toBeLessThan(8);
});
test('article title focus opens one window and returns to its title',async({page})=>{
 await ready(page);const link=page.locator('.case-title a').nth(1);
 await link.focus();await page.keyboard.press('Enter');
 await expect(page.locator('.modal--case-study')).toHaveCount(1);
 await page.keyboard.press('Escape');await expect(link).toBeFocused();
});
test('day and night finish captures with all local images decoded',async({page},info)=>{
 test.skip(info.project.name==='firefox','Functional tests run twice, visual references are captured once');
 await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({colorScheme:'light'});await ready(page);await imagesReady(page);
 const capture=async(name,section)=>{
  if(section)await page.locator('#'+section).evaluate(el=>el.scrollIntoView({behavior:'instant'}));
  await page.evaluate(()=>document.activeElement?.blur());await page.mouse.move(4,4);await page.waitForTimeout(700);
  await page.screenshot({path:info.outputPath(name+'.png')});
 };
 await capture('opening-day');await capture('intro-day','main');await capture('projects-day','projects');await capture('articles-day','cases');await capture('skills-day','about');
 await page.locator('#themeBtn').click();await capture('articles-night','cases');await capture('projects-night','projects');
 await page.locator('#themeBtn').click();await page.locator('.case-title a').first().click();await expect(page.locator('.modal')).toHaveClass(/ux-reading-mode/);await page.waitForTimeout(600);
 await page.screenshot({path:info.outputPath('reading-day.png')});await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});await capture('articles-mobile','cases');
 await page.locator('.case-tile').first().screenshot({path:info.outputPath('article-mobile-card.png')});
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(500);
 await page.screenshot({path:info.outputPath('mobile-full.png'),fullPage:true});
});
