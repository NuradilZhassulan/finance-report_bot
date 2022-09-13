module.exports = {
    menu_btn: {
        reply_markup: JSON.stringify({
            keyboard: [
                [{text: '🤑 Заработал', callback_data: 'income'}, {text: '😢 Потратил', callback_data: 'expenses'}],
                [{text: '🧐 История', callback_data: 'history'}, {text: '🙅‍♂️Отмена', callback_data: 'cancel'}],
            ],
            resize_keyboard: true,
        })
    }

}



