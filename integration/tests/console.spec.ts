import { test, expect } from '@playwright/test';
import { exec } from 'node:child_process';
import { createClient } from 'redis'

test.describe("Streamdal Console", () => {

  let client = null;

  let console_url = process.env.CONSOLE_URL || 'http://localhost:3000';

  test.beforeAll(async () => {
    client = createClient({
      url: 'redis://localhost:6379'
    });
    await client.connect();

    client.on('connect', () => {
      console.log('Connected to Redis server');
    });

    client.on('error', (err: any) => {
      console.error('Redis error:', err);
    });
  })

  test.beforeEach(async () => {
    const deleteKeysByPattern = async (pattern: string) => {
      const keys = await client.keys(pattern); !!keys.length && client.unlink(keys);
    }

    // Delete everything except streamdal_wasm:* keys
    await deleteKeysByPattern('streamdal_live:*');
    await deleteKeysByPattern('streamdal_pipeline:*');
    await deleteKeysByPattern('streamdal_audience:*');
    await deleteKeysByPattern('streamdal_tail:*');
    await deleteKeysByPattern('streamdal_tail_paused:*');
    await deleteKeysByPattern('streamdal_schema:*');
    await deleteKeysByPattern('streamdal_notification_config:*');
    await deleteKeysByPattern('streamdal_notification_assoc:*');
  })

  test('loads empty console', async ({ page }) => {
    await page.goto(console_url);

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Streamdal/);
    await expect(page.getByText('No services defined')).toBeVisible();
  });

  test ('end to end', async ({ page }) => {
    await createPipeline(console_url, page);

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

    // Sleep for 20 seconds to allow demo-client to compile/start
    // TODO: can we move compile to a make command that runs before tests
    await page.waitForTimeout(60000);

    // See demo-client producer on page
    await page.goto(console_url);
    await expect(page.getByText('signup-service')).toBeVisible();
    await expect(page.getByText('verifier')).toBeVisible();
    await expect(page.getByText('postgresql')).toBeVisible();
    await expect(page.getByText('verifier')).toBeVisible();

    await page.click('text=verifier');

    // Attach pipeline to client
    await page.click('input[title="Test Pipeline"]');

    // Expect to see "Attach pipeline TestPipeline?" dialog
    await expect(page.getByText('Attach pipeline Test Pipeline?')).toBeVisible();

    // Click Attach button
    await page.click('button:has-text("Attach")');

    // See "Pipeline successfully attached"
    await expect(page.getByText('Pipeline successfully attached')).toBeVisible();

    await page.goto(console_url);

    // Click on verifier
    await page.click('text=verifier');

    await expect(page.getByText('json-schema.org')).toBeVisible();
    await expect(page.getByText('"birthdate":')).toBeVisible();

    // Expect to see "Start Tail" link
    await expect(page.getByText('Start Tail')).toBeVisible();

    // Click on "Start Tail"
    await page.click('text=Start Tail');

    const re = new RegExp(/"user_id": "\d{2}\*+"/);

    // Expect to see a masked field ""user_id": "54********","
    await expect(page.getByText(re)).toBeVisible();

    // Stop demo-client
    demoClient.kill(9)
  });
});

async function createPipeline(console_url, page) {
  await page.goto(console_url + '/pipelines/add');
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
  // TODO: this is broken
  // await expect(page.$('input[name="steps.1.step.transform.options.replaceValueOptions.path"').then((el) => el?.isVisible())).resolves.toBe(false);

  // Save pipeline
  await page.click('button:has-text("Save")');

  // TODO: How do we ensure it was created?
}