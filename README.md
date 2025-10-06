# project1
igme403 project1



 What dataset are you using?

I am using the Pokémon dataset (pokedex.json) that was provided for IGME-430. 
It contains all the data about Pokémon such as name, type, etc.
The dataset is  inside the data folder and loaded into memory at server startup.
I also created two small helper JSON files (types.json and weaknesses.json) 
to keep the code simpler and more organized.


What work has been completed for this milestone?

server created.
Loads all data from JSON files.
Implemented the endpoints:
       - /api/pokemon
       - /api/pokemon/:id
       - /api/types
       - /api/weaknesses
       - /api/pokemon (add new Pokémon)
     not fully done-  //- /api/pokemon/:id (edit Pokémon fields)
Added index.html and styles.css to view, search, and add Pokémon.
Configured ESLint (Airbnb-base) and npm scripts ("start", "lint").

What work is left, and how do you plan to complete it?

 Add styling and polish for the client interface.
Improve validation messages for POST requests.
 Prepare for Heroku deployment by ensuring the PORT environment variable works.
Write final project documentation 


Do you have a plan for going above and beyond? If so, what is it?

Possibly adding one of the following for the final version:
   • Add a small filter dropdown that dynamically loads all weaknesses.
   • Style enhancements using a CSS framework (like Bootstrap). 
   

If you used any borrowed code or code fragments, where did you get them from?
some old pokemon index html was used (but that code was mine from a few years ago)
All code was written using the Node.js built-in modules (http, fs, path, url, querystring).
did use https://pokeapi.co/docs/v2 for alot of refrences and whenever I got stuck in server.js


 Server runs locally at http://localhost:3000



