import {test,expect} from '@playwright/test';
async function ready(page,path='/'){
 await page.goto(path);await expect(page.locator('#projectList .tile')).toHaveCount(4);
 await expect(page.locator('.ux-article-meta')).toHaveCount(3);
}
test.beforeEach(async({page})=>{
 // Third-party video content is not part of the UI under test.
 await page.route(/youtube|google|simpleicons|wikimedia|flagcdn|git-fork|jsdelivr/,r=>r.abort());
});
test('main scenery, typeface and palette remain, with projects before biography',async({page})=>{
 await ready(page);
 expect(await page.locator('html').evaluate(e=>getComputedStyle(e).getPropertyValue('--cream-50').trim())).toBe('#fff4e5');
 expect(await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily)).toContain('Inter');
 await expect(page.locator('#hero-banner .hero-img')).toHaveCount(2);
 await expect(page.locator('#curtain .right')).toBeVisible();
 await expect(page.locator('#careerDetails')).not.toHaveAttribute('open','');
 expect(await page.locator('#projects').evaluate(e=>e.offsetTop)).toBeLessThan(await page.locator('#careerDetails').evaluate(e=>e.getBoundingClientRect().top+scrollY));
 await expect(page.locator('#skillsWrap .skill-card')).toHaveCount(0);
});
test('project direct link survives reload and Escape returns to the page',async({page})=>{
 await ready(page,'/#project=dordogne');await expect(page.locator('.modal--project')).toBeVisible();
 await expect(page.locator('.modal>header h3')).toHaveText('Dordogne');
 await page.reload();await expect(page.locator('.modal--project')).toBeVisible();
 await expect(page).toHaveURL(/#project=dordogne$/);
 await page.keyboard.press('Escape');await expect(page.locator('.modal')).toHaveCount(0);
 await expect(page).toHaveURL(/#projects$/);
});
test('native Back and Forward close and restore project details',async({page})=>{
 await ready(page);await page.locator('#projectList h3 a').first().click();await expect(page.locator('.modal--project')).toBeVisible();
 await page.goBack();await expect(page.locator('.modal')).toHaveCount(0);
 await page.goForward();await expect(page.locator('.modal--project')).toBeVisible();
});
test('project, related article and return retain their identity',async({page})=>{
 await ready(page,'/#project=distant-shore-bretagne');
 await page.locator('[data-case]').first().click();await expect(page.locator('.modal--case-study')).toBeVisible();
 await page.reload();await expect(page.locator('.modal--case-study')).toBeVisible();
 await page.locator('.modal .back').click();await expect(page.locator('.modal--project')).toBeVisible();
 await expect(page.locator('.modal>header h3')).toContainText('Distant Shore');
});
test('section anchors remain reachable below the sticky header',async({page})=>{
 await ready(page);await page.locator('.ux-primary').click();await expect(page).toHaveURL(/#projects$/);
 await expect.poll(()=>page.locator('#projects h2').evaluate(e=>e.getBoundingClientRect().top)).toBeGreaterThan(100);
 await page.reload();await expect(page).toHaveURL(/#projects$/);
 await expect.poll(()=>page.locator('#projects').evaluate(e=>Math.abs(e.getBoundingClientRect().top))).toBeLessThan(250);
});
test('article search, filter and reset use real existing content',async({page})=>{
 await ready(page);await page.locator('.ux-search input').fill('magnetique');await expect(page.locator('.case-tile:visible')).toHaveCount(1);
 await page.locator('.ux-search input').fill('');await page.locator('.ux-filter select').selectOption('dordogne');
 await expect(page.locator('.case-tile:visible')).toHaveCount(1);
 await page.locator('.ux-search input').fill('inexistant-xyz');await expect(page.locator('.ux-empty')).toBeVisible();
 await page.locator('.ux-empty button').click();await expect(page.locator('.case-tile:visible')).toHaveCount(3);
});
test('all 29 existing skills remain behind progressive disclosure',async({page})=>{
 await ready(page);await page.locator('#skillsDetails>summary').click();await expect(page.locator('.skill-card')).toHaveCount(29);
 await page.locator('#careerDetails>summary').click();await expect(page.locator('.career-timeline')).toBeVisible();
});
test('theme and language persist, without changing original dark colors',async({page})=>{
 await ready(page);await page.locator('#themeBtn').click();await page.locator('#langBtn').click();
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 expect(await page.locator('html').evaluate(e=>getComputedStyle(e).getPropertyValue('--warm-900').trim())).toBe('#161311');
});
test('modal keyboard focus and gallery close restore the right layer',async({page})=>{
 await ready(page);const link=page.locator('#projectList h3 a').first();await link.click();
 await expect(page.locator('.modal>header .x')).toBeFocused();
 await page.locator('.modal [data-gallery]').first().click();await expect(page.locator('.lightbox')).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('.lightbox')).toHaveCount(0);
 await expect(page.locator('.modal')).toBeVisible();await expect(page.locator('body')).toHaveClass(/no-scroll/);
 await page.keyboard.press('Escape');await expect(page.locator('.modal')).toHaveCount(0);await expect(link).toBeFocused();
});
test('article table of contents scrolls inside the existing modal',async({page})=>{
 await ready(page,'/#case=distant-shore-readability');await expect(page.locator('.modal--case-study')).toBeVisible();
 await page.locator('.ux-toc summary').click();await page.locator('.ux-toc a').nth(2).click();
 await expect.poll(()=>page.locator('#article-section-3').evaluate(e=>Math.abs(e.getBoundingClientRect().top))).toBeLessThan(350);
 await expect(page.locator('.modal>header .x')).toBeVisible();
});
test('fast Escape during opening never locks the background',async({page})=>{
 await ready(page);await page.locator('#projectList h3 a').first().click();await page.keyboard.press('Escape');
 await page.waitForTimeout(700);await expect(page.locator('.modal')).toHaveCount(0);await expect(page.locator('body')).not.toHaveClass(/no-scroll/);
});
test('mobile menu works by keyboard and closes after navigation',async({page})=>{
 await page.setViewportSize({width:390,height:844});await ready(page);
 await page.locator('#navToggle').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#navToggle')).toHaveAttribute('aria-expanded','true');
 await page.locator('#primaryNav a[href="#cases"]').click();await expect(page.locator('#navToggle')).toHaveAttribute('aria-expanded','false');
 await page.locator('#navToggle').click();await page.keyboard.press('Escape');await expect(page.locator('#navToggle')).toBeFocused();
});
for(const width of [320,390,768,1024,1440])test(`layout fits ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await ready(page);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 const box=await page.locator('.header-actions').boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width+1);
 await page.locator('#skillsDetails>summary').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('captures for review: opening, projects, articles, dark and mobile',async({page},info)=>{
 test.skip(info.project.name==='firefox','Same captures produced once on Chromium');
 await page.setViewportSize({width:1440,height:1000});await ready(page);await page.waitForTimeout(700);
 await page.screenshot({path:info.outputPath('opening-day.png')});
 await page.locator('#projects').evaluate(e=>e.scrollIntoView({behavior:'instant'}));await page.waitForTimeout(1000);await page.screenshot({path:info.outputPath('projects-day.png')});
 await page.locator('#cases').evaluate(e=>e.scrollIntoView({behavior:'instant'}));await page.waitForTimeout(1000);await page.screenshot({path:info.outputPath('articles-day.png')});
 await page.locator('#themeBtn').click();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(1000);await page.screenshot({path:info.outputPath('opening-night.png')});
 await page.locator('#themeBtn').click();await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:info.outputPath('mobile.png'),fullPage:true});
});
