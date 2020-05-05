const express = require('express');
var bodyParser = require('body-parser');
const bcrypt=require('bcrypt-nodejs');
const cors = require('cors');
const app = express();
var knex = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '1077',
      database : 'smart_brain'
    }
  });

// knex.select('*').from('users').then(data=>{
//     console.log(data);
// });

app.use(bodyParser.json());
app.use(cors())

app.get('/',(req,res)=>{
    res.send(database.users);
})

app.post('/signin',(req,res)=>{
    knex.select('email','hash').from('login')
    .where('email','=',req.body.email)
    .then(data=>{
       const isValid= bcrypt.compareSync(req.body.password, data[0].hash);
       //console.log(isValid)
       if(isValid){
        return knex.select('*').from('users')
        .where('email','=',req.body.email)
        .then(user=>{
           // console.log(user)
            res.json(user[0])
        })
        .catch(err=>res.status(400).json('unable to get user'))
       }
       else{
           res.status(400).json('wrong credentials')
       }

    })
    .catch(err=>res.status(400).json('unable to get user'))
})

app.post('/register',(req,res)=>{
    const {email, name ,password}=req.body;
    const hash = bcrypt.hashSync(password);
    knex.transaction(trx =>{
        trx.insert({
            hash:hash,
            email:email
        })
        .into('login')
        .returning('email')
        .then(loginEmail =>{
            return trx('users').returning('*').insert({
                email:loginEmail[0],
                name:name,
                joined: new Date()
            }).then(user=>{
                res.json(user[0])
        })
    })

    .then(trx.commit)
    .catch(trx.rollback)
    }).catch(err=>res.status(400).json('unable to register'))
})

app.get('/profile/:id',(req,res)=>{
    const { id }=req.params ;
    knex.select('*').from('users').where({
        id:id
    }).then(user=>{
        if (user.length) {
            res.json(user[0])
          } else {
            res.status(400).json('Not found')
          }

    })    .catch(err => res.status(400).json('error getting user'))



})

app.put('/image',(req,res)=>{
    const { id }=req.body ;
    let found=false;
    knex('users')
    .where('id', '=', id)
    .increment('entries',1)
    .returning('entries')
    .then(entries=>{
        res.json(entries)
    })
    .catch(err=>res.status(400).json('unable to get count'))

})



// Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });
app.listen(3000,()=>{
    console.log('app is running at port 3000');
})