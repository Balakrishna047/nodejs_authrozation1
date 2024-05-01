const express =require('express');
const dotEnv=require('dotenv');
const session=require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var MongoDBStore = require('connect-mongodb-session')(session);
const UserDetail = require('./models/UserDetail');
const bcrypt=require('bcryptjs');
const app=express();

dotEnv.config();
mongoose.connect(process.env.Mongo_Uri).then(()=>{
    console.log("Mongodb conncted successfully")
}).catch(error=>{
    console.log(error.message)
})
app.set('view engine', 'ejs');

app.use(express.static('public'))
app.use(express.urlencoded({ extended:true }));


let store = new MongoDBStore({
    uri: process.env.Mongo_Uri,
    collection: 'mySessions2',
});
app.use(session({
    secret:"secret",
    resave: false,
    saveUninitialized: false,
    store:store
})) 
const Port = process.env.PORT ||2000

const isAuth=(req,res,next)=>{
    if(req.session.isAuthenticated){
        next();
    }
    else {
        res.redirect('/signup')
    }
}

app.get('/signup', (req, res) => {
    res.render('register')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/dashboard', isAuth,(req, res) => {
    res.render('welcome')
})

app.post('/register', async(req, res) => {
    const {username,email,password}=req.body;
    let user=await UserDetail.findOne({email})
    let hashpassword= await bcrypt.hash(password,12);
    
    user= new UserDetail({
        username,
        email,
        password:hashpassword,
    })
    await user.save();
    req.session.person = user.username;
    res.redirect('/login');

})



// app.post('/user-login', async(req, res) => {
//     const { email, password } = req.body

//     const user = await UserDetail.findOne({ email })

//     if (!user) {
//         return res.redirect('/signup')
//     }

//     const checkPassword = await bcrypt.compare(password, user.password)

//     if (!checkPassword) {
//         return res.redirect('/signup')
//     }
//     req.session.isAuthicated = true
//     res.redirect('/dashboard')

// })


app.post('/user-login', async(req, res) => {
    const {email,password}=req.body;
const user= await UserDetail.findOne({email});
if(!user){
   return  res.redirect('/signup')
}
const cheackPassword= await bcrypt.compare(password,user.password);

if(!cheackPassword){
   return  res.redirect('/signup')
}
req.session.isAuthenticated =true;
res.redirect("/dashboard")
})

app.post("/logout",async(req, res)=>{
    req.session.destroy((error)=>{
        if(error) throw error;
        res.redirect("/login");
    });
})

app.listen(Port,()=>{
    console.log("Server is Started at port:",Port)
})