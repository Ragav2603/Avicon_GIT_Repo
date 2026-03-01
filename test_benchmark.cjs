const { performance } = require('perf_hooks');

const submissions = Array.from({ length: 50 }, (_, i) => ({ attachment_url: `file_${i}.pdf` }));

async function runBaseline() {
  const start = performance.now();
  // Simulate Promise.all with individual calls
  // The delay is simulated as 50ms per call
  const results = await Promise.all(
    submissions.map(async (s) => {
      await new Promise(r => setTimeout(r, 50));
      return { key: s.attachment_url, url: `signed_${s.attachment_url}` };
    })
  );
  const end = performance.now();
  console.log(`Baseline time: ${end - start}ms`);
}

async function runOptimized() {
  const start = performance.now();
  // Simulate single batch call
  await new Promise(r => setTimeout(r, 100)); // Maybe the batch call takes slightly longer than one
  const results = submissions.map(s => ({
    key: s.attachment_url,
    url: `signed_${s.attachment_url}`
  }));
  const end = performance.now();
  console.log(`Optimized time: ${end - start}ms`);
}

async function run() {
  await runBaseline();
  await runOptimized();
}
run();
