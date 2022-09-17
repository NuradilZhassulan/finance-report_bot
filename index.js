const { Telegraf } = require('telegraf')
require('datejs')
require('dotenv').config()
const { menu_btn, period_btn, transactions, spent_item, earned_item } = require('./keyboards')
const { add_record, get_records, get_records_filter, deleteDB } = require('./db')

const bot = new Telegraf(process.env.TOKEN)

const choose_menu = {}  //-------Сохранения выбранной кнопки в меню
const choose_period = {}  //-------Сохранения выбранного периода
const choose_number = {}  //-------Сохранения введенной суммы
const choose_transactions = {}  //-------Сохранения выбранной транзакций

/* ---Функция выведения историй доходов/расходов--- */
function getResult(response) {
    let resultOutput  = ''
    let sumEarned = 0
    let sumSpent = 0
    if(response.length !== 0) {
        for(const result of response) {
            //Добавление общую сумму доходов/расходов и каждую транзакцию
            (result.operation===1)?sumEarned+=Number(result.amount):sumSpent+=Number(result.amount)
            resultOutput+= ((result.operation===1)?'+':'-') + ' ' + result.amount + ' ' + result.value + ' ' + result.date + '\n'
        }
        if(sumEarned!==0 && sumSpent!==0) {
            //Если выбрал вывод общей историй
            resultOutput+=`----------------\nОбщее по доходам: ${sumEarned} \n`
            resultOutput+=`----------------\nОбщее по расходам: ${sumSpent}`
        } else if (sumEarned!==0) {
            //Если выбрал вывод по доходам
            resultOutput+=`----------------\nОбщее по доходам: ${sumEarned}`
        } else if (sumSpent!==0) {
            //Если выбрал вывод по расходам
            resultOutput+=`----------------\nОбщее по расходам: ${sumSpent}`
        }
        return resultOutput //Вывод списка транзакций и сумированным доходом/расходом
    } else {
        return '🤷‍♂️'
    }
}

