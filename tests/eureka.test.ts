import { resolve } from 'node:path';
import testContext from './setup';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const USERSCRIPT_PATH = resolve('./dist/eureka.user.js');
const USERSCRIPT_CONTENT = readFileSync(USERSCRIPT_PATH, 'utf-8');
const TEST_SITES = [
  'https://scratch.mit.edu/projects/editor/',
  'https://turbowarp.org/editor/',
  'https://gonfunko.github.io/scratch-gui/',
  'https://world.xiaomawang.com/scratch3-playground?platform=3',
  'https://code.xueersi.com/scratch/index.html?pid=2&version=3.0&preview=preview&env=community',
  'https://codingclip.com/editor/stable/',
  'https://cocrea.world/gandi'
];

const TIMEOUT = 60000;

async function initEureka(page: Page) {
  await page.evaluate(() => {
    const defaultEurekaSettings = JSON.stringify({
      behavior: {
        exposeCtx: true
      }
    });
    globalThis.localStorage.setItem('$eureka', defaultEurekaSettings);
  });
  await page.evaluate(USERSCRIPT_CONTENT);
}

async function waitForEurekaInit(page: Page) {
  await page.waitForFunction(() => {
    console.log(globalThis.localStorage.getItem('$eureka'));
    return !!globalThis.eureka;
  }, undefined, { timeout: TIMEOUT });
}

async function waitForVmInit(page: Page) {
  await page.waitForFunction(() => {
    return !!globalThis.eureka?.vm?.initialized;
  }, undefined, { timeout: TIMEOUT });
}

async function waitForBlocksInit(page: Page) {
  await page.waitForFunction(() => {
    return !!globalThis.eureka?.blocks;
  }, undefined, { timeout: TIMEOUT });
}

describe('Injection & Capture', () => {
  // Increase timeout for all tests
  jest.setTimeout(TIMEOUT);

  test.concurrent.each(TEST_SITES)('should inject Eureka & captured VM on %s', async (url) => {
    const page = await testContext.getPage(); 
    await page.goto(url, { waitUntil: 'commit' });
    initEureka(page);
    await waitForEurekaInit(page);

    const eurekaExists = await page.evaluate(() => {
      return typeof globalThis.eureka === 'object';
    });
    
    expect(eurekaExists).toBe(true);

    await waitForVmInit(page);

    const vmExists = await page.evaluate(() => {
      return typeof globalThis.eureka.vm === 'object';
    });

    expect(vmExists).toBe(true);
  });

  test.concurrent.each(TEST_SITES)('should captured ScratchBlocks on %s', async (url) => {
    const page = await testContext.getPage();
    await page.goto(url, { waitUntil: 'commit' });
    initEureka(page);
    await waitForEurekaInit(page);
    await waitForBlocksInit(page);

    const blocksExists = await page.evaluate(() => {
      return typeof globalThis.eureka.blocks === 'object';
    });

    expect(blocksExists).toBe(true);
  });
});
