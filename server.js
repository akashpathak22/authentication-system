import connectDB from "./src/configuration/connectDB.js";
import app from "./src/index.js";


connectDB();
app.listen(5000, ()=>{

  console.log("server is running on port no : 5000" );
    
});