const { Telegraf } = require('telegraf')
const { menu_btn } = require('./keyboards')
const TOKEN = '5653248232:AAFpIF48--w_tOSMBXykkGsZgzAAQma-Dh8'

const bot = new Telegraf(TOKEN)

const chats = {}

const start = () => {
    try {

    } catch (err) {
        console.log('Подключение к БД сломалось', err)
    }

    bot.start(async msg => {
        const chatId = msg.chat.id
        await msg.reply(`хай ${msg.chat.first_name}`, menu_btn)
    })

    bot.hears(['🤑 Заработал','😢 Потратил', '🧐 История', '🙅‍♂️Отмена'], async msg => {
        try {
            const chatId = msg.message.chat.id
            if(msg.update.message.text === '🤑 Заработал') {
                chats[chatId] = '🤑 Заработал'
                await msg.replyWithHTML('В формате: \n<i>700000 ЗП</i>')
            } else if(msg.update.message.text === '😢 Потратил') {
                chats[chatId] = '😢 Потратил'
                await msg.replyWithHTML('В формате: \n<i>70000 продукты</i>')
            } else if(msg.update.message.text === '🧐 История') {
                chats[chatId] = '🧐 История'
                await msg.reply('смотри')
            } else if(msg.update.message.text === '🙅‍♂️Отмена') {
                await msg.reply('отменил')
                delete chats[chatId]
            }
        } catch (err) {
            await msg.reply('Что то пошло не так', err)
            console.log('Что то пошло не так', err)
        }
    })

    bot.on('text', async msg => {
        try {
            const chatId = msg.chat.id
            const textArr = msg.update.message.text.split(' ')
            const number = textArr[0]
            const text = textArr[1]
            if(chats[chatId] === '🤑 Заработал') {
                if(/[0-9]/.test(number) && /зп|подработка|подарили/i.test(text)) {
                    await msg.replyWithHTML(`записал заработок: ${number} тг в колонку ${text}`)
                    delete chats[chatId]
                } else {
                    await msg.reply('Принимаю как в примере и только "зп|подработка|подарили"')
                    delete chats[chatId]
                }
            } else if(chats[chatId] === '😢 Потратил') {
                if(/[0-9]/.test(number) && /Квартира|Комы|Инет|Продукты|Кредит|Салон|Такси|Развлечение|Мыломойка|Здоровье|Образование|Подарки|Одежда|обувь|Прочее|Поел/i.test(text)) {
                    await msg.replyWithHTML(`записал на траты: ${number} тг категория ${text}`)
                    delete chats[chatId]
                } else {
                    await msg.replyWithHTML('Принимаю как в примере и только "Квартира|Комы|Продукты|Кредит|Салон|Такси|\nРазвлечение|Мыломойка|Здоровье|Образование|Подарки|Одежда|обувь|Прочее|Поел"')
                    delete chats[chatId]
                }
            } else if(chats[chatId] === '🧐 История') {
                await msg.reply('История выведена')
                delete chats[chatId]
            } else {
                await msg.reply('Выбери из 👇')
            }
        } catch (err) {
            await msg.reply('Что то пошло не так', err)
            console.log('Что то пошло не так', err)
        }
    })

    bot.launch()

}

start()