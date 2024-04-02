# Memory Game-func by Siyuan Liu
This project is for the NEU CS5010 project 2:  Functional Programming.  
Memory Game is a type of card game where the player's objective is to find matching pairs of cards by flipping them over two at a time.The cards are initially arranged face-down, and the player needs to remember the position of different cards as they flip them over in pairs.   
In this version I’m going to implement a functional program using React with hooks, not using classes. Also, I’ll make big changes to the style of the game (making it prettier), add animations when the card flips, adjust the size of the game board and add a box shadow when user hover the cursor on the card.

## Preview of the Game
![alt text](MemoryGameDemo.gif)

## How to start the game
### Start It Online
You can click the link below to start the game online.   
https://cathenax.github.io/memory-game-func/

### Development Mode 
In the project directory, you can run: `npm install` and `npm start` to run this app in the development mode.  
Open http://localhost:3000 to view it in your browser.

## Design Document
See the document at:   
https://drive.google.com/file/d/1w0Z5p9HtzYe69SZY_gxtxKgHda1tDb3B/view?usp=sharing

## Presentation Video
See on Google Drive:  
https://drive.google.com/file/d/1wJ9w7PtwmWsolTMga3vseYCOsLqeP8lU/view?usp=sharing

## Cypress Testing
#### Test Cases
1. Click a card and flip it
2. Start a new Game
3. Stop the game
4. Show the Difficulty Modal
5. Match two cards
#### Video
https://drive.google.com/file/d/17SjEaPUuITzv2Vj_UK9N_NZZZnXQ3Ox-/view?usp=sharing

## Other Features
This part is for further study in React and JavaScript.  
1. ```Throttle Function --April 1st.```  
   I implemented a throttole function that can decrease some complicated function (like starting a new game in this project) to be called too many times at a short time.  
