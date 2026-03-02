import { performance } from 'perf_hooks';

// In browsers, the concurrent connection limit per domain is typically 6.
// This limits how many parallel requests can actually be in flight.
const CONCURRENT_LIMIT = 6;
let activeConnections = 0;
const requestQueue: (() => void)[] = [];

async function acquireConnection() {
    if (activeConnections < CONCURRENT_LIMIT) {
        activeConnections++;
        return;
    }
    return new Promise<void>(resolve => {
        requestQueue.push(resolve);
    });
}

function releaseConnection() {
    if (requestQueue.length > 0) {
        const next = requestQueue.shift()!;
        next();
    } else {
        activeConnections--;
    }
}

// Simulate a network request taking 50ms latency + 10ms processing
async function mockCreateSignedUrl(path: string) {
    await acquireConnection();
    try {
        await new Promise(r => setTimeout(r, 60));
        return { data: { signedUrl: `signed_${path}` }, error: null };
    } finally {
        releaseConnection();
    }
}

// Simulate a batch network request. One connection is used, but the payload is larger.
// Say it takes 50ms latency + 20ms processing = 70ms.
async function mockCreateSignedUrls(paths: string[]) {
    await acquireConnection();
    try {
        await new Promise(r => setTimeout(r, 70));
        return { data: paths.map(p => ({ path: p, signedUrl: `signed_${p}` })), error: null };
    } finally {
        releaseConnection();
    }
}

async function run() {
    const itemCount = 50;
    const paths = Array.from({ length: itemCount }, (_, i) => `file_${i}.pdf`);

    console.log(`Running benchmark with ${itemCount} items, simulating browser connection limit (${CONCURRENT_LIMIT})...`);

    // Baseline (N+1)
    const startBaseline = performance.now();
    await Promise.all(paths.map(p => mockCreateSignedUrl(p)));
    const endBaseline = performance.now();
    const baselineTime = endBaseline - startBaseline;

    console.log(`Baseline (N+1 parallel requests): ${baselineTime.toFixed(2)}ms`);

    // Optimized (Batch)
    const startOptimized = performance.now();
    await mockCreateSignedUrls(paths);
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;

    console.log(`Optimized (1 batch request): ${optimizedTime.toFixed(2)}ms`);
    console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}% faster`);
}

run();
