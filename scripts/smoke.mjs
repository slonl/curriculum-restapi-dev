#!/usr/bin/env node

import { createHash, randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const targetId = 'ff8e2455-acc8-4ee2-b8a3-1117e9abdbef'
const username = 'smoke@example.test'
const password = 'smoke-secret'
const auth = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
const temp = await mkdtemp(path.join(os.tmpdir(), 'curriculum-restapi-smoke-'))
const data = path.join(temp, 'data')
const logs = path.join(temp, 'logs')
const modules = path.join(temp, 'node_modules')
const project = `slo-smoke-${process.pid}-${Date.now()}`.toLowerCase()
let succeeded = false

function command(commandName, args, options = {}) {
    const result = spawnSync(commandName, args, {
        cwd: root,
        encoding: 'utf8',
        env: smokeEnv,
        ...options
    })
    if (result.error) {
        throw result.error
    }
    if (result.status !== 0) {
        throw new Error([
            `${commandName} ${args.join(' ')} failed (${result.status})`,
            result.stdout,
            result.stderr
        ].filter(Boolean).join('\n'))
    }
    return result.stdout
}

function compose(args, options = {}) {
    return command('docker', [
        'compose',
        '-f', 'docker-compose.yml',
        '-f', 'docker-compose.smoke.yml',
        ...args
    ], options)
}

function gitState(directory) {
    const result = spawnSync('git', ['status', '--porcelain=v1', '-uall'], {
        cwd: directory,
        encoding: 'utf8'
    })
    if (result.status !== 0) {
        throw new Error(`Cannot inspect Git state in ${directory}`)
    }
    return result.stdout
}

async function freePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer()
        server.unref()
        server.on('error', reject)
        server.listen(0, '127.0.0.1', () => {
            const { port } = server.address()
            server.close(error => error ? reject(error) : resolve(port))
        })
    })
}

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: 'application/json',
            Authorization: auth,
            ...options.headers
        }
    })
    const text = await response.text()
    if (!response.ok) {
        throw new Error(`${options.method || 'GET'} ${url}: ${response.status} ${text}`)
    }
    return { response, text }
}

async function waitFor(label, probe, timeout = 120_000) {
    const deadline = Date.now() + timeout
    let lastError
    while (Date.now() < deadline) {
        try {
            return await probe()
        } catch (error) {
            lastError = error
            await new Promise(resolve => setTimeout(resolve, 500))
        }
    }
    throw new Error(`${label} was not ready: ${lastError?.message || 'timeout'}`)
}

const ports = {
    rest: await freePort(),
    search: await freePort(),
    store: await freePort(),
    registration: await freePort()
}

const smokeEnv = {
    ...process.env,
    COMPOSE_PROJECT_NAME: project,
    CURRICULUM_DATA_DIR: data,
    REST_API_KEYS_FILE: path.join(temp, 'apiKeys.json'),
    REST_EDITORS_FILE: path.join(temp, 'editors.json'),
    REST_LOGS_DIR: logs,
    REST_API_NODE_MODULES_DIR: path.join(modules, 'rest-api'),
    STORE_NODE_MODULES_DIR: path.join(modules, 'store'),
    SEARCH_NODE_MODULES_DIR: path.join(modules, 'search'),
    REGISTRATION_NODE_MODULES_DIR: path.join(modules, 'registration'),
    REST_API_HOST_PORT: String(ports.rest),
    SEARCH_HOST_PORT: String(ports.search),
    STORE_HOST_PORT: String(ports.store),
    REGISTRATION_HOST_PORT: String(ports.registration),
    REST_API_CONTAINER_NAME: `${project}-rest-api`,
    SEARCH_CONTAINER_NAME: `${project}-search`,
    STORE_CONTAINER_NAME: `${project}-store`,
    REGISTRATION_CONTAINER_NAME: `${project}-registration`
}

const repositories = [
    root,
    path.join(root, 'curriculum-rest-api'),
    path.join(root, 'curriculum-store'),
    path.join(root, 'curriculum-search-server'),
    path.join(root, 'curriculum-registration-app')
]
const before = new Map(repositories.map(repository =>
    [repository, gitState(repository)]))

