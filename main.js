require('dotenv').config();
const session= require("express-session");
const express = require("express");
const https = require("https");
const ejs = require("ejs");
const multer= require("multer");
const path= require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport=require("passport");
const app = express();
const passportLocalMongoose= require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;


const randomstring = require("random-string-gen");


const findOrCreate = require('mongoose-findorcreate');
const fs = require('fs');
const PDFDocument = require('pdfkit');


app.use(session({
  secret: "Dua-Al-Madinah",
  resave: false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

var upload = multer({
  storage:multer.diskStorage({
    destination:(req,file,cb)=>{
      cb(null,'./uploads');
    },
    filename:function(req,file,callback){
      callback(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  })

});


var profilephoto=" ";
var user_dp=" ";
var reviewname="";
var entryEmail="";


var selectedPackage;
let today = new Date();
var options = {
  weekday: "long",
  day: "numeric",
  month: "long"
};
let day = today.toLocaleDateString("en-US", options);


app.use(express.static(__dirname));
app.use(express.static("uploads"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb+srv://MusQaddu:DuaAlmadinah123@dua-almadinah.w4uzp.mongodb.net/MasterDB");



const userSchema= new mongoose.Schema({
  name:String,
  email:String,
  password:String,
  googleId:String

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User =new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,

    // callbackURL: "https://hidden-mesa-15600.herokuapp.com/auth/google/login",
    callbackURL: "http://localhost:4000/auth/google/login",
    userProfileUrl:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    profilephoto= profile.photos[0].value;
    reviewname=profile.displayName;
    entryEmail=profile.id;


  User.findOrCreate({ googleId: profile.id,username: profile.displayName }, function (err, user) {
    return cb(err, user);
  });
}
));


var selectedCity;
 var xcoordinate;
 var ycoordinate;
var pdfName;
var user_status;
var temperature;
var description;
var image_url;
var multipleUpload=upload.fields([{name:"cityImage",maxCount:1},{name:"tourImg1",maxCount:1},{name:"tourImg2",maxCount:1},{name:"tourImg3",maxCount:1}]);

const reviewSchema= new mongoose.Schema({
  review:String,
  dp:String,
  name:String
});
const UserReviews = mongoose.model("UserReview", reviewSchema);
const bookedDetailsSchema = new mongoose.Schema({
  entry_email:String,
  name:String,
  package:String,
  city:String,
  tokennumber:String,
  emailId:String,
  status:String,
  airlines:String,
  flightDepartureDate:String,
  flightDepartureTime:String,
  flightArrivalDate:String,
  flightArrivalTime:String,
  PNRnumber:Number,
  ticketnumber:Number,
  hotellocation:String,
  hotelname:String,
  Roomnumber:String,
  checkinDate:String,
  checkoutdate:String,
  origin:String,
});


const BookedDetails = mongoose.model("BookedDetails", bookedDetailsSchema);
const formSchema = new mongoose.Schema({
  entry_email:String,
  dp:String,
  city:String,
  package:String,
  booking_date:String,
  time:String,
  is_local: String,
  name:String,
  gender: String,
  email: String,
  nationality: String,
  isd_code:String,
  mobile_number:String,
  iqama_bataqa_number:String,
  passport_number:String,
  passport_issued_place:String,
  passport_issued_on:String,
  valid_till: String,
  adult_count: Number,
  children_count:Number,
  departure_city:String,
  arrival_date:String,
  departure_date:String,
  vcode: String,
  file:String,
  Status:String,
  tokenNumber:String,
});
const Form= mongoose.model("Form", formSchema);

const packageSchema = new mongoose.Schema({
  packageid:String,
  packageCity:String,
  packageName:String,
  packageDays:Number,
  packagePrice:Number,
  packageType:String,
  packageImg:String,
});
const Package = mongoose.model("package",packageSchema);


const cityDetailsSchema = new mongoose.Schema({
  cityName:String,
  cityImage:String,
  cityDescription:String,
  latestAnnouncments:Array,
  tourplace1:String,
  tourImage1:String,
  tourDescription1:String,
  tourplace2:String,
  tourImage2:String,
  tourDescription2:String,
  tourplace3:String,
  tourImage3:String,
  tourDescription3:String,

});
const CityDetails=mongoose.model("CityDetails",cityDetailsSchema);

var randomtoken;


app.post("/token" ,upload.single("ScannedCopies"),function(req, res){




   randomtoken=randomstring({length:10,type:"alphanumeric"});

     console.log(randomtoken);

  var date_ob = new Date();
  var hours = date_ob.getHours();
  var minutes = date_ob.getMinutes();
  var seconds = date_ob.getSeconds();

  let today = new Date().toISOString().slice(0, 10)
  let to= new Date();
  const weekday = ["Sunday -","Monday -","Tuesday -","Wednesday -","Thursday -","Friday -","Saturday -"];

  let day = weekday[to.getDay()];



 var date1= day + today;




  var time= hours + ":" + minutes + ":" + seconds;


  const new_form= new Form ({
    entry_email:entryEmail,
    is_local: req.body.flexRadioDefault,
    city:selectedCity,
    package:selectedPackage,
    booking_date:date1,
    time:time,
    dp:profilephoto,
    name:req.body.name,
    gender: req.body.gender,
    email: req.body.email,
    nationality: req.body.country,
    isd_code:req.body.isd_code,
    mobile_number:req.body.mobile_number,
    iqama_bataqa_number:req.body.iqama_number,
    passport_number:req.body.passport_number,
    passport_issued_place:req.body.passport_issued_place,
    passport_issued_on:req.body.passport_issued_on,
    valid_till: req.body.valid_till,
    adult_count: req.body.adult_count,
    children_count:req.body.children_count,
    departure_city:req.body.departureCity,
    arrival_date:req.body.arrival_date,
    departure_date:req.body.departure_date,
    vcode: req.body.vcode,
    file:req.file.filename,
    Status:"Under Processing",
    tokenNumber:randomtoken,
















  });
  new_form.save();
   const initial_data = new BookedDetails({
     name:req.body.name,
     tokennumber:randomtoken,
     emailId:req.body.email,
     status:"Under Processing",
     entry_email:entryEmail,
   });
  initial_data.save();

res.render("token",{tokenID:randomtoken,name:reviewname});


})




app.get("/", function(req, res) {
  res.sendFile(__dirname+"/login.html")
})
let port =process.env.PORT;
if(port== null ||  port == ""){
  port =4000;
}

app.listen(port, function() {

  console.log("hello quadri");
  console.log(port);
})


app.get("/city", function(req,res){
  const url1 = "https://api.openweathermap.org/data/2.5/weather?q="+ selectedCity +"&units=metric&appid=3d7f0e8cbe5fdb45d68fdd4206063952";
  https.get(url1, function(response) {
    response.on("data", function(data) {

      const weatherData = JSON.parse(data);
      xcoordinate=weatherData.coord.lat;
      ycoordinate=weatherData.coord.lon;
      temperature = weatherData.main.temp;
      description = weatherData.weather[0].description;
      var icon = weatherData.weather[0].icon;
      image_url = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
    })
  })
  // const url2="https://api.unsplash.com/search/photos?client_id=IUxEpj7N2YaJU70P_8JfsH6Pwg9hmNWbURHKoiu6dN0&query="+selectedCity;
  // console.log(url2);
  // https.get(url2,function(response){
  //
  //   response.on("data", function(data) {
  //
  //      const photoData=JSON.parse(data);
  //      console.log("plz run hoga gandu");
  //      console.log(photoData.results[0].urls.regular);
  //
  //   })
  // })



  CityDetails.find({cityName:selectedCity},function(err,cityDetail){
    Package.find({packageCity:selectedCity},function(err,packageDetails){
      res.render('city',{
        selectedCity:cityDetail,
        temperature:temperature,
        day:day,
        description: description,
        image_url:image_url,
        package:packageDetails,
        name:reviewname,
        x:xcoordinate,
        y:ycoordinate,
      })
    })
  })


})

app.get("/admin", function(req,res){
  res.render("adminLogin",{name:reviewname});
})


app.get("/request",function(req,res){


   Form.find({},function(err,form){
     res.render("request",{
       booking_details:form,
     })
   })


})
app.get("/createCity",function(req,res){
  res.render('createCity',{success:""})

})


app.get("/queryRequest",function(req,res){

  CityDetails.find({},function(err,cityDetails){
    res.render('queryRequest',{
      cityDetailsLists:cityDetails,
      booking_details:"",

    })
  })

})

app.post("/queryRequest",function(req,res){

  console.log(req.body.selectCity);
  console.log(req.body.status);
  console.log(req.body.start_date);
  console.log(req.body.end_date);

  // here i have to write code for selected time duration
  Form.find({city:req.body.selectCity, status:req.body.status}, function(err,form){
    CityDetails.find({},function(err,cityDetails){
      res.render('queryRequest',{
        cityDetailsLists:cityDetails,
        booking_details:form

      })
    })
  })
})


// app.get("/underProcessing",function(req,res){
//   res.render('underProcessing')
//
// })
// app.get("/onHoldCustomer",function(req,res){
//   res.render('onHoldCustomer')
//
// })
//
// app.get("/onHoldTourist",function(req,res){
//   res.render('onHoldTourist')
//
// })
//
// app.get("/cancelledRequests",function(req,res){
//   res.render('cancelledRequests')
//
// })
app.get("/report1",function(req,res){
  res.render('report1')

})
app.get("/report2",function(req,res){
  res.render('report2')

})
app.get("/report3",function(req,res){
  res.render('report3')

})
app.get("/report4",function(req,res){
  res.render('report4')

})
app.get("/report5",function(req,res){
  res.render('report5')

})










































































app.get("/createPackage",function(req,res){
  CityDetails.find({},function(err,cityDetails){
    res.render('create_package',{
      cityDetailsLists:cityDetails,
      success:""
    })
  })

})
app.get("/auth/google",
  passport.authenticate("google",{scope:['profile']})
);

app.post("/bookedForYouDetails",function(req,res){
  if(req.body.status=="Tour Cancelled"){
    BookedDetails.deleteOne({tokennumber:req.body.token},function(err){
      if(err){
        console.log(err);
      }
    })
    Form.deleteOne({tokenNumber:req.body.token},function(err){
      if(err){
        console.log(err);
      }
    })
    res.redirect("/request");

  }
  else{
    user_status=req.body.status;
    user_email=req.body.emailid;
    BookedDetails.updateOne({emailId:req.body.emailid},{$set:{
      status:req.body.status,
      city:req.body.city,
      package:req.body.package,
      airlines:req.body.flightName,
      origin:req.body.Origin,
      flightDepartureDate:req.body.flightDepartureDate,
      flightDepartureTime:req.body.flightDepartureTime,
      flightArrivalDate:req.body.flightArrivalDate,
      flightArrivalTime:req.body.flightArrivalTime,
      PNRnumber:req.body.pnr,
      ticketnumber:req.body.ticketNumber,
      hotellocation:req.body.allotedHotelLocation,
      hotelname:req.body.allotedHotelName,
      Roomnumber:req.body.roomNumber,
      checkinDate:req.body.checkInDate,
      checkoutdate:req.body.checkOutDate,}}).then(result => {
      const { matchedCount, modifiedCount } = result;

    })
    .catch(err => console.error(`Failed to add review: ${err}`));





    Form.updateOne({email:req.body.emailid},{$set:{
      Status:req.body.status,}}).then(result => {
      const { matchedCount, modifiedCount } = result;

    })
    .catch(err => console.error(`Failed to add review: ${err}`));

  res.redirect("/request");

  }

})

app.get("/Bookings",function(req,res){

  Form.find({entry_email:entryEmail},function(err,founduser){
    res.render("mybookings",{
      usersList:founduser,
      name:reviewname,
    })


  })




 // res.sendFile(__dirname+"/tokenverify.html");
})
app.get('/auth/google/login',
  passport.authenticate('google', { failureRedirect: '/login' }),function(req,res){
    res.redirect("/entry");
  }

)
app.get("/entry",function(req, res) {

  CityDetails.find({},function(err,cityDetails){
    UserReviews.find({},function(error,rev){


      res.render('index',{
        cityDetailsLists:cityDetails,
        dp:profilephoto,
        name:reviewname,

        testimonials:rev
      });
    });

  });


})
app.get("/details",function(req,res){
  res.render("bookingForm",{
    name:reviewname
  });
})
app.get("/deleteCity",function(req,res){
  CityDetails.find({},function(err,cityDetails){
    res.render('deleteCity',{
      cityDetailsLists:cityDetails,
      success:""})
  })
})
app.get("/deletePackage",function(req,res){
  Package.find({},function(err,packageDetails){
    res.render("deletePackage",{packageDetails:packageDetails,success:""})
  })
})
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});
app.get("/contactUs",function(req,res){
  res.render("contactUs" ,{
    name:reviewname,
  })
  // res.sendFile(__dirname+"/contactUs.html");
})
app.get("/aboutus",function(req,res){
  res.render("AboutUs",{
    name:reviewname,
  });
})
app.post("/common", function(req,res){
 selectedCity=req.body.city_name;

 res.redirect("/city");
})
app.post("/createPackage",upload.single("packageImg"), function(req,res){
var pacincrement=randomstring({length:12,type:"alphanumeric"});
  const package = new Package({
    packageCity:req.body.selectCity,
    packageName:req.body.packageName,
    packageDays:req.body.packageDays,
    packagePrice:req.body.packagePrice,
    packageType:req.body.packageType,
    packageImg:req.file.filename,
    packageid:pacincrement,
  });
  package.save(function(err,result){
    if(err){
      console.log(err);
    }
  else{
    CityDetails.find({},function(err,cityDetails){
      res.render('create_package',{
        cityDetailsLists:cityDetails,
        success:"Successfully Created Package"
      })
    })
  }
  });

})
app.post("/deleteCity",function(req,res){
  CityDetails.deleteOne({cityName:req.body.todeleteCity},function(err){
    if(err){
      console.log(err);
    }
  })
  res.redirect("/popupDeleteCity");

})
app.get("/popupDeleteCity",function(req,res){
  CityDetails.find({},function(err,cityDetails){
    res.render('deleteCity',{
      cityDetailsLists:cityDetails,
      success:"City Deleted Successfully"})
  })

})
app.post("/handleuser",function(req,res){
  Form.find({email:req.body.email},function(err,form){
    BookedDetails.find({emailId:req.body.email},function(err,bookedDetail){
      res.render("handleuser",{
        booking_details:form,
        BookedDetail:bookedDetail,
      })
    })

  })
})
app.post("/createCity",multipleUpload,function(req, res){
   var str =req.body.latest_announcments ;
  var arr = str.split("#");
 const singleCity = new CityDetails({
   cityName:req.body.city_name,
   cityImage:req.files.cityImage[0].filename,
   cityDescription:req.body.city_description,
   latestAnnouncments:arr,
   tourplace1:req.body.tour_name1,
   tourImage1:req.files.tourImg1[0].filename,
   tourDescription1:req.body.tour1description,
   tourplace2:req.body.tour_name2,
   tourImage2:req.files.tourImg2[0].filename,
   tourDescription2:req.body.tour2description,
   tourplace3:req.body.tour_name3,
   tourImage3:req.files.tourImg3[0].filename,
   tourDescription3:req.body.tour3description,
   })
   singleCity.save();
  res.render('createCity',{success:"Sccessfully created City"})
})

app.get("/popupDeletePackage",function(req,res){
  Package.find({},function(err,packageDetails){
    res.render("deletePackage",{packageDetails:packageDetails,success:"Package Deleted Successfully"})
  })

})


app.post("/adminlogin",function(req,res){
  if((req.body.adminUsername==process.env.USER_NAME)&&(req.body.adminPassword==process.env.PASS_WORD)){
    CityDetails.find({},function(err,cityDetails){
      res.render('queryRequest',{
        cityDetailsLists:cityDetails,
        booking_details:"",

      })
    })
  }
  else{
    console.log("unauthentication access");
  }
});
app.post("/delete-package",function(req,res){
  Package.deleteOne({packageid:req.body.todeletePackageID},function(err){
    if(err){
      console.log(err);
    }
  })
  res.redirect("/popupDeletePackage");

})


app.post("/register",function(req,res){
  reviewname=req.body.name;
  entryEmail=req.body.username;
  console.log("assalamualikum");
  User.register({username:req.body.username,name:req.body.name},req.body.password, function(err,user){

    if(err){
      console.log("haggu");
      console.log(err);
    }
    else{
      console.log("walekumsalam");
      passport.authenticate("local")(req,res ,function(){
        CityDetails.find({},function(err,cityDetails){
          UserReviews.find({},function(error,rev){
            res.render('index',{
              cityDetailsLists:cityDetails,
              testimonials:rev,
              name:reviewname,
            });
          });

        });
    })}
  })



});
app.post("/login",function(req,res){
  entryEmail=req.body.username;
  const user = new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user,function(err){

    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req,res ,function(){
        CityDetails.find({},function(err,cityDetails){
          UserReviews.find({},function(error,rev){
            User.findOne({username:req.body.username},function(error,singleuser){
              reviewname=singleuser.name;
              res.render('index',{
                cityDetailsLists:cityDetails,
                testimonials:rev,
                name:reviewname,
              });
            })
          });

        });
    })}
  })

});
app.post("/selected-package",function(req,res){
  selectedPackage=req.body.SelectedPackage;
  res.redirect("/details");
})












app.post("/seeStatus", function(req,res){
  console.log(req.body.giventoken);
  BookedDetails.find({tokennumber:req.body.giventoken},function(err1,BookedDetail){

    if(BookedDetail.length==0){
      res.sendFile(__dirname +"/wrongtoken.html")
    }
   else{
     user_status = BookedDetail[0].status;
     if(BookedDetail[0].package){
       Package.find({packageName:BookedDetail[0].package},function(err2,package){

         const doc =  new PDFDocument({ margin: 10 });
         doc.image('images/Group 44.png', { align: 'center', valign: 'center', width: 600, height:750});



       doc.text(` ${BookedDetail[0].name}`, 80, 80)
       .text(` ${BookedDetail[0].status}`, 80, 108)
       .text(` ${BookedDetail[0].emailId}`, 80, 133)
       .text(` ${BookedDetail[0].tokennumber}`, 420, 84)
       .text("16 April 2022", 460,108)
       .text("26 April 2022", 440,133)
       .text(` ${BookedDetail[0].city}`, 22, 238)
       .text(` ${package[0].packageName}`, 100, 238)
       .text(` ${package[0].packageType}`, 280, 238)
       .text(` ${package[0].packageDays}`, 380, 238)
       .text(` ${package[0].packagePrice} SAR`, 470, 238)
       // .fontSize(18)
       .text(` ${BookedDetail[0].airlines}`, 25, 360)
       .text(` ${BookedDetail[0].ticketnumber}`, 130, 360)
       .text(` ${BookedDetail[0].flightDepartureDate}`, 220, 355)
       .text(` ${BookedDetail[0].flightDepartureTime}`, 220, 372)
       .text(` ${BookedDetail[0].origin}`, 325, 360)
       .text(` ${BookedDetail[0].flightArrivalDate}`, 420, 355)
       .text(` ${BookedDetail[0].flightArrivalTime}`, 420, 372)
       .text(` ${BookedDetail[0].city}`, 530, 360)
       .text(` ${BookedDetail[0].hotelname}`, 22, 490)
       .text(` ${BookedDetail[0].Roomnumber}`, 150, 490)
       .text(` ${BookedDetail[0].checkinDate}`, 225, 490)
       .text(` ${BookedDetail[0].checkoutdate}`, 325, 490)
       .text(` ${BookedDetail[0].hotellocation}`, 430, 480)
       .fontSize(10)
       // .text(` ${BookedDetail[0].ticketnumber}`, 80, 450)
       // .text(` ${BookedDetail[0].ticketnumber}`, 80, 450)
       // .text(` ${BookedDetail[0].ticketnumber}`, 80, 450)
        doc.end();
         pdfName="uploads/"+BookedDetail[0].name+".pdf";


        doc.pipe(fs.createWriteStream("uploads/"+BookedDetail[0].name +".pdf"));

         })
     }

       Form.find({tokenNumber:req.body.giventoken},function(req,singlerowdetails){
         res.render("individualBookingDetails",{
            Details:BookedDetail,
           Status:user_status,
           name:reviewname,
           booking_details:singlerowdetails,

         })
       })
   }
    })






})
app.post("/downloadReceipt",function(req,res){
  console.log("hello");
  var x=__dirname+"/"+pdfName;

  res.download(x);
  // res.sendFile(__dirname + "/writeReview.html");
  // setTimeout(function(){},1000);



})
app.post("/download",function(req,res){
  Form.find({file:req.body.download},function(err,form){
    var x=__dirname+"/uploads/"+form[0].file;
    res.download(x);

    })
  })

app.post("/takeReview",function(req,res){
  finalreview= new UserReviews({
    review:req.body.userReview,
    dp:profilephoto,
    name:reviewname
  })
  finalreview.save();
  res.redirect("/entry")
})
