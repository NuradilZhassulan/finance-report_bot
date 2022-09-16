const { Telegraf } = require('telegraf')
require('datejs')
const { menu_btn, period_btn, transactions, spent_item, earned_item } = require('./keyboards')
const { add_record, get_records, get_records_filter } = require('./db')
const TOKEN = '5653248232:AAFpIF48--w_tOSMBXykkGsZgzAAQma-Dh8'

const bot = new Telegraf(TOKEN)

const choose_menu = {}
const choose_period = {}
const choose_number = {}
const choose_transactions = {}

function getResult(results) {
    let resultOutput  = ''
    let sumEarned = 0
    let sumSpent = 0
    if(results.length !== 0) {
        for(const result of results) {
            (result.operation===1)?sumEarned+=Number(result.amount):sumSpent+=Number(result.amount)
            resultOutput+= ((result.operation===1)?'+':'-') + ' ' + result.amount + ' ' + result.value + ' ' + result.date + '\n'
        }
        if(sumEarned!==0 && sumSpent!==0) {
            resultOutput+=`----------------\nОбщее по доходам: ${sumEarned} \n`
            resultOutput+=`----------------\nОбщее по расходам: ${sumSpent}`
        } else if (sumEarned!==0) {
            resultOutput+=`----------------\nОбщее по доходам: ${sumEarned}`
        } else if (sumSpent!==0) {
            resultOutput+=`----------------\nОбщее по расходам: ${sumSpent}`
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
                if (chatId === 400336335 || chatId === 447380766 || chatId === 306135758 || chatId === 1798437017 || chatId === 1188871472 || chatId === 257689171) {
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
                console.log(msg.chat.first_name)
                if(msg.update.message.text === '🤑 Заработал' || msg.update.message.text === '😢 Потратил') {
                    choose_menu[chatId] = (msg.update.message.text === '🤑 Заработал') ? '🤑 Заработал' : '😢 Потратил'
                    await msg.replyWithHTML('Сколько?')
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

        bot.on('text', async msg => {
            try {
                const chatId = msg.chat.id
                choose_number[chatId] = msg.update.message.text.split(' ').join('').replace(/[^0-9]/g, "")
                if(choose_menu[chatId] === '🤑 Заработал' || choose_menu[chatId] === '😢 Потратил') {
                    if(choose_number[chatId].length === 0) {
                        await msg.replyWithHTML('цифры нужны')
                    } else {
                        (choose_menu[chatId] === '🤑 Заработал') ? await msg.replyWithHTML(`Откуда`, earned_item) : await msg.replyWithHTML(`Куда`, spent_item)
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

        bot.on("callback_query", async msg => {
            try {
                const chatId = msg.update.callback_query.from.id
                const choose_btn = msg.update.callback_query.data
                let results
                if(choose_btn==='day' || choose_btn==='month' || choose_btn==='year' || choose_btn==='allDate') {
                    choose_period[chatId] = choose_btn
                    await msg.editMessageText(`👀`, msg.update.callback_query.message.message_id)
                    await msg.reply('👇', transactions)
                } else if(choose_btn==='allTransaction') {
                    await msg.editMessageText(`👀`, msg.update.callback_query.message.message_id)
                    results = await get_records(chatId, choose_period[chatId])
                    let resultOutput = getResult(results)
                    await msg.replyWithHTML(resultOutput)
                    delete choose_period[chatId]
                } else if(choose_btn==='earned') {
                    choose_transactions[chatId] = choose_btn
                    await msg.editMessageText(`👀`, msg.update.callback_query.message.message_id)
                    await msg.reply('👇', earned_item)
                    delete choose_period[chatId]
                } else if(choose_btn==='spent') {
                    choose_transactions[chatId] = choose_btn
                    await msg.editMessageText(`👀`, msg.update.callback_query.message.message_id)
                    await msg.reply('👇', spent_item)
                } else if(choose_btn==='все') {
                    if(choose_menu[chatId] === '🧐 История') {
                        console.log(choose_transactions)
                        await msg.editMessageText(`👀`, msg.update.callback_query.message.message_id)
                        if(choose_transactions[chatId] !== 'earned') {
                            results = await get_records_filter(chatId, choose_period[chatId], '-' )
                            delete choose_transactions[chatId]
                        } else {
                            results = await get_records_filter(chatId, choose_period[chatId], '+' )
                            delete choose_transactions[chatId]
                        }
                        let resultOutput = getResult(results)
                        await msg.replyWithHTML(resultOutput)
                        delete choose_period[chatId]
                    } else {
                        await msg.reply('Выбери другую категорию')
                    }
                } else if(choose_btn==='зп' || choose_btn==='подработка' || choose_btn==='подарили' || choose_btn==='нашел') {
                    if(choose_menu[chatId] === '🤑 Заработал') {
                        results = await add_record(chatId, '+', choose_number[chatId], choose_btn, date)
                        await msg.editMessageText(`записал заработок: ${choose_number[chatId]} тг в колонку ${choose_btn}`, msg.update.callback_query.message.message_id)
                        await msg.replyWithHTML(results)
                        delete choose_menu[chatId]
                    } else {
                        await msg.editMessageText(`👀`, msg.update.callback_query.message.message_id)
                        results = await get_records_filter(chatId, choose_period[chatId], '+', choose_btn)
                        let resultOutput = getResult(results)
                        await msg.replyWithHTML(resultOutput)
                        delete choose_period[chatId]
                    }
                } else if(choose_btn==='квартира' || choose_btn==='комы' || choose_btn==='интернет' || choose_btn==='продукты' ||
                    choose_btn==='кредит' || choose_btn==='салон' || choose_btn==='такси' || choose_btn==='развлечение' ||
                    choose_btn==='мыломойка' || choose_btn==='здоровье' || choose_btn==='образование' || choose_btn==='подарки' ||
                    choose_btn==='одежда' || choose_btn==='обувь' || choose_btn==='прочее' || choose_btn==='поел' ) {
                    if(choose_menu[chatId] === '😢 Потратил') {
                        results = await add_record(chatId, '-', choose_number[chatId], choose_btn, date)
                        await msg.editMessageText(`записал на траты: ${choose_number[chatId]} тг категория ${choose_btn}`, msg.update.callback_query.message.message_id)
                        await msg.replyWithHTML(results)
                        delete choose_menu[chatId]
                    } else {
                        await msg.editMessageText(`История за ${choose_btn}`, msg.update.callback_query.message.message_id)
                        results = await get_records_filter(chatId, choose_period[chatId], '-', choose_btn)
                        let resultOutput = getResult(results)
                        await msg.replyWithHTML(resultOutput)
                        delete choose_period[chatId]
                    }
                }
            } catch (err) {
                await msg.reply('😵', err)
                console.log('При нажатии на кнопку, что то пошло не так', err)
            }
        })

        bot.launch()

    } catch (err) {
        console.log('Что то пошло не так', err)
    }
}

start()