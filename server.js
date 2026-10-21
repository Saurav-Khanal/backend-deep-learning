const express = require("express");
const app = express();
const { randomUUID } = require("crypto");
const mongodbconnect = require("./db");
const Note = require("./note");
const note = require("./note");
app.use(express.json());

mongodbconnect
  .then(() => {
    console.log("Mongodb Connected");
    app.listen(3000, () => {
      console.log("server is running on port 3000");
    });
  })
  .catch((error) => {
    console.log("Error", error);
  });

app.get("/", (req, res) => {
  res.send("your note api is running");
});

const idassign = (req, res, next) => {
  req.id = randomUUID();
  next();
};

const validatefield = (req, res, next) => {
  const { name, subject } = req.body;
  const errors = [];
  if (typeof name !== "string") {
    errors.push("Name must be string!");
  } else if (name.trim().length === 0) {
    errors.push("Name cannot be empty!");
  }
  if (typeof subject !== "string") {
    errors.push("Subject must be string");
  } else if (subject.trim().length === 0) {
    errors.push("Subject cannot be empty!");
  }
  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }
  next();
};

app.post("/notes", validatefield, async (req, res) => {
  try {
    const createdNote = await Note.create({
      name: req.body.name,
      subject: req.body.subject,
    });
    res.status(201).json({
      message: "Note created succesfully",
      notes: createdNote,
    });
  } catch (err) {
    res.status(500).json({
      message: "failed to create note",
    });
  }
});

app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find();
    if (notes.length===0) {
      res.status(404).json({
        message: "note not found",
      });
    }
    res.status(200).json({
      message: "All notes",
      notes: notes,
    });
  } catch (err) {
    res.status(500).json({
      message: "failed to fetch note",
    });
  }
});

app.get("/notes/:id", async (req, res) => {
  try {
    const matchingnote = await Note.findById(req.params.id);
    if (!matchingnote) {
      return res.status(404).json({
        message: "Note not found",
      });
    }
    res.status(200).json({
      message: "note found",
      note: matchingnote,
    });
  } catch (err) {
    res.status(500).json({
      message: "failed to fetch note",
    });
  }
});

app.put("/notes/:id",async(req, res) => {
  try{
    const updatedNote=await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new:true}
    )
    if(!updatedNote){
      return res.status(404).json({
        message:"note not found"
      })
    }
    res.status(200).json({
      message:"Note updated successfully",
      note:updatedNote
    })
  }catch(err){
    res.status(500).json({
      message:"failed to update Note"
    })
  }
});

app.delete("/notes/:id", async (req, res) => {
  try{
    const deleteNote=await Note.findByIdAndDelete(
      req.params.id,
    )
    if(!deleteNote){
      return res.status(404).json({
        message:"note not found"
      })
    }
    res.status(200).json({
      message:"Note deleted successfully"
    })
  }catch(err){
    res.status(500).json({
      message:"failed to delete note"
    })
  }
});
