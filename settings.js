import fs from 'fs';
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'

global.owner = ['51901930696', '51910340144']
global.botNumber = ''

global.sessionName = 'Sessions/Owner'
global.version = '^2.0 - Latest'
global.dev = "Build With By Angelithoxyz"
global.links = {
api: 'https://api.stellarwa.xyz',
channel: "https://whatsapp.com/channel/0029Vaz6RTR0LKZIKwudX32x",
github: "https://github.com/Angelithoxz/Hatsune-Miku",
}
global.my = {
ch: '120363374826926142@newsletter',
name: '=͟͟͞𝐑𝐲𝐮𝐬𝐞𝐢 𝐂𝐥𝐮𝐛 𝐈𝐧𝐟𝐢𝐧𝐢𝐭𝐲 - 𝐎𝐟𝐢𝐜𝐢𝐚𝐥 𝐂𝐡𝐚𝐧𝐧𝐞𝐥⏤͟͟͞͞★',
}

global.mess = {
socket: '《✧》 Este comando solo puede ser ejecutado por un Socket.',
admin: '《✧》 Este comando solo puede ser ejecutado por los Administradores del Grupo.',
botAdmin: '《✧》 Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo.'
}

global.APIs = {
adonix: { url: "https://api-adonix.ultraplus.click", key: "Yuki-WaBot" },
vreden: { url: "https://api.vreden.web.id", key: null },
nekolabs: { url: "https://api.nekolabs.web.id", key: null },
siputzx: { url: "https://api.siputzx.my.id", key: null },
delirius: { url: "https://api.delirius.store", key: null },
ootaizumi: { url: "https://api.ootaizumi.web.id", key: null },
stellar: { url: "https://api.stellarwa.xyz", key: "YukiWaBot" },
apifaa: { url: "https://api-faa.my.id", key: null },
xyro: { url: "https://api.xyro.site", key: null },
yupra: { url: "https://api.yupra.my.id", key: null }
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  import(`${file}?update=${Date.now()}`)
})
