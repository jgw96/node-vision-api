const gcloud = require('gcloud')({
  projectId: 'imagefun-1470553607621'
});
const vision = gcloud.vision();
const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json({ limit: '50mb' }));

app.use(cors());

app.use(express.static('public'));

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

app.post('/', (req, res) => {
  let responseObject = [];
  let imageBuffer = decodeBase64Image(req.body.data);

  fs.writeFile("test.jpg", imageBuffer.data, (err) => {
    if (err) {
      console.log(err);
    } else {
      vision.detectFaces("test.jpg", (err, faces) => {
        if (err) {
          console.error(err);
        } else {
          //res.send({ faces });
          responseObject.push({ faces })

          vision.detectLabels('test.jpg', { verbose: true }, (err, labels) => {
            if (err) {
              return callback(err);
            } else {
              responseObject.push({ labels });
              res.send(responseObject);
            }
          });
        }
      });
    };
  });

});

app.listen(8200, () => {
  console.log('Example app listening on port 8200!');
});