import { test, expect } from '@playwright/test';
import { exec } from 'node:child_process';
import { createClient } from 'redis'

test.describe("Streamdal Console", () => {

  test.beforeEach(async () => {
    const client = createClient();
    await client.flushAll()
  })

  test.afterAll(async () => {
    // Not necessary for CI, but in case we run this locally
    const client = createClient();
    await client.flushAll()
  })

  test('loads empty console', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Streamdal/);
    await expect(page.getByText('No services defined')).toBeVisible();
  });

  test('create pipeline', async ({ page }) => {
    await page.goto('http://localhost:3000/pipelines/add');
    await page.fill('input[name="name"]', 'Test Pipeline');
    await page.selectOption('select[name="dataFormat"]', 'JSON');
    await page.fill('input[name="steps.0.name"]', 'Detect PII');
    await page.selectOption('select[name="steps.0.step.oneofKind"]', 'detective');
    await page.selectOption('select[name="steps.0.step.detective.type"]', 'PII_KEYWORD');

    // Add second step
    await page.click('.add-step-button');
    await page.fill('input[name="steps.1.name"]', 'Mask PII');
    await page.selectOption('select[name="steps.1.step.oneofKind"]', 'transform');
    await page.selectOption('select[name="steps.1.step.transform.type"]', 'MASK_VALUE');
    await page.setChecked('input[name="steps.1.dynamic"]', true);

    // We're using dynamic transforms, so path option should be hidden if dynamic is checked
    await expect(page.$('input[name="steps.1.step.transform.options.replaceValueOptions.path"').then((el) => el?.isVisible())).resolves.toBe(false);

    // Save pipeline
    await page.click('button:has-text("Save")');

    // How do we ensure it was created?
  });

  test ('graph elements are created', async ({ page }) => {
    // Run demo-client command to start instance
    // This will run in the background and we'll kill it after we've seen what we need to on the page
    const demoClient = exec('cd ../apps/server/test-utils/demo-client; make run1', (error, stdout, stderr) => {
      if (error) {
      console.error(`exec error: ${error}`);
      return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

    // Sleep for 20 seconds
    // TODO: this should probably be 30000 for CI
    await page.waitForTimeout(20000);

    // See demo-client producer on page
    await page.goto('http://localhost:3000');
    await expect(page.getByText('signup-service')).toBeVisible();
    await expect(page.getByText('verifier')).toBeVisible();
    await expect(page.getByText('postgresql')).toBeVisible();
    await expect(page.getByText('verifier')).toBeVisible();

    // Ensure we have a generated schema
    // await expect(page.$('code.schema').then((el) => el?.textContent)).not.toBe(null);

    // Stop demo-client
    demoClient.kill(9)
  });
});