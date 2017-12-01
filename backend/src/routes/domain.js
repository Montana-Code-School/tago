const express = require ('express');
const mongoose = require('mongoose');
const app = express();

const router = express.Router();

const Domain = require('../models/domain');

mongoose.connect("mongodb://Keesha:skool16@ds113826.mlab.com:13826/tago", {useMongoClient: true});

router.route('/domain')
  .get((req, res) => {
    Domain.find((err,domain) => {
      if(err)
        res.send(err);

      res.json(domain)
    })
  })

  router.route('/domain/:domain_id')
    .get((req,res) => {
      Domain.findById(req.params.domain_id, (err, domain) => {
        if(err)
        res.send(err);

        res.json(domain);
      })
    })

  router.route('/domain/date/:domain_dateCreated')
  .get((req,res) => {
    Domain.findOne({'dateCreated' : req.params.domain_dateCreated}, (err, domain) => {
      if(err)
      res.send(err);

      res.json(domain);
    })
  })

  module.exports = router;