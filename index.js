const express = require('express');
const axios = require('axios');
const knights = require('knights-canvas');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 3000; // Choose any port you prefer

app.get('/generate', async (req, res) => {
  try {
    const { id, name, backgroundimage, needxp, currenexp, level } = req.query;

    // Fetch Facebook profile picture
    const facebookPicture = await axios.get(
      `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: 'arraybuffer' }
    );

    // Create Knights Canvas rank image
    const rankImage = await new knights.Rank()
      .setAvatar(`data:image/jpeg;base64,${Buffer.from(facebookPicture.data, 'binary').toString('base64')}`)
      .setUsername(name)
      .setBg(backgroundimage)
      .setNeedxp(needxp)
      .setCurrxp(currenexp)
      .setLevel(level)
      .setRank('https://i.ibb.co/Wn9cvnv/FABLED.png')
      .toAttachment();

    const imageData = rankImage.toBuffer();

    // Save both the rank image and profile picture to the same tmp folder
    const folderPath = './tmp/';
    const filePathRankImage = `${folderPath}${id}_srank.png`;
    const filePathProfilePicture = `${folderPath}${id}_profile.png`;

    await fs.writeFile(filePathRankImage, imageData);
    await fs.writeFile(filePathProfilePicture, facebookPicture.data);

    // Send the rank image as an attachment in the response
    res.sendFile(filePathRankImage, { root: __dirname }, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
