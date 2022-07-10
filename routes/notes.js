const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');


// Route 1: Fetch all notes using GET "/api/auth/fetchallnotes" requires login
router.get('/fetchnotes', fetchuser, async (req,res)=>{
    try {    
        const notes = await Notes.find({user:req.user.id});
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Internal Server Error"});
    }
});

// Route 2: Add a new note using POST "/api/auth/addnote" requires login
router.post('/addnote', fetchuser, [
    body('title','Enter a Valid Title').isLength({ min: 1 }),
    body('description','Description must be atleast 5 characters').isLength({ min: 1 }),
], async (req,res)=>{
    try {
        const {title,description,tag} = req.body;
        // If there are errors, return bad request and error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const note =new Notes({title, description, tag, user: req.user.id});
        const savedNote = await note.save();
        res.json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Internal Server Error"});
    }
});

// Route 3: Update an existing note using PUT "/api/auth/updatenote/:id" requires login
router.put('/updatenote/:id', fetchuser, async (req,res)=>{
    try {
        const {title,description,tag} = req.body;
        // Create new Note Object
        const newNote = {};
        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};
        // Find the note and update
        let note = await Notes.findById(req.params.id);
        if(!note){res.status(404).send("Not Found")};
        if(note.user.toString() !== req.user.id){
            res.status(401).send("Not Allowed")
        }
        note = await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true});
        res.json(note);

    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Internal Server Error"});
    }
});

// Route 4: Delete an existing note using DELETE "/api/auth/deletenote/:id" requires login
router.delete('/deletenote/:id', fetchuser, async (req,res)=>{
    try {
        // Find the note and update
        let note = await Notes.findById(req.params.id);
        if(!note){res.status(404).send("Not Found")};
        if(note.user.toString() !== req.user.id){
            res.status(401).send("Not Allowed")
        }
        note = await Notes.findByIdAndDelete(req.params.id);
        res.send("Note Deleted Successfully");
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Internal Server Error"});
    }
});

module.exports = router