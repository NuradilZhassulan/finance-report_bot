const sqlite3 = require('sqlite3').verbose()

/* ---соединения с БД--- */
const db = new sqlite3.Database('./finance.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
    console.log('Connection successful');
});



async function add_record(user_id, operation, amount, value, date) {
    /* ---Создаем запись о расходе/доходе--- */
    try {
        const sql = `INSERT INTO records (user_id, operation, amount, value, date) VALUES(?,?,?,?,?)`;
        return new Promise(function(resolve, reject) {
            db.run(sql, [user_id, operation === '+', amount, value, date], (err)=>{
                if (err) reject(err.message);
                resolve('🫡');
            });
        })
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function get_records(user_id, within="*") {
    /* ---Получаем историю операций за определенный период--- */
    try {
        if (within === 'day') {
            //за последний день
            const sql = `SELECT * FROM records WHERE user_id = ? AND date BETWEEN datetime('now', 'start of day') AND datetime('now', 'localtime') ORDER BY date`;
            return new Promise(function (resolve, reject) {
                db.all(sql, [user_id], (err, rows)=> {
                    if (err) return console.error(err.message);
                    resolve(rows);
                    reject('error getting record');
                });
            })
        }
        else if(within === 'month') {
            //за последний месяц
            const sql = `SELECT * FROM records WHERE user_id = ? AND date BETWEEN datetime('now', 'start of month') AND datetime('now', 'localtime') ORDER BY date`;
            return new Promise(function (resolve, reject) {
                db.all(sql, [user_id], (err, rows)=> {
                    if (err) return console.error(err.message);
                    resolve(rows);
                    reject('error getting record');
                });
            })
        } else if(within === 'year') {
            //за последний год
            const sql = `SELECT * FROM records WHERE user_id = ? AND date BETWEEN datetime('now', 'start of year') AND datetime('now', 'localtime') ORDER BY date`;
            return new Promise(function (resolve, reject) {
                db.all(sql, [user_id], (err, rows)=> {
                    if (err) return console.error(err.message);
                    resolve(rows);
                    reject('error getting record');
                });
            })
        } else {
            //за все время
            const sql = `SELECT * FROM records WHERE user_id = ? ORDER BY date`;
            return new Promise(function (resolve, reject) {
                db.all(sql, [user_id], (err, rows)=> {
                    if (err) return console.error(err.message);
                    resolve(rows);
                    reject('error getting record');
                });
            })
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function get_records_filter(user_id, within, operation, value) {
    /* ---Получаем историю доходов/расходов--- */
    try {
        if (within === 'day') {
            //за последний день
            const sql = `SELECT * FROM records WHERE user_id = ? AND operation = ? AND value = COALESCE(?, value) AND date BETWEEN datetime('now', 'start of day') AND datetime('now', 'localtime') ORDER BY date`;
            return new Promise(function (resolve, reject) {
                db.all(sql, [user_id, operation === '+', value], (err, rows)=> {
                    if (err) return console.error(err.message);
                    resolve(rows);
                    reject('error getting record');
                });
            })
        } else if(within === 'month') {
            //за последний месяц
            const sql = `SELECT * FROM records WHERE user_id = ? AND operation = ? AND value = COALESCE(?,value) AND date BETWEEN datetime('now', 'start of month') AND datetime('now', 'localtime') ORDER BY date`;
            return new Promise(function (resolve, reject) {
                db.all(sql, [user_id, operation === '+', value], (err, rows)=> {
                    if (err) return console.error(err.message);
                    resolve(rows);
                    reject('error getting record');
                });
            })
        } else if(within === 'year') {
            //за последний год
            const sql = `SELECT * FROM records WHERE user_id = ? AND operation = ? AND value = COALESCE(?,value) AND date BETWEEN datetime('now', 'start of year') AND datetime('now', 'localtime') ORDER BY date`;
            return new Promise(function (resolve, reject) {
                db.all(sql, [user_id, operation === '+', value], (err, rows)=> {
                    if (err) return console.error(err.message);
                    resolve(rows);
                    reject('error getting record');
                });
            })
        } else {
            //за все время
            const sql = `SELECT * FROM records WHERE user_id = ? AND operation = ? AND value = COALESCE(?,value) ORDER BY date`;
            return new Promise(function (resolve, reject) {
                db.all(sql, [user_id, operation === '+', value], (err, rows)=> {
                    if (err) return console.error(err.message);
                    resolve(rows);
                    reject('error getting record');
                });
            })
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
}

module.exports = { add_record, get_records, get_records_filter }




// const sql = `DELETE FROM records`;
// db.run(sql, (err)=>{
//     if (err) return console.error(err.message);
//     console.log('deleted correct');
// });











