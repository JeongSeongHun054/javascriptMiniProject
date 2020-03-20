var express = require('express');
var router = express.Router();
const mysql = require('mysql');

let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12',
  port: 3306,
  database: 'parking'
});


router.get('/', function(req, res, next) {
  res.render('checkprice');
});

router.post('/', (req,res) => {
  let carNumber = req.body.car_number;
  let type = req.body.type;

  isCheck(carNumber).then(e => {
    if(e == 1){
      outTimeUpdate(carNumber).then(e=>{
        if( e == 1){
          console.log('입차시간이 업데이트 되었습니다.');
          checkPrice(carNumber,type).then(e => {
            console.log(`주차가격은 ${e}원입니다.`);
            res.render('checkprice');
          })
        }
      })
    }else if(e == 0){
      console.log('입차되지 않은 차량입니다.');
      setTimeout(()=>{
        res.render('checkprice');
      },3000)
    }
  })


})

function isCheck(carNumber){
  return new Promise((resolve,reject) => {
    let checkSql = 'select car_number from records where car_number = ?';
    let checkValue = [carNumber];
    
    connection.query(checkSql,checkValue,(err,rows) => {
      if(rows.length >= 1){
        resolve(1)
      }else if(rows.length == 0){
        resolve(0);
      }
    })
  })
}

function outTimeUpdate(carNumber){
  let outTime = new Date();
  return new Promise((resolve,reject) => {
    let updateSql = 'update records set outtime = ? where car_number = ?';
    let updateValue = [outTime, carNumber]
    connection.query(updateSql,updateValue,(err,rows) => {
      if(err) console.error(new Error());
      resolve(1);
    })
  })
}

function checkPrice(carNumber,type){
  return new Promise((resolve,reject) => {
    let checkPriceSql = 'select intime, outtime from records where car_number = ?';
    connection.query(checkPriceSql,[carNumber],(err,rows) => {
      let inTime = rows[0].intime;
      let outTime = rows[0].outtime;
      let price = Math.ceil((outTime.getTime() - inTime.getTime())/1000/60);

      const rex = /^[학생]{2}$|^[교직원]{3}$|^[교수]{2}$|^[장애인]{3}$|^[정기권]{3}$/;
      if(rex.test(type) == true){
        resolve(0);
      }else{
        resolve(price);
      }
      
    })
  })
}

module.exports = router;
