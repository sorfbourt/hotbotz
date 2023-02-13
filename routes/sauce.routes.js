const express = require('express');
const router = express.Router();
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard');
const Sauce = require('../models/Sauce.model');

/* GET HOME PAE */
router.get("/home", isLoggedIn, async (req, res) => {
    try {
        const topSauces = await Sauce.aggregate([ { $sample: { size: 10 } } ]).limit(10)
        const mostRecentSauce = await Sauce.find().sort( { "createdAt": -1 } ).limit(3)
        //console.log("mostRecentSauce: ", mostRecentSauce)
        res.render("sauces/home", {user:req.session.user, topSauces, mostRecentSauce})
    } catch (error) {
        console.log("Home page could not display")
    }
  });
  
  
  /* GET ADD SAUCE */
  router.get("/add", isLoggedIn, (req, res) => {
    res.render("sauces/add", {user:req.session.user})
  });

  router.post("/add", isLoggedIn, async (req, res) => {

    try {
      const addedSauce = req.body.name

      //validation blank name entered
      if(addedSauce ==""){
        res.render('sauces/add', {
          errorMessage: "Please enter a sauce", 
          user:req.session.user
        })
      }

      const sauceMatch = await Sauce.find({name:addedSauce})
      //check to see if exists already
      if(sauceMatch.length == 0){
        //proceeds to add
        res.render('sauces/add-details', {
          addedSauce,
          user:req.session.user
        })
      }
      else{
        //if already exists, show result and error
        errorCode = 0
        //console.log("sauceMatch: ", sauceMatch, "errorCode: ", errorCode)
        res.render('sauces/add', {
          errorMessage: "The sauce you entered already exists in our database. Try another sauce!", 
          errorCode, 
          sauceMatch,
          user:req.session.user
        })
      }

    } catch (error) {
      console.log(error)
    }
  });
    


  /*ADD MORE DETAILS TO HOT SAUCE ENTRY*/
  router.get("/add-details", isLoggedIn, (req, res) => {
    res.render("sauces/add-details", {user:req.session.user})
});

router.post("/add-details", isLoggedIn, async (req, res) => {
  try {


      req.body.addedBy = req.session.user._id
    
      const newSauce = req.body
      const addedSauce = await Sauce.create(newSauce)
      const selectedSauce = addedSauce
      console.log(selectedSauce)
      const randomSauces = await Sauce.aggregate([ { $sample: { size: 5 } } ]).limit(5)
      res.render("sauces/details", {user:req.session.user, selectedSauce, randomSauces})



  } catch (error) {

  
    console.log(error)
  }
});

    
    
    /* GET DEAILTED SAUCE PAGE SAUCE */
    router.get("/:id", isLoggedIn, async (req, res) => {
      try {
        //get specific sauce details
        const sauceId = req.params.id
        const selectedSauce = await Sauce.findById(sauceId).populate("addedBy")
        //get 5 random sauces
        const randomSauces = await Sauce.aggregate([ { $sample: { size: 5 } } ]).limit(5)

        res.render("sauces/details", {user:req.session.user, selectedSauce, randomSauces})
      } catch (error) {
        console.log("Sauce details page failed to render", error)
      }
    });
  
module.exports = router;