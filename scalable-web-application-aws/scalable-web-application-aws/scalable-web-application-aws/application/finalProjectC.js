// guessANumber1-1.js - a simple API running on Node.js and using Express
var express = require('express'); // Use the express module

var randomNumber = []; // Store random numbers for each game ID
const maxGuess = 5; // Maximum number of guesses
var guessNum = []; // Track guess counts for each game ID

var app = express(); // Create a new express server object
app.use(express.urlencoded({ extended: false })); // Allow parsing of URL-encoded data
app.use(express.json()); // Allow parsing of JSON


// app.use() configures the middleware server object. It is called each time a request is sent to the server.
// It contains code for general configuration of the server. 
// In this case we're setting up CORS (cross-origin resource sharing). This just means content on a web page
// can come from a domain other than the domain of that page.
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

// app.get() instructs the application what to do when an HTTP GET request is made to the API.
// In this case, the code only runs if you use the route /sayhello (i.e., http://127.0.0.1/sayhello).
// And the code just increments the counter, sends a line of output to the console, and sends a line of 
// output to the browser.
app.post('/startGame', function (req, res) {
    var gameId = req.body.gameId;
    var randomNumberGenerated = Math.floor(Math.random() * 100) + 1;

    randomNumber[req.body.gameId] = randomNumberGenerated; // Store the random number using req.body.gameId
    guessNum[req.body.gameId] = 0; // Initialize guess count using req.body.gameId

    console.log(`Creating game number ${req.body.gameId}. The number to guess is ${randomNumberGenerated}.`);

    var responseMessage = {
        APIMessage: `Game number ${req.body.gameId} has started. You have ${maxGuess} guesses.`,
    };
    res.json(responseMessage);
});

// GET route to handle guesses
app.get('/guessMade', function (req, res) {
  var gameId = req.query.gameId;
  var numberToGuess = randomNumber[req.query.gameId]; // Retrieve the number to guess using gameId
  var numberGuessed = parseInt(req.query.guessMade); // Get the guessed number
  var guessed = false;
  var outMessage = "";

  // Validate game ID
  if (!numberToGuess) {
      responseMessage = {
          APIMessage: `Invalid game ID: ${req.query.gameId}. Please start a new game.`,
          gameOver: true // Signal to disable buttons and reset
      };
      return res.json(responseMessage);
  }

  // Validate the guess is between 1 and 100
  if (isNaN(numberGuessed) || numberGuessed < 1 || numberGuessed > 100) {
      responseMessage = {
          APIMessage: "Please enter a valid number between 1 and 100.",
          gameOver: false // Do not disable the buttons
      };
      return res.json(responseMessage);
  }

  // Increment guess count
  guessNum[req.query.gameId]++;

  // Check if the guess is correct
  if (numberGuessed === numberToGuess) {
      guessed = true;
      outMessage = `Congratulations! The guess of ${numberGuessed} is correct! You guessed it in ${guessNum[req.query.gameId]} guesses.`;
      delete randomNumber[req.query.gameId]; // Clear the game state
      delete guessNum[req.query.gameId];

      responseMessage = {
          APIMessage: outMessage,
          guessed: true,
          gameOver: true // Signal to disable buttons and reset
      };
      return res.json(responseMessage);
  }

  // Check if the user has used all attempts
  if (guessNum[req.query.gameId] >= maxGuess) {
      outMessage = `You've lost. The correct number was ${numberToGuess}.`;
      delete randomNumber[req.query.gameId]; // Clear the game state
      delete guessNum[req.query.gameId];

      responseMessage = {
          APIMessage: outMessage,
          guessed: false,
          gameOver: true // Signal to disable buttons and reset
      };
      return res.json(responseMessage);
  }

  // Otherwise, provide feedback on the guess and remaining attempts
  outMessage = numberGuessed < numberToGuess
      ? `The guess of ${numberGuessed} is too low.`
      : `The guess of ${numberGuessed} is too high.`;
  outMessage += ` This is guess number ${guessNum[req.query.gameId]}. You have ${maxGuess - guessNum[req.query.gameId]} guesses left.`;

  responseMessage = {
      APIMessage: outMessage,
      guessed: false,
      gameOver: false // Do not disable buttons
  };
  res.json(responseMessage);
});


// Start the server
console.log("Listening on port 8080");
app.listen(8080);
