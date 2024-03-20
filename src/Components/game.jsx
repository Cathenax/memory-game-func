import React, { useEffect, useState } from 'react'
import { Button, Modal, Select, Form, message} from 'antd';

import Card from './card';
import Time from '../Models/Time';
import Move from '../Models/Move';
import Score from '../Models/Score';
import Difficulty from '../Models/Difficulty';
import './game.css'
import { cardEmojis } from '../Utils/cardEmojis';
import MyDB from '../Utils/firebase';

export default function Game() {
  const [score, setScore] = useState(new Score());
  const [difficulty, setDifficulty] = useState(new Difficulty());
  const [move, setMove] = useState(new Move());
  const [time, setTime] = useState(new Time());
  const [cards, setCards] = useState([]);
  const [playing, setPlaying] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [firstSelection, setFirstSelection] = useState(null);
  const [secondSelection, setSecondSelection] = useState(null);
  const [newGameStatus, setNewGame] = useState(false);
  let diffRef = React.createRef();
  const db = MyDB;

  const resetMoveAndScore = (dbmove = null, dbscore = null) => {
    let newMove, newScore; 
    //no data from the db
    if(dbmove === null || dbscore === null){
      newMove = new Move(move.getMaxSteps());
      newScore = new Score();
      
    }
    else{ //load data from the db
      newMove = new Move(dbmove.maxstep, dbmove.step);
      newScore = new Score(dbscore);
    }
    setMove(newMove);
    setScore(newScore);
  }

  const resetCards = (dbcards) =>{
    let newCards;
    //no data from db
    if(!dbcards){
      const numOfCards = difficulty.getCardNum() / 2;
      const allCard = cardEmojis.slice(0,numOfCards);
      newCards = [...allCard,...allCard]
        .sort(() => Math.random() - .5)
        .map((card, index) => {
          return ({...card, disabled:false, key: index})
        });
    }
    else{
      newCards = dbcards;
    }
    setCards(newCards);
  }

  const resetTurns = () =>{
    const step = move.getSteps();
    const maxStep = move.getMaxSteps();
    if(firstSelection && secondSelection){
      const newMove = new Move(maxStep, step+1);
      setFirstSelection(null);
      setSecondSelection(null);
      setMove(newMove);
    }
  }

  const resetTime = (dbtime) => {
    let newTime;
    if(!dbtime){
      newTime = new Time();
    }
    else{
      newTime = new Time(dbtime.maxtime, dbtime.time);
    }
    setTime(newTime);
  }

  const resetDifficulty = (dbdiffculty) => {
    let newDiff;
    if(!dbdiffculty){
      newDiff = Difficulty();
    }
    else{
      newDiff = Difficulty(dbdiffculty.cardnum, dbdiffculty.delaytime);
    }
    setDifficulty(newDiff);
  }

  const newGame = () => {
    //Todo: show loading for have a second
    resetMoveAndScore();
    resetCards();
    resetTurns();
    message.success("New game starts!");
  }

  const stopOrResume = async() => {
    //stop the game
    if(playing){
      //clear the selections
      //diable all the buttons
      const newCards = cards.map((card) => {
        return {...card, disabled:true};
      })
      //stop counting time

      //renew the state
      setPlaying(false);
      setFirstSelection(null);
      setSecondSelection(null);
      setCards(newCards);
    }
    //resume the game
    else{
      //enable all the buttons
      const newCards = cards.map((card) => {
        return {...card, disabled:false};
      })
      //start counting time

      //renew the state
      setPlaying(true);
      setFirstSelection(null);
      setSecondSelection(null);
      setCards(newCards);
    }
  }

  useEffect(()=>{
    if(newGameStatus === true){
      newGame();
      setNewGame(false);
    }
  },[newGameStatus]);

  const updateSettings = () => {
    const difficultyOption = diffRef.current.getFieldsValue().difficulty;
    let cardNumber;
    if(difficultyOption === 'Easy'){
      cardNumber = 16;
    }
    else if(difficultyOption === 'Medium'){
      cardNumber = 36;
    }
    else{
      cardNumber = 64;
    }
    const newDifficulty = Difficulty(cardNumber);
    setDifficulty(newDifficulty);
    setShowStatus(false);
    setNewGame(true);
  }

  const openSettings = () => {
    setShowStatus(true);
  }

  const handleCancel = () => {
    //reset the form
    diffRef.current.resetFields();
    setShowStatus(false);
  }

  //handle the click event of a card
  const handleCardClick = (cardId) =>{
    const clickedCard = cards[cardId];
    //if not playing
    if(playing === false){
      return;
    }
    //is a second click
    if(firstSelection){
      //handle duplicated single card click
      if(clickedCard.key === firstSelection.key){
        return;
      }
      //handle duplicate click (>2)
      else if(secondSelection){
        return;
      }
      else{
        //flip a card
        const newCards = cards.map((card) => {
          if(card.key === cardId){
            return {...card, flipped:true};
          }
          else{
            return card;
          }
        })
        setSecondSelection(clickedCard);
        setCards(newCards);
      }
    }
    // is a first click
    else{
      //flip a card
      const newCards = cards.map((card) => {
        if(card.key === cardId){
          return {...card, flipped:true};
        }
        else{
          return card;
        }
      })
      setFirstSelection(clickedCard);
      setCards(newCards);
    }
    // console.log(clickedCard);
  }

  const saveGameStatus = async() => {
    //prepare data to store in the firestore
    let userCards;
    if(firstSelection){
      userCards = cards.map((card) => {
        if(card.id === firstSelection.id){
          return {...card, flipped:false};
        }
      })
    }
    else{
      userCards = cards;
    }
    const userScore = score.getScore();
    const userTime = {time:time.getTime(), maxtime: time.getMaxTime()};
    const userMove = {step:move.getSteps(), maxstep:move.getMaxSteps()};
    const userDiff = {cardnum:difficulty.getCardNum(), delaytime: difficulty.getDelayTime()};
    const userData = {score:userScore, time:userTime, cards:userCards, move:userMove, difficulty:userDiff};
    await db.saveGameStatus(userData);
    message.success("Successfully saved the game data!");
  }

  useEffect(()=>{
      //check two cliked cards are a match or not
    const matchCards = () =>{
      const delayTime = difficulty.getDelayTime();
      let newCards;
      let newScore = score;
      //if only choose one or zero cards
      if(!firstSelection || !secondSelection){
        return;
      }
      else{
        //is a match
        if(firstSelection.emojiId === secondSelection.emojiId){
          // console.log('match',firstSelection.emojiId);
          newCards = cards.map((card) => {
            if(card.key === firstSelection.key){
              return {...card, matchFound : true};
            }else if(card.key === secondSelection.key){
              return {...card, matchFound : true};
            }
            else{
              return card;
            }
          })
          //increment score
          newScore = new Score();
          newScore.setScore(score.getScore()+1);
        }
        //is not a match
        else{
          //flip back the cards
          // console.log('not a match',firstSelection.emojiId, secondSelection.emojiId);
          newCards = cards.map((card) => {
            if(card.key === firstSelection.key){
              return {...card, flipped : false};
            }else if(card.key === secondSelection.key){
              return {...card, flipped : false};
            }
            else{
              return card;
            }
          });
        }
        //increment move
        const newMove = new Move(move.getMaxSteps());
        newMove.setSteps(move.getSteps()+1);
        setTimeout(() => {
          // console.log("Delayed for " + delayTime);
          setFirstSelection(null);
          setSecondSelection(null);
          setCards(newCards);
          setMove(newMove);
          setScore(newScore);
        }, delayTime);
      }
    }
    matchCards();
  }, [secondSelection]);
  
  useEffect(()=>{
    async function call(db){
      //get game data from firestore db
      const userData = await db.getGameStatus();
      const {move, score, time, difficulty, cards} = userData;
      if(!userData || cards.length === 0){
        newGame();
      }
      else{
        //load data
        resetMoveAndScore(move,score);
        resetCards(cards);
        resetTurns();
        resetDifficulty(difficulty);
        resetTime(time);
      }
    }
    call(db);
  }, []);

  return (
    <div className='game'>
      <div className='gameheader'>
        <Button size={'large'} onClick={() => newGame()}>New Game</Button>
        <Button size={'large'} onClick={() => stopOrResume()}>{playing? 'Stop' : 'Resume'}</Button>
        <Button size={'large'} onClick={() => saveGameStatus()}>Save</Button>
        <Button size={'large'} onClick={() => openSettings()}>Settings</Button>
      </div>
      <div 
        className="gameboard"
        columns={Math.sqrt(difficulty.getCardNum())}
      >
        {
          cards && (cards.map((card, index) => {
            return (
              <Card
                key={index}
                id={index}
                card={card}
                handleCardClick={(cardId) => handleCardClick(cardId)}
              />
            )
          }))
        }
      </div>
      <Modal 
          title="Settings" 
          open={showStatus} 
          onOk={updateSettings} 
          onCancel={handleCancel}
          okText="OK and Restart"
        >
          <Form ref={diffRef}>
            <Form.Item 
              name='difficulty'
              initialValue={'Easy'}
              label='Difficulty'
            >
              <Select 
                style={{
                  width: 120,
                }}
                options={[
                  {
                    value: 'Easy',
                    label: 'Easy',
                  },
                  {
                    value: 'Medium',
                    label: 'Medium',
                  },
                  {
                    value: 'Hard',
                    label: 'Hard',
                  },
                ]}
              />
            </Form.Item>
          </Form>
      </Modal>
      <div className='gamefooter'>
        <span>Total Moves: {move.getSteps()}</span> 
        <span>Moves Remain: {move.getRemainSteps()}</span>
        <span>Total Time: {time.getTime()}</span>
        <span>Time Remain: {time.getRemainTime()}</span>
        <span>Total Score: {score.getScore()}</span>
      </div>
    </div>
  )
}