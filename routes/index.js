
const express = require('express');
const router = express.Router();

//route
module.exports = (Photo) => {
  router.get('/', async (req, res) => {
    try {
      const photos = await Photo.find();
      res.render('index', { photos });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  return router;
};