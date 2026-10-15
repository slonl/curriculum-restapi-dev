#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = new Set(process.argv.slice(2))
const valid = new Set(['--fast', '--smoke-only', '--coverage-target'])

for (const arg of args) {
    if (!valid.has(arg)) {
        console.error(`Unknown option: ${arg}`)
        process.exit(2)
    }
}

if (args.has('--fast') && args.has('--smoke-only')) {
    console.error('--fast and --smoke-only cannot be combined')
    process.exit(2)
}

function run(label, command, commandArgs, cwd = root) {
    console.log(`\n==> ${label}`)
    const result = spawnSync(command, commandArgs, {
        cwd,
        stdio: 'inherit',
        env: process.env
    })
    if (result.error) {
        throw result.error
    }
    if (result.status !== 0) {
        throw new Error(`${label} failed with exit code ${result.status}`)
    }
}

try {
    if (!args.has('--smoke-only')) {
        const coverageScript = args.has('--coverage-target')
            ? 'test:coverage' : 'test'
        run('REST API tests', 'npm', ['run', coverageScript],
            path.join(root, 'curriculum-rest-api'))
        run('REST API lint', 'npm', ['run', 'lint'],
            path.join(root, 'curriculum-rest-api'))
        run('Curriculum Store tests', 'npm', ['run', coverageScript],
            path.join(root, 'curriculum-store'))
        console.log('\n==> Curriculum Store lint')
        console.log('Skipped: no ESLint flat configuration is currently present.')
        run('Compose configuration', 'docker', ['compose', 'config', '--quiet'])
    }

    if (!args.has('--fast') && !args.has('--coverage-target')) {
        run('Disposable Compose smoke test', process.execPath,
            [path.join(root, 'scripts', 'smoke.mjs')])
    }

    console.log('\nVerification passed.')
} catch (error) {
    console.error(`\nVerification failed: ${error.message}`)
    process.exit(1)
}