try {
    await mkdir(data, { recursive: true })
    await mkdir(logs, { recursive: true })
    for (const service of ['rest-api', 'store', 'search', 'registration']) {
        await mkdir(path.join(modules, service), { recursive: true })
    }
    await copyFile(path.join(root, 'curriculum-store/data/data.jsontag'),
        path.join(data, 'data.jsontag'))
    await copyFile(path.join(root, 'curriculum-store/data/schema.jsontag'),
        path.join(data, 'schema.jsontag'))
    const baseBytes = await readFile(path.join(data, 'data.jsontag'))
    const digest = createHash('sha256').update(baseBytes).digest('hex')
    await writeFile(path.join(data, 'data.integrity.jsontag'),
        `${JSON.stringify({ file: 'data.jsontag', algorithm: 'sha256', digest })}\n`)
    await writeFile(path.join(data, 'command-log.jsontag'), '')
    await writeFile(path.join(data, 'command-status.jsontag'), '')
    await writeFile(smokeEnv.REST_API_KEYS_FILE, JSON.stringify({
        [username]: { key: password, created: '2026-10-15' }
    }))
    await writeFile(smokeEnv.REST_EDITORS_FILE,
        JSON.stringify({ [username]: true }))

    console.log(`Smoke workspace: ${temp}`)
    compose(['up', '-d'])

    const restBase = `http://127.0.0.1:${ports.rest}`
    const storeBase = `http://127.0.0.1:${ports.store}`
    const searchBase = `http://127.0.0.1:${ports.search}`
    const registrationBase = `http://127.0.0.1:${ports.registration}`

    await waitFor('Curriculum Store', async () => {
        const response = await fetch(`${storeBase}/query/`, {
            method: 'POST', body: '1', headers: { Accept: 'application/jsontag' }
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
    })
    const initial = await waitFor('REST API', async () => {
        const result = await request(`${restBase}/uuid/${targetId}`)
        return JSON.parse(result.text)
    })
    await waitFor('Search', async () => {
        const response = await fetch(`${searchBase}/search?text=Arabisch`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const value = await response.json()
        if (!Array.isArray(value)) throw new Error('search did not return an array')
    })
    const integratedSearch = JSON.parse((await request(
        `${restBase}/search/?text=Arabisch`)).text)
    if (!Array.isArray(integratedSearch)) {
        throw new Error('REST search integration did not return an array')
    }
    await waitFor('Registration', async () => {
        const response = await fetch(`${registrationBase}/register/`)
        if (response.status !== 400) throw new Error(`expected 400, got ${response.status}`)
    })

    if (typeof initial.title !== 'string' || !initial.title) {
        throw new Error(`Smoke object ${targetId} has no string title`)
    }
    const commandId = randomUUID()
    const updatedTitle = `${initial.title} [smoke ${commandId.slice(0, 8)}]`
    const body = JSON.stringify({
        id: commandId,
        name: 'patch',
        author: username,
        message: 'Integrated development verification',
        value: [{
            id: targetId,
            name: 'updateEntity',
            '@type': initial['@type'],
            property: 'title',
            prevValue: initial.title,
            newValue: updatedTitle
        }]
    })
    await request(`${restBase}/command/`, {
        method: 'POST', body,
        headers: { 'Content-Type': 'application/json' }
    })

    await waitFor('command completion', async () => {
        const result = await request(`${restBase}/command/${commandId}`)
        const status = JSON.parse(result.text)
        if (status.status === 'failed' || status.status === 'unsafe') {
            throw new Error(`command ended as ${status.status}`)
        }
        if (status.status !== 'done') {
            throw new Error(`command is ${status.status}`)
        }
    }, 30_000)

    const changed = JSON.parse((await request(
        `${restBase}/uuid/${targetId}`)).text)
    if (changed.title !== updatedTitle) {
        throw new Error('REST API did not expose the accepted title')
    }
    const historyBefore = (await request(
        `${restBase}/uuid/${targetId}/history`)).text
    if (!historyBefore.includes(commandId) || !historyBefore.includes(updatedTitle)) {
        throw new Error('Object history omitted the smoke command or title')
    }

    compose(['restart', 'curriculum-store'])
    await waitFor('Curriculum Store after restart', async () => {
        const response = await fetch(`${storeBase}/query/`, {
            method: 'POST', body: '1', headers: { Accept: 'application/jsontag' }
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
    })
    const restarted = await waitFor('REST readback after restart', async () =>
        JSON.parse((await request(`${restBase}/uuid/${targetId}`)).text))
    if (restarted.title !== updatedTitle) {
        throw new Error('Accepted title did not survive Store restart')
    }
    const historyAfter = (await request(
        `${restBase}/uuid/${targetId}/history`)).text
    if (!historyAfter.includes(commandId) || !historyAfter.includes(updatedTitle)) {
        throw new Error('Object history did not survive Store restart')
    }

    for (const repository of repositories) {
        if (gitState(repository) !== before.get(repository)) {
            throw new Error(`Verification changed Git state in ${repository}`)
        }
    }
    succeeded = true
    console.log('Disposable edit, history, and restart readback passed.')
} catch (error) {
    console.error(`Smoke test failed: ${error.message}`)
    try {
        console.error(compose(['logs', '--no-color'], {
            maxBuffer: 10 * 1024 * 1024
        }))
    } catch (logError) {
        console.error(`Could not collect Compose logs: ${logError.message}`)
    }
    throw error
} finally {
    try {
        compose(['down', '--volumes', '--remove-orphans'])
    } catch (error) {
        console.error(`Compose cleanup failed: ${error.message}`)
    }
    if (succeeded) {
        await rm(temp, { recursive: true, force: true })
    } else {
        console.error(`Retained smoke workspace: ${temp}`)
    }
}
