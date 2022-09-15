const { Telegraf } = require('telegraf')
require('datejs')
const { menu_btn, period_btn, transactions, spent_item } = require('./keyboards')
const { add_record, get_records, get_records_filter } = require('./db')
const TOKEN = '5653248232:AAFpIF48--w_tOSMBXykkGsZgzAAQma-Dh8'

const bot = new Telegraf(TOKEN)

const choose_menu = {}
const choose_period = {}

function getResult(results) {
    let resultOutput  = ''
    if(results.length !== 0) {
        for(const result of results) {
            resultOutput+= ((result.operation===1)?'+':'-') + ' ' + result.amount + ' ' + result.value + ' ' + result.date + '\n'
        }
        return resultOutput
    } else {
        return '🤷‍♂️'
    }
}

const start = async () => {
    try {
        const date = new Date().toString('yyyy-MM-dd HH:mm:ss')

        bot.start(async msg => {
            try {
                const chatId = msg.chat.id
                console.log(chatId)
                console.log(msg.chat.first_name)
                if (chatId === 400336335 || chatId === 447380766 || chatId === 306135758 || chatId === 1798437017 || chatId === 1188871472) {
                    await msg.reply(`хай ${msg.chat.first_name}`, menu_btn)
                } else {
                    await msg.reply(`🫵 ${msg.chat.first_name} ❌ в базе`)
                    await msg.reply(`🖕`)
                    await msg.reply(`ой`)
                    await msg.reply(`🫰`)
                }
            } catch (err) {
                await msg.reply('😵', err)
                console.log('При нажатии кнопки в меню, что то пошло не так', err)
            }
        })

        bot.hears(['🤑 Заработал','😢 Потратил', '🧐 История', '🙅‍♂️Отмена'], async msg => {
            try {
                const chatId = msg.message.chat.id
                if(msg.update.message.text === '🤑 Заработал') {
                    choose_menu[chatId] = '🤑 Заработал'
                    await msg.replyWithHTML('👇 В формате: 👇 \n<i>700000 зп|подработка|подарили</i>')
                } else if(msg.update.message.text === '😢 Потратил') {
                    choose_menu[chatId] = '😢 Потратил'
                    await msg.replyWithHTML('<b>👇 В формате: 👇</b> \n<i>70000 продукты</i>')
                    await msg.replyWithHTML('<b>Разрешено:</b> \n<i>Квартира|Комы|Интернет|Продукты|Кредит|Салон|\nТакси|Развлечение|Мыломойка|Здоровье|Образование|\nПодарки|Одежда|Обувь|Прочее|Поел</i>')
                } else if(msg.update.message.text === '🧐 История') {
                    choose_menu[chatId] = '🧐 История'
                    await msg.reply('👀', period_btn)
                } else if(msg.update.message.text === '🙅‍♂️Отмена') {
                    await msg.reply('отменил')
                    delete choose_menu[chatId]
                }
            } catch (err) {
                await msg.reply('😵', err)
                console.log('При нажатии кнопки в меню, что то пошло не так', err)
            }
        })

        bot.on("callback_query", async msg => {
            try {
                const chatId = msg.update.callback_query.from.id
                const choose_btn = msg.update.callback_query.data
                let results
                if(choose_btn==='day' || choose_btn==='month' || choose_btn==='year' || choose_btn==='allDate') {
                    choose_period[chatId] = msg.update.callback_query.data
                    await msg.editMessageText(`👀`, msg.update.callback_query.message.message_id)
                    await msg.reply('👇', transactions)
                } else if(choose_btn==='allTransaction') {
                    await msg.editMessageText(`👀`, msg.update.callback_query.message.message_id)
                    results = await get_records(chatId, choose_period[chatId])
                    let resultOutput = getResult(results)
                    await msg.replyWithHTML(resultOutput)
                    delete choose_period[chatId]
                } else if(choose_btn==='earned') {
                    await msg.editMessageText(`👀`, msg.update.callback_query.message.message_id)
                    results = await get_records_filter(chatId, choose_period[chatId], '+' )
                    let resultOutput = getResult(results)
                    await msg.replyWithHTML(resultOutput)
                    delete choose_period[chatId]
                } else if(choose_btn==='spent') {
                    await msg.editMessageText(`👀`, msg.update.callback_query.message.message_id)
                    await msg.reply('👇', spent_item)
                } else if(choose_btn==='все') {
                    await msg.editMessageText(`👀`, msg.update.callback_query.message.message_id)
                    results = await get_records_filter(chatId, choose_period[chatId], '-' )
                    let resultOutput = getResult(results)
                    await msg.replyWithHTML(resultOutput)
                    delete choose_period[chatId]
                } else if(choose_btn==='квартира' || choose_btn==='комы' || choose_btn==='интернет' || choose_btn==='продукты' ||
                    choose_btn==='кредит' || choose_btn==='салон' || choose_btn==='такси' || choose_btn==='развлечение' ||
                    choose_btn==='мыломойка' || choose_btn==='здоровье' || choose_btn==='образование' || choose_btn==='подарки' ||
                    choose_btn==='одежда' || choose_btn==='обувь' || choose_btn==='прочее' ) {
                    await msg.editMessageText(`История за ${choose_btn}`, msg.update.callback_query.message.message_id)
                    results = await get_records_filter(chatId, choose_period[chatId], '-' , choose_btn)
                    let resultOutput = getResult(results)
                    await msg.replyWithHTML(resultOutput)
                    delete choose_period[chatId]
                }
            } catch (err) {
                await msg.reply('😵', err)
                console.log('При нажатии на кнопку, что то пошло не так', err)
            }
        })

        bot.on('text', async msg => {
            try {
                const chatId = msg.chat.id
                const textArr = msg.update.message.text.split(' ')
                const number = textArr[0]
                const text = textArr[1]
                let result
                if(choose_menu[chatId] === '🤑 Заработал') {
                    if(/[0-9]/.test(number) && /зп|подработка|подарили/i.test(text)) {
                        result = await add_record(chatId, '+', number, text.toLowerCase(), date)
                        await msg.replyWithHTML(`записал заработок: ${number} тг в колонку ${text}`)
                        await msg.replyWithHTML(result)
                        delete choose_menu[chatId]
                    } else {
                        await msg.reply('Принимаю как в примере и только "зп|подработка|подарили"')
                        delete choose_menu[chatId]
                    }
                } else if(choose_menu[chatId] === '😢 Потратил') {
                    if(/[0-9]/.test(number) && /Квартира|Комы|Интернет|Продукты|Кредит|Салон|Такси|Развлечение|Мыломойка|Здоровье|Образование|Подарки|Одежда|Обувь|Прочее|Поел/i.test(text)) {
                        result = await add_record(chatId, '-', number, text.toLowerCase(), date)
                        await msg.replyWithHTML(`записал на траты: ${number} тг категория ${text}`)
                        await msg.replyWithHTML(result)
                        delete choose_menu[chatId]
                    } else {
                        await msg.replyWithHTML('Принимаю как в примере и только "Квартира|Комы|Интернет|Продукты|Кредит|Салон|Такси|\nРазвлечение|Мыломойка|Здоровье|Образование|Подарки|Одежда|Обувь|Прочее|Поел"')
                        delete choose_menu[chatId]
                    }
                } else if(choose_menu[chatId] === '🧐 История') {
                    await msg.replyWithHTML('👆')
                    delete choose_menu[chatId]
                } else {
                    await msg.reply('Выбери из 👇 меню')
                }
            } catch (err) {
                await msg.reply('😵', err)
                console.log('При вводе текста, что то пошло не так', err)
            }
        })
        bot.launch()
    } catch (err) {
        console.log('Что то пошло не так', err)
    }
}

start()