const express = require('express');
const router = express.Router();
const mysql = require('mysql');

let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12',
  port: 3306,
  database: 'parking'
});


router.get('/', function(req, res, next) {
  res.render('inCar', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  let carNumber = req.body.carNumber;
  let inTime = new Date();

  checkCar(carNumber).then(e =>{
    if(e == 1){
      console.log('입차된 차량입니다.');
      setTimeout(()=>{
        res.render('inCar');
      },3000)
    }else if(e == 0){
      insertCar(carNumber,inTime).then(e => {
        if(e == 1){
          console.log("차량이 등록되었습니다!");
          res.render('inCar');
        }else if(e == 0){
          console.log('유효하지 않은 차량번호입니다.');
          setTimeout(()=>{
            res.render('inCar');
          },3000)
        }
      }) 
    }
  });
})

function checkCar(carNumber){
  return new Promise((resolve, reject) => {
    let checkSql = 'select car_number from records where car_number = ?';
    let checkValue = [carNumber];
    connection.query(checkSql,checkValue,(err,rows) => {   
      if(rows.length == 1){
        console.log('Check Query: '+rows);
        resolve(1);
      }else if(rows.length == 0){
        resolve(0);
      }
    })
  })
}

function insertCar(carNumber,inTime){
  return new Promise((resolve,reject) => {
    RexCarNumber(carNumber).then(e=>{
      if(e == true){
        let insertSql = 'insert into records (car_number, intime) values (?,?)'
        let insertValue = [carNumber, inTime];
        connection.query(insertSql, insertValue,(err,rows) => {
          console.log('insert Query: '+rows);
          resolve(1);
        })
      }else if(e == false){
        resolve(0);
      }
    })
  })
}

function RexCarNumber(carNumber){
  const rex = /^[0-9]{2,3}[가-힣]{1}[0-9]{4}$|^[가-힣]{2,3}[0-9]{2}[가-힣]{1}[0-9]{4}$/;
  return new Promise((resolve,reject)=>{
    if(rex.test(carNumber)){
      resolve(true);
    }else{
      resolve(false);
    }
  })
}

module.exports = router;
