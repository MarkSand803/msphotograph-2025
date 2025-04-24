const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Joi = require("joi");
const mongoose = require("mongoose");
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keeping original name for simplicity, professor might rename
    },
});

const upload = multer({ storage: storage });

mongoose
    .connect("mongodb+srv://MarkSand803:Willet172005@cluster0.9lv5qlv.mongodb.net/") // Using your professor's connection string
    .then(() => {
        console.log("connected to mongodb");
    })
    .catch((error) => {
        console.log("couldn't connect to mongodb", error);
    });

const photoSchema = new mongoose.Schema({ // Keeping your schema structure but renaming for clarity
    _id: String,
    title: String,
    location: String,
    name: String,
    date: Date,
    img_name: String, // Changed from File to String to store filename
    details: [String] // Assuming details is an array of strings
});

const Photo = mongoose.model("Photo", photoSchema); // Renamed model to Photo to match your schema

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/api/portfolio", async (req, res) => { // Changed endpoint to /api/portfolio to reflect your data
    try {
        const photos = await Photo.find();
        res.send(photos);
    } catch (error) {
        console.error("Error fetching photos:", error);
        res.status(500).send("Error fetching data from the database.");
    }
});

app.post("/api/portfolio", upload.single("img_name"), async (req, res) => { // Keep your image field name
    const result = validatePhoto(req.body);

    if (result.error) {
        console.log("I have an error");
        return res.status(400).send(result.error.details[0].message);
    }

    const newPhoto = new Photo({
        _id: req.body._id || String(new mongoose.Types.ObjectId()), // Generate ObjectId if not provided
        title: req.body.title,
        location: req.body.location,
        name: req.body.name,
        date: req.body.date,
        img_name: req.file ? req.file.originalname : '', // Keep original name for now
        details: req.body.details ? req.body.details.split(',').map(item => item.trim()) : [],
    });

    try {
        const savedPhoto = await newPhoto.save();
        res.status(200).send(savedPhoto);
    } catch (error) {
        console.error("Error saving photo:", error);
        res.status(500).send("Error saving data to the database.");
    }
});

app.put("/api/portfolio/:id", upload.single("img_name"), async (req, res) => {
    const result = validatePhoto(req.body);

    if (result.error) {
        return res.status(400).send(result.error.details[0].message);
    }

    const fieldsToUpdate = {
        title: req.body.title,
        location: req.body.location,
        name: req.body.name,
        date: req.body.date || "",
        details: req.body.details ? req.body.details.split(',').map(item => item.trim()) : [],
    };

    if (req.file) {
        fieldsToUpdate.img_name = req.file.originalname; // Keep original name
    }

    try {
        const updatedPhoto = await Photo.findByIdAndUpdate(req.params.id, fieldsToUpdate, { new: true });
        if (!updatedPhoto) {
            return res.status(404).send("The photo with the provided ID was not found.");
        }
        res.status(200).send(updatedPhoto);
    } catch (error) {
        console.error("Error updating photo:", error);
        res.status(500).send("Error updating data in the database.");
    }
});

app.delete("/api/portfolio/:id", async (req, res) => {
    try {
        const deletedPhoto = await Photo.findByIdAndDelete(req.params.id);
        if (!deletedPhoto) {
            return res.status(404).send("The photo with the provided ID was not found.");
        }
        res.status(200).send(deletedPhoto);
    } catch (error) {
        console.error("Error deleting photo:", error);
        res.status(500).send("Error deleting data from the database.");
    }
});

const validatePhoto = (photo) => {
    const schema = Joi.object({
        _id: Joi.string().allow(""), // Expecting string ID for MongoDB
        title: Joi.string().min(3).required(),
        location: Joi.string().required(),
        name: Joi.string().required(),
        date: Joi.string().allow(""),
        details: Joi.string().allow(""),
    });

    return schema.validate(photo);
};

app.listen(3001, () => { // Using your professor's port number
    console.log("I'm listening on port 3001");
});