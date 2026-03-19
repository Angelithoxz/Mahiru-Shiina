import fetch from 'node-fetch'

const GITHUB_TOKEN = ''

const SOURCE_OWNER = 'iamDestroy'
const SOURCE_REPO = 'YukiBot-MD'

const TARGET_OWNER = 'Angelithoxz'
const TARGET_REPO = 'Alya-Wa'

const BRANCH = 'main'
const HOURS = 72

const EXCLUDE = [
  'lib/system/',
  'lib/mods.js',
  'lib/prems.js',
  'settings.js',

  'commands/socket/mods.js',
  'commands/socket/prems.js',
  'commands/socket/bots.js',
  'commands/socket/seticon.js',
  'commands/socket/setbanner.js',

  'commands/main/menu.js',
  'commands/main/infobot.js',

  'commands/owner/token.js',
  'commands/owner/tokenmod.js',

  'commands/utils/tourl.js',
  'commands/owner/clearsubs.js'
]

const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
}

let LAST_ANALYSIS = null

async function gh(endpoint, options = {}) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    headers,
    ...options
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t)
  }
  return res.json()
}

function isExcluded(file) {
  return EXCLUDE.some(e => file.startsWith(e))
}

async function getCommits(since) {
  let page = 1
  const commits = []

  while (true) {
    const data = await gh(
      `/repos/${SOURCE_OWNER}/${SOURCE_REPO}/commits?sha=${BRANCH}&since=${since}&per_page=100&page=${page}`
    )
    if (!data.length) break
    commits.push(...data)
    page++
  }

  return commits
}

async function analyzeChanges() {
  if (!GITHUB_TOKEN || GITHUB_TOKEN.length < 20) {
    throw new Error('TOKEN_NO_DEFINIDO')
  }

  const since = new Date(Date.now() - HOURS * 60 * 60 * 1000).toISOString()
  const commits = await getCommits(since)

  const files = new Set()

  for (const c of commits) {
    const detail = await gh(
      `/repos/${SOURCE_OWNER}/${SOURCE_REPO}/commits/${c.sha}`
    )

    for (const f of detail.files || []) {
      if (f.status === 'removed') continue
      if (isExcluded(f.filename)) continue
      files.add(f.filename)
    }
  }

  return [...files]
}

async function updateFile(file) {
  const raw = `https://raw.githubusercontent.com/${SOURCE_OWNER}/${SOURCE_REPO}/${BRANCH}/${file}`
  const content = await fetch(raw).then(r => r.text())

  let sha = null
  try {
    const res = await gh(
      `/repos/${TARGET_OWNER}/${TARGET_REPO}/contents/${file}?ref=${BRANCH}`
    )
    sha = res.sha
  } catch {}

  const body = {
    message: `sync: ${file}`,
    content: Buffer.from(content).toString('base64'),
    branch: BRANCH
  }

  if (sha) body.sha = sha

  await gh(
    `/repos/${TARGET_OWNER}/${TARGET_REPO}/contents/${file}`,
    {
      method: 'PUT',
      body: JSON.stringify(body)
    }
  )
}

async function applyChanges(files) {
  let count = 0
  for (const file of files) {
    await updateFile(file)
    count++
  }
  return count
}

export default {
  command: ['actu'],
  category: 'utils',
  run: async (client, m, args) => {
    try {
      if (args[0] === 'confirmar') {
        if (!LAST_ANALYSIS || LAST_ANALYSIS.length === 0) {
          return m.reply('❌ No hay cambios analizados para confirmar')
        }

        const total = await applyChanges(LAST_ANALYSIS)
        LAST_ANALYSIS = null

        return m.reply(
          `✅ SINCRONIZACIÓN APLICADA\n` +
          `📦 Archivos actualizados: ${total}`
        )
      }

      const files = await analyzeChanges()
      LAST_ANALYSIS = files

      if (files.length === 0) {
        return m.reply('ℹ️ No hay cambios nuevos en los últimos 3 días')
      }

      const list = files.slice(0, 20).map(f => `• ${f}`).join('\n')

      m.reply(
        `⚠️ CONFIRMACIÓN DE ACTUALIZACIÓN\n\n` +
        `📦 Archivos a actualizar: ${files.length}\n\n` +
        `${list}\n` +
        `${files.length > 20 ? '…y más' : ''}\n\n` +
        `👉 Escribe *actu confirmar* para aplicar los cambios`
      )

    } catch (e) {
      m.reply(`❌ Error\n${e.message}`)
    }
  }
}