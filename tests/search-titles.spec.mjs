import {test,expect} from '@playwright/test';
test('search finds the visible short title as well as the full original title',async({page})=>{
 await page.route(/youtube|google|simpleicons|wikimedia|flagcdn|git-fork|jsdelivr/,route=>route.abort());
 await page.goto('/');await expect(page.locator('.ux-article-meta')).toHaveCount(3);
 const search=page.locator('.ux-search input');
 await search.fill('retravailler');await expect(page.locator('.case-tile:visible')).toHaveCount(1);
 await expect(page.locator('.case-tile:visible')).toContainText('Distant Shore');
 await search.fill('Revamper la démo Steam');await expect(page.locator('.case-tile:visible')).toHaveCount(1);
 await page.reload();await expect(page.locator('.case-tile:visible')).toHaveCount(1);
 await expect(search).toHaveValue('Revamper la démo Steam');
});
