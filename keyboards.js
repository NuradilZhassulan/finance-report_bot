module.exports = {
    menu_btn: {
        reply_markup: JSON.stringify({
            keyboard: [
                [{text: '🤑 Заработал', callback_data: 'income'}, {text: '😢 Потратил', callback_data: 'expenses'}],
                [{text: '🧐 История', callback_data: 'history'}, {text: '🙅‍♂️Отмена', callback_data: 'cancel'}],
            ],
            resize_keyboard: true,
        })
    },
    period_btn: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'День', callback_data: 'day'}, {text: 'Месяц', callback_data: 'month'}],
                [{text: 'Год', callback_data: 'year'}, {text: 'Все время', callback_data: 'allDate'}]
            ],
            ReplyKeyboardRemove: true,
            one_time_keyboard: true,
            remove_keyboard: true
        })
    },
    transactions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Доходы', callback_data: 'earned'}, {text: 'Расходы', callback_data: 'spent'}],
                [{text: 'Общее', callback_data: 'allTransaction'}]
            ]
        })
    },
    spent_item: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Квартира', callback_data: 'квартира'}, {text: 'Комы', callback_data: 'комы'}],
                [{text: 'Инетернет', callback_data: 'инетернет'}, {text: 'Продукты', callback_data: 'продукты'}],
                [{text: 'Кредит', callback_data: 'кредит'}, {text: 'Салон', callback_data: 'салон'}],
                [{text: 'Такси', callback_data: 'такси'}, {text: 'Развлечение', callback_data: 'развлечение'}],
                [{text: 'Мыломойка', callback_data: 'мыломойка'}, {text: 'Здоровье', callback_data: 'здоровье'}],
                [{text: 'Образование', callback_data: 'образование'}, {text: 'Подарки', callback_data: 'подарки'}],
                [{text: 'Одежда', callback_data: 'одежда'}, {text: 'Обувь', callback_data: 'обувь'}],
                [{text: 'Прочее', callback_data: 'прочее'},{text: 'Поел', callback_data: 'поел'}],
                [{text: 'ВСЕ', callback_data: 'все'}]
            ]
        })
    }
}



