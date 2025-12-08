const express = require('express');
const router = express.Router();
const data = {};
data.employees = require('../../data/employees.json');

// Multiple http methods per route and parameter values
router.route('/')
    .get((req, res) =>{
        res.json(data.employees);
    })
    .post((req, res) => {
        res.json({
            "firstname": req.body.firstname,
            "lastname": req.body.lastname
        })
         })
        .put((req , res) =>{
            res.json({
            "firstname": req.body.firstname,
            "lastname": req.body.lastname
        })
        })
        .delete((req,res) =>{
            res.json({"id": req.body.id});
        });
    
// Named parameter routes
router.route('/:id')
    .get((req, res) =>{
        res.json({ "id" : req.params.id})
    });
    
module.exports = router;