const express = require('express');
const axios = require('axios');
const knights = require('knights-canvas');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 3000; // Choose any port you prefer

app.get('/rank', async (req, res) => {
  try {
    const { id, name, backgroundimage, needxp, currenexp, level } = req.query;

    // Fetch Facebook profile picture
    const facebookPicture = await axios.get(
      `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: 'arraybuffer' }
    );

    // Fetch background image
    const backgroundImage = await axios.get(backgroundimage, { responseType: 'arraybuffer' });

    // Create Knights Canvas rank image
    const rankImage = await new knights.Rank()
      .setAvatar(`data:image/jpeg;base64,${Buffer.from(facebookPicture.data, 'binary').toString('base64')}`)
      .setUsername(name)
      .setBg(`data:image/jpeg;base64,${Buffer.from(backgroundImage.data, 'binary').toString('base64')}`)
      .setNeedxp(needxp)
      .setCurrxp(currenexp)
      .setLevel(level)
      .setRank('https://i.postimg.cc/SKFwkJqK/images-2024-02-28-T103459-576-removebg-preview.png')
      .toAttachment();

    const imageData = rankImage.toBuffer();

    // Save both the rank image, profile picture, and background image to the same tmp folder
    const folderPath = './tmp/';
    const filePathRankImage = `${folderPath}${id}_srank.png`;
    const filePathProfilePicture = `${folderPath}${id}_profile.png`;
    const filePathBackgroundImage = `${folderPath}${id}_background.png`;

    await fs.writeFile(filePathRankImage, imageData);
    await fs.writeFile(filePathProfilePicture, facebookPicture.data);
    await fs.writeFile(filePathBackgroundImage, backgroundImage.data);

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