const start = async () => {
    try {
        const date = new Date().toString('yyyy-MM-dd HH:mm:ss')
        /* ---Удаление записей--- */
        bot.command('deleteDB', async msg => {
            try {
                console.log('delete correct')
                let response = await deleteDB()
                await msg.replyWithHTML(response)
            } catch (err) {
                await msg.reply('😵', err)
                console.log('при удалений записей что то пошло не так', err)
            }
        })

        /* ---Запуск бота--- */
        bot.start(async msg => {
            try {
                const userId = msg.chat.id
                //бот отработает для определенных юзеров
                if (userId === 400336335 || userId === 257689171) {
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
        /*-------------------*/

        /* ---Логика отработки кнопок в меню--- */
        bot.hears(['🤑 Заработал','😢 Потратил', '🧐 История', '🙅‍♂️Отмена'], async msg => {
            try {
                const userId = msg.message.chat.id
                if(msg.update.message.text === '🤑 Заработал' || msg.update.message.text === '😢 Потратил') {
                    choose_menu[userId] = (msg.update.message.text === '🤑 Заработал') ? '🤑 Заработал' : '😢 Потратил'
                    await msg.replyWithHTML('💰 Сколько? 💰')
                } else if(msg.update.message.text === '🧐 История') {
                    choose_menu[userId] = '🧐 История'
                    await msg.reply('👀', period_btn)
                } else if(msg.update.message.text === '🙅‍♂️Отмена') {
                    await msg.reply('👌')
                    delete choose_menu[userId]
                }
            } catch (err) {
                await msg.reply('😵', err)
                console.log('При нажатии кнопки в меню, что то пошло не так', err)
            }
        })
        /*-------------------*/

        /* ---Внесение суммы дохода/расхода--- */
        bot.on('text', async msg => {
            try {
                const userId = msg.chat.id
                //удаляем все пробелы, оставляем только цифры
                choose_number[userId] = msg.update.message.text.split(' ').join('').replace(/[^0-9]/g, "")
                switch (choose_menu[userId]) {
                    case '🤑 Заработал':
                        if(choose_number[userId].length === 0) {
                            await msg.replyWithHTML('Цифры где 😒\n\nВведи сумму')
                        } else {
                            await msg.replyWithHTML(`Откуда пришли 🤑`, earned_item)
                        }
                        break
                    case '😢 Потратил':
                        if(choose_number[userId].length === 0) {
                            await msg.replyWithHTML('Цифры где 😒\n\nВведи сумму')
                        } else {
                            await msg.replyWithHTML(`Куда потратил 💵`, spent_item)
                        }
                        break
                    case '🧐 История':
                        await msg.replyWithHTML('👆')
                        delete choose_menu[userId]
                        break
                    default:
                        await msg.reply('Выбери из 👇 меню')
                        break
                }
            } catch (err) {
                await msg.reply('😵', err)
                console.log('При вводе текста, что то пошло не так', err)
            }
        })
        /*-------------------*/

        /* ---Логика отработки инлайновых кнопок--- */
        bot.on("callback_query", async msg => {
            try {
                const userId = msg.update.callback_query.from.id   // ID юзера
                const choose_btn = msg.update.callback_query.data   // Выбранная кнопка
                const message_id = msg.update.callback_query.message.message_id //для удаления нажатой инлайн-кнопки
                let response //ответ от БД
                switch (choose_btn) {
                    case 'day': case 'month': case 'year': case 'allDate':
                        choose_period[userId] = choose_btn
                        await msg.editMessageText(`👀`, message_id)
                        await msg.reply('👇', transactions)
                        break
                    case 'allTransaction':
                        await msg.editMessageText(`👀`, message_id)
                        response = await get_records(userId, choose_period[userId])
                        let resultOutput = getResult(response)
                        await msg.replyWithHTML(resultOutput)
                        delete choose_period[userId]
                        break
                    case 'earned':
                        choose_transactions[userId] = choose_btn
                        await msg.editMessageText(`👀`, message_id)
                        await msg.reply('👇', earned_item)
                        delete choose_period[userId]
                        break
                    case 'spent':
                        choose_transactions[userId] = choose_btn
                        await msg.editMessageText(`👀`, message_id)
                        await msg.reply('👇', spent_item)
                        delete choose_period[userId] //???
                        break
                    case 'все':
                        if(choose_menu[userId] === '🧐 История') {
                            await msg.editMessageText(`👀`, message_id)
                            if(choose_transactions[userId] !== 'earned') {
                                response = await get_records_filter(userId, choose_period[userId], '-' )
                                delete choose_transactions[userId]
                            } else {
                                response = await get_records_filter(userId, choose_period[userId], '+' )
                                delete choose_transactions[userId]
                            }
                            let resultOutput = getResult(response)
                            await msg.replyWithHTML(resultOutput)
                            delete choose_period[userId]
                        } else {
                            await msg.editMessageText('Выбери другую категорию', message_id)
                        }
                        break
                    case 'зп': case 'подработка': case 'подарили': case 'нашел':
                        if(choose_menu[userId] === '🤑 Заработал') {
                            response = await add_record(userId, '+', choose_number[userId], choose_btn, date)
                            await msg.editMessageText(`записал заработок: ${choose_number[userId]} тг в колонку ${choose_btn}`, msg.update.callback_query.message.message_id)
                            await msg.replyWithHTML(response)
                            delete choose_menu[userId]
                        } else {
                            await msg.editMessageText(`👀`, msg.update.callback_query.message.message_id)
                            response = await get_records_filter(userId, choose_period[userId], '+', choose_btn)
                            let resultOutput = getResult(response)
                            await msg.replyWithHTML(resultOutput)
                            delete choose_period[userId]
                        }
                        break
                    case 'квартира': case 'комы': case 'интернет': case 'продукты': case 'кредит': case 'салон':
                    case 'такси': case 'развлечение': case 'мыломойка': case 'здоровье': case 'образование':
                    case 'подарки': case 'одежда': case 'обувь': case 'прочее': case 'поел':
                        if(choose_menu[userId] === '😢 Потратил') {
                            response = await add_record(userId, '-', choose_number[userId], choose_btn, date)
                            await msg.editMessageText(`записал на траты: ${choose_number[userId]} тг категория ${choose_btn}`, msg.update.callback_query.message.message_id)
                            await msg.replyWithHTML(response)
                            delete choose_menu[userId]
                        } else {
                            await msg.editMessageText(`История за ${choose_btn}`, msg.update.callback_query.message.message_id)
                            response = await get_records_filter(userId, choose_period[userId], '-', choose_btn)
                            let resultOutput = getResult(response)
                            await msg.replyWithHTML(resultOutput)
                            delete choose_period[userId]
                        }
                        break
                    default:
                        await msg.reply('Выбери из 👇 меню')
                        break
                }
            } catch (err) {
                await msg.reply('😵', err)
                console.log('При нажатии на кнопку, что то пошло не так', err)
            }
        })
        /*-------------------*/

        bot.launch() //запуск бота

        process.once('SIGINT', () => bot.stop('SIGINT'));
        process.once('SIGTERM', () => bot.stop('SIGTERM'));

    } catch (err) {
        console.log('Что то пошло не так', err)
    }
}

start()