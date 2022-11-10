const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const { on } = require("events");
const readline = require("readline");

app.get("/parts", (req, res) => {
  let parts = [];
  const page = req.query.page || 1;
  const limit = req.query.limit || 5;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  //use linereader to read LE.txt line to line
  const lineReader = readline.createInterface({
    input: fs.createReadStream("LE.txt"),
    crlfDelay: Infinity,
  });

  lineReader
    .on("line", (line) => {
      let part = line.split("\t");

      for (let i = 0; i < part.length; i++) {
        //remove leading and trailing double-quotes
        part[i] = part[i].replace(/^"(.*)"$/, "$1");
      }
      parts.push({
        partNumber: part[0],
        name: part[1],
        price: parseFloat(part[8]),
      });
    })
    .on("close", function () {
      const sortBy = req.query.sort;
      if (sortBy) {
        function sortPrice(a, b) {
          return a[sortBy] < b[sortBy] ? 1 : -1;
        }
      }
      parts = parts.sort(sortPrice);
      const resultParts = parts.slice(startIndex, endIndex);
      res.send(resultParts);
    });
});

app.listen(port, () => {
  console.log(`app running at http://localhost:${port}`);
});
