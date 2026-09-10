import {test,expect} from '@playwright/test';
async function ready(page,path='/'){
 await page.goto(path);await expect(page.locator('#projectList .tile')).toHaveCount(4);await expect(page.locator('.ux-article-meta')).toHaveCount(3);
}
test.beforeEach(async({page})=>{
 await page.route(/youtube|google|simpleicons|wikimedia|flagcdn|git-fork|jsdelivr/,route=>route.abort());
});
test('the original opening has a keyboard-accessible invitation',async({page})=>{
 await ready(page);await page.locator('.ux-explore').focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/#main$/);
 await page.locator('.ux-brand-home').click();await expect(page).toHaveURL(/#hero-banner$/);
});
test('a project card links directly to its own article, not the project modal',async({page})=>{
 await ready(page);const link=page.locator('[data-project-id="dordogne"] .ux-related-article');await link.click();
 await expect(page.locator('.modal--case-study')).toBeVisible();await expect(page.locator('.modal--project')).toHaveCount(0);await expect(page).toHaveURL(/#case=dordogne-feedback-loop$/);
 await page.keyboard.press('Escape');await expect(link).toBeFocused();
});
test('short card titles leave the full article title intact',async({page})=>{
 await ready(page);await expect(page.locator('.case-title a').first()).toContainText('Rendre le parkour');
 await page.locator('.case-title a').first().click();await expect(page.locator('.modal>header h3')).toContainText('Revamper la démo Steam');
});
test('search and project filtering survive refresh and language changes',async({page})=>{
 await ready(page);await page.locator('.ux-search input').fill('builds');await page.locator('.ux-filter select').selectOption('dordogne');
 await expect(page.locator('.case-tile:visible')).toHaveCount(1);await page.reload();await expect(page.locator('.ux-search input')).toHaveValue('builds');await expect(page.locator('.ux-filter select')).toHaveValue('dordogne');
 await page.locator('#langBtn').click();await expect(page.locator('.case-tile:visible')).toHaveCount(1);await expect(page.locator('.ux-clear-search')).toBeVisible();
 await page.locator('.ux-clear-search').click();await expect(page.locator('.case-tile:visible')).toHaveCount(3);await expect(page.locator('.ux-search input')).toBeFocused();
});
test('reading mode removes surrounding context without losing article content',async({page})=>{
 await ready(page,'/#case=distant-shore-readability');await expect(page.locator('.ux-read-toggle')).toBeVisible();const count=await page.locator('.case-section').count();
 await page.locator('.ux-read-toggle').click();await expect(page.locator('.modal')).toHaveClass(/ux-reading-mode/);await expect(page.locator('.ux-reading-heading')).toBeVisible();await expect(page.locator('.modal .media-shell').first()).not.toBeVisible();
 await expect(page.locator('.case-section')).toHaveCount(count);await page.locator('.ux-read-toggle').click();await expect(page.locator('.modal .media-shell').first()).toBeVisible();
});
test('the contents shortcut remains available after scrolling',async({page})=>{
 await ready(page,'/#case=distant-shore-readability');await page.locator('.modal').evaluate(el=>el.scrollTop=2500);
 await page.locator('.ux-toc-toggle').click();await expect(page.locator('.ux-toc')).toHaveAttribute('open','');await expect(page.locator('.ux-toc summary')).toBeFocused();
});
test('a link can reopen the exact article section after reload',async({page})=>{
 await ready(page,'/#case=distant-shore-readability');await page.locator('.ux-toc summary').click();await page.locator('.ux-toc a').nth(2).click();await expect(page).toHaveURL(/section=article-section-3/);
 await page.reload();await expect(page.locator('.modal')).toBeVisible();await expect.poll(()=>page.locator('#article-section-3').evaluate(el=>Math.abs(el.getBoundingClientRect().top))).toBeLessThan(350);
});
test('the share control copies the current deep link',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedLink=text}}}));
 await ready(page,'/#case=dordogne-feedback-loop');await page.locator('.ux-share').click();expect(await page.evaluate(()=>window.copiedLink)).toBe(page.url());await expect(page.locator('#uxStatus')).toContainText('Lien copié');
});
test('media thumbnails work with Enter and arrow keys',async({page})=>{
 await ready(page,'/#project=dordogne');const thumbs=page.locator('.media-strip img');await thumbs.first().focus();await page.keyboard.press('Enter');await expect(thumbs.first()).toHaveAttribute('aria-pressed','true');
 await page.keyboard.press('ArrowRight');await expect(thumbs.nth(1)).toBeFocused();await expect(thumbs.nth(1)).toHaveAttribute('aria-pressed','true');await expect(page.locator('.modal .media-shell img')).toHaveAttribute('src',await thumbs.nth(1).evaluate(img=>img.src));
});
test('gallery position and closing restore the exact trigger',async({page})=>{
 await ready(page,'/#project=dordogne');const trigger=page.locator('[data-gallery]').first();await trigger.click();await expect(page.locator('.ux-gallery-counter')).toHaveText('1 / 11');await page.keyboard.press('ArrowRight');await expect(page.locator('.ux-gallery-counter')).toHaveText('2 / 11');await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
});
test('refreshing enhancements never duplicates metadata or card actions',async({page})=>{
 await ready(page);await page.evaluate(async()=>{const {refreshUX}=await import('/js/ux.js');refreshUX();refreshUX()});
 await expect(page.locator('.ux-article-meta')).toHaveCount(3);await expect(page.locator('.ux-project-actions')).toHaveCount(4);await expect(page.locator('.ux-related-article')).toHaveCount(3);await expect(page.locator('.ux-explore')).toHaveCount(1);
});
test('compact mobile header keeps every control within a single row',async({page})=>{
 await page.setViewportSize({width:320,height:844});await ready(page);const header=await page.locator('.header').boundingBox();expect(header.height).toBeLessThan(80);
 await expect(page.locator('#themeBtn')).toBeVisible();await expect(page.locator('#langBtn')).toBeVisible();await expect(page.locator('#navToggle')).toBeVisible();
 await page.locator('#navToggle').click();await expect(page.locator('.ux-mobile-cv')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
test('updated visual captures',async({page},info)=>{
 test.skip(info.project.name==='firefox','Chromium supplies the visual references');
 await page.setViewportSize({width:1440,height:1000});await ready(page);await page.waitForTimeout(600);await page.screenshot({path:info.outputPath('opening.png')});
 for(const section of ['projects','cases']){await page.locator('#'+section).evaluate(el=>el.scrollIntoView({behavior:'instant'}));await page.waitForTimeout(700);await page.screenshot({path:info.outputPath(section+'.png')});}
 await page.locator('.case-title a').first().click();await page.locator('.ux-read-toggle').click();await page.screenshot({path:info.outputPath('reading.png')});await page.keyboard.press('Escape');
 await page.locator('#themeBtn').click();await page.locator('#projects').evaluate(el=>el.scrollIntoView({behavior:'instant'}));await page.waitForTimeout(600);await page.screenshot({path:info.outputPath('projects-night.png')});
 await page.locator('#themeBtn').click();await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(400);await page.screenshot({path:info.outputPath('mobile.png')});
});
