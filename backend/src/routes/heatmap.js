const express = require ('express');
const mongoose = require('mongoose');
const app = express();

const router = express.Router();

const Heatmap = require('../models/heatmap');

mongoose.connect("mongodb://Keesha:skool16@ds113826.mlab.com:13826/tago", {useMongoClient: true});

router.route('/heatmap')
  .get((req, res) => {
    Heatmap.find((err,heatmap) => {
      if(err)
        res.send(err);

      res.json(heatmap)
    });
  });

  router.route('/heatmap/:heatmap_id')
    .get((req,res) => {
      Heatmap.findById(req.params.heatmap_id, (err, heatmap) => {
        if(err)
        res.send(err);

        res.json(heatmap);
      })
    })

  router.route('/heatmap/date/:heatmap_dateCreated')
  .get((req,res) => {
    Heatmap.findOne({'dateCreated' : req.params.heatmap_dateCreated}, (err, heatmap) => {
      if(err)
      res.send(err);

      res.json(heatmpa);
    })
  })
  module.exports = router;