const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Joi = require("joi");
const app = express();
// Removed: const path = require("path");

app.use(express.static("public"));
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/"); // Changed path style
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html"); // Changed path style
});

let portfolio = [
  { "_id": 1, "title": "Wedding", "location": "Charleston, SC", "name": "John & Emily Johnson", "date": "2024-06-15", "img_name": "images/p4wedding.jpg", "details": ["Beach wedding", "Golden hour photography", "Candid shots"] },
  { "_id": 2, "title": "Graduation", "location": "Columbia, SC", "name": "Gabe Clark", "date": "2024-06-02", "img_name": "images/p4graduation.jpg", "details": ["Cap & Gown", "Campus shoot", "Family portraits"] },
  { "_id": 3, "title": "Family Session", "location": "Greenville, SC", "name": "The Thompson Family", "date": "2024-07-21", "img_name": "images/p4family.jpg", "details": ["Indoor shoot", "Candid moments", "Golden hour shots"] },
  { "_id": 4, "title": "Engagement", "location": "Myrtle Beach, SC", "name": "Michael & Lisa", "date": "2024-08-03", "img_name": "images/p4engagement.jpg", "details": ["Nature", "Romantic poses", "Ring close-ups"] },
  { "_id": 5, "title": "Birthday", "location": "Charlotte, NC", "name": "Tami’s 38th Birthday", "date": "2024-09-12", "img_name": "images/p4birthday.jpg", "details": ["Party decorations", "Cake cutting", "Candid guest shots"] },
  { "_id": 6, "title": "Corporate Event", "location": "Atlanta, GA", "name": "Tech Conference 2024", "date": "2024-10-05", "img_name": "images/p4corporate.jpg", "details": ["Panel discussions", "Networking moments", "Product showcases"] },
  { "_id": 7, "title": "Skyline", "location": "Chester, SC", "name": "Skyline 2024", "date": "2024-11-15", "img_name": "images/p4sky.jpg", "details": ["Skyline", "Country", "Landscape shot"] },
  { "_id": 8, "title": "Prom", "location": "York, SC", "name": "Markael Prom Photos", "date": "2022-04-04", "img_name": "images/p4prom.JPG", "details": ["Prom event", "Family ", "Candid shots"] },
  { "_id": 9, "title": "Furman University", "location": "Greenville, SC", "name": "Furman University", "date": "2023-07-05", "img_name": "images/p4furman.jpg", "details": ["Skyline", "Landscape", "University showcases"] }
];

app.get("/api/portfolio", (req, res) => {
  res.send(portfolio);
});

app.post("/api/portfolio", upload.single("img_name"), (req, res) => {
  const result = validatePhoto(req.body);

  if (result.error) {
    console.log("I have an error"); // Changed console log style
    res.status(400).send(result.error.details[0].message);
    return; // Added return for consistency
  }

  const newPhoto = {
    _id: portfolio.length, // Professor's code uses houses.length before incrementing
    title: req.body.title,
    location: req.body.location,
    name: req.body.name,
    date: req.body.date,
    img_name: req.file ? req.file.originalname : '', // Removed 'images/' prefix here
    details: req.body.details ? req.body.details.split(',').map(item => item.trim()) : [],
  };

  portfolio.push(newPhoto);
  res.status(200).send(newPhoto);
});

app.put("/api/portfolio/:id", upload.single("img_name"), (req, res) => {
  const photo = portfolio.find((p) => p._id === parseInt(req.params.id)); // Using 'p' as variable

  if (!photo) {
    res.status(404).send("The photo with the provided id was not found");
    return;
  }

  const result = validatePhoto(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  photo.title = req.body.title;
  photo.location = req.body.location;
  photo.name = req.body.name;
  photo.date = req.body.date || "";
  photo.details = req.body.details ? req.body.details.split(',').map(item => item.trim()) : [];
  if (req.file) {
    photo.img_name = req.file.originalname; // Removed 'images/' prefix here
  }

  // Added the extra res.status(200).send(photo) line (typo in professor's PUT)
  res.status(200).send(photo);
});

app.delete("/api/portfolio/:id", (req, res) => {
  console.log("I'm trying to delete" + req.params.id);
  const photo = portfolio.find((p) => p._id === parseInt(req.params.id)); // Using 'p' as variable

  if (!photo) {
    console.log("Oh no i wasn't found");
    res.status(404).send("The photo with the provided id was not found");
    return;
  }

  console.log("YAY You found me");
  console.log("The photo you are deleting is " + photo.title);
  const index = portfolio.indexOf(photo);
  portfolio.splice(index, 1);
  res.status(200).send(photo);
});

const validatePhoto = (photo) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    title: Joi.string().min(3).required(),
    location: Joi.string().required(),
    name: Joi.string().required(),
    date: Joi.string().allow(""),
    details: Joi.string().allow(""),
  });

  return schema.validate(photo);
};

app.listen(3001, () => {
  console.log("I'm listening"); // Changed console log style
});