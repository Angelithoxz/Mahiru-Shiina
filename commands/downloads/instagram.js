import fetch from 'node-fetch'

export default {
  command: ['instagram', 'ig'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {

    if (!args[0]) {
      return m.reply('《✧》 Ingresa un enlace de Instagram.')
    }

    if (!/instagram\.com/.test(args[0])) {
      return m.reply('《✧》 El enlace no parece ser de *Instagram*.')
    }

    try {

      const data = await getInstagramMedia(args[0])

      if (!data) {
        return m.reply('《✧》 No se pudo descargar el contenido.')
      }

      const caption =
`ㅤ۟∩　ׅ　★ ໌　ׅ　🅘𝖦 🅓ownload　ׄᰙ

${data.title ? `𖣣ֶㅤ֯⌗ ❀ ⬭ *Usuario* › ${data.title}` : ''}
${data.caption ? `𖣣ֶㅤ֯⌗ ❀ ⬭ *Descripción* › ${data.caption}` : ''}
${data.like ? `𖣣ֶㅤ֯⌗ ❀ ⬭ *Likes* › ${data.like}` : ''}
${data.comment ? `𖣣ֶㅤ֯⌗ ❀ ⬭ *Comentarios* › ${data.comment}` : ''}
${data.views ? `𖣣ֶㅤ֯⌗ ❀ ⬭ *Vistas* › ${data.views}` : ''}
${data.duration ? `𖣣ֶㅤ֯⌗ ❀ ⬭ *Duración* › ${data.duration}` : ''}
${data.resolution ? `𖣣ֶㅤ֯⌗ ❀ ⬭ *Resolución* › ${data.resolution}` : ''}
${data.format ? `𖣣ֶㅤ֯⌗ ❀ ⬭ *Formato* › ${data.format}` : ''}

𖣣ֶㅤ֯⌗ ❀ ⬭ *Enlace* › ${args[0]}`

      if (data.type === 'video') {

        await client.sendMessage(m.chat, {
          video: { url: data.url },
          caption: caption,
          mimetype: 'video/mp4'
        }, { quoted: m })

      } else {

        await client.sendMessage(m.chat, {
          image: { url: data.url },
          caption: caption
        }, { quoted: m })

      }

    } catch (e) {

      console.error(e)

      m.reply(
`> Error ejecutando *${usedPrefix + command}*
> Error: ${e.message}`
      )

    }
  }
}

async function getInstagramMedia(url) {

  const apis = [

    `${global.APIs.stellar.url}/dl/instagramv2?url=${encodeURIComponent(url)}&key=${global.APIs.stellar.key}`,

    `${global.APIs.nekolabs.url}/downloader/instagram?url=${encodeURIComponent(url)}`,

    `${global.APIs.delirius.url}/download/instagram?url=${encodeURIComponent(url)}`

  ]

  for (const endpoint of apis) {

    try {

      const res = await fetch(endpoint)

      if (!res.ok) continue

      const json = await res.json()

      const result = extractData(json)

      if (result) return result

    } catch (e) {

      console.log('API error:', e.message)

    }

    await new Promise(r => setTimeout(r, 1200))

  }

  return null
}

function extractData(res) {

  if (!res) return null

  if (res.data?.url) {

    return {
      type: res.data.type === 'video' ? 'video' : 'image',
      title: res.data.username || null,
      caption: res.data.caption || null,
      url: res.data.url,
      format: res.data.type === 'video' ? 'mp4' : 'jpg'
    }

  }

  if (Array.isArray(res.data) && res.data[0]?.url) {

    return {
      type: res.data[0].type === 'video' ? 'video' : 'image',
      url: res.data[0].url,
      format: res.data[0].type === 'video' ? 'mp4' : 'jpg'
    }

  }

  if (res.result?.downloadUrl?.[0]) {

    return {
      type: res.result.metadata?.isVideo ? 'video' : 'image',
      title: res.result.metadata?.username || null,
      caption: res.result.metadata?.caption || null,
      like: res.result.metadata?.like || null,
      comment: res.result.metadata?.comment || null,
      url: res.result.downloadUrl[0],
      format: res.result.metadata?.isVideo ? 'mp4' : 'jpg'
    }

  }

  return null
}