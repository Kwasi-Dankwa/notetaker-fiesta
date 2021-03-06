//Dependencies
const express = require("express");
const path = require("path");
const fs = require("fs");


//Server
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
//Static middleware
app.use(express.static('public'));

//GET REQUEST to direct user to correct page depending on url
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/index.html"))
});
app.get("/notes", (req, res) => {
   res.sendFile(path.join(__dirname, "./public/notes.html"))
});

//sends json of all the notes if the user gains access to /api/notes
app.get("/api/notes", (req, res) => {
  fs.readFile(path.join(__dirname, "./db/db.json"), "utf8", (error,notes) => {
      if (error) {
          return console.log(error)
      }
      res.json(JSON.parse(notes))
  })
});

//use the POST method to return user input to the backend
app.post("/api/notes", (req, res) => {
    //create a variable for the saved user note
    const savedNote = req.body;
    //retrieve the notes from db.json, get id of last note, add 1 to it to create 
  fs.readFile(path.join(__dirname, "./db/db.json"), "utf8", (error, notes) => {
      if (error) {
          return console.log(error)
      }
      notes = JSON.parse(notes)
      //assign a unique id to each note created depending on last id.
      //if no items in notes array, assign id as 10
      if (notes.length > 0) {
      let lastId = notes[notes.length - 1].id
      var id =  parseInt(lastId) + 1
      } else {
        var id = 10;
      }
      //create a new note object
      let newNote = { 
        title: savedNote.title, 
        text: savedNote.text, 
        id: id 
        }

      //merge new note with existing notes array
      var newNotesArr = notes.concat(newNote)

      //write new array to db.json file and retuern it to user
      fs.writeFile(path.join(__dirname, "./db/db.json"), JSON.stringify(newNotesArr), (error, data) => {
        if (error) {
          return error
        }
        console.log(newNotesArr)
        res.json(newNotesArr);
      })
  });
 
});

//delete note using delete http method
app.delete("/api/notes/:id", (req, res) => {
  let deleteId = JSON.parse(req.params.id);
  console.log("ID to be deleted: " ,deleteId);
  fs.readFile(path.join(__dirname, "./db/db.json"), "utf8", (error, notes) => {
    if (error) {
        return console.log(error)
    }

   let notesArray = JSON.parse(notes);
   //loop through notes array and remove note with id matching deleteId
   for (var i=0; i < notesArray.length; i++){
     if(deleteId == notesArray[i].id) {
       notesArray.splice(i,1);

       fs.writeFile(path.join(__dirname, "./db/db.json"), JSON.stringify(notesArray), (error, data) => {
        if (error) {
          return error
        }
        console.log(notesArray)
        res.json(notesArray);
      })
     }
  }
  
}); 
});

//initialize the port to start listening
app.listen(PORT, () => console.log(`App is listening on PORT ${PORT}`));
