import React, { useEffect, useState, useRef } from 'react'
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
  const intervalRef = useRef(null);
  const resumeBtnRef = useRef(null);
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
      newCards = dbcards.map((card)=>{
        if(card.matchFound === false){
          card.disabled = false;
        }
        return card;
      });
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
      newTime = new Time(time.maxTime);
      // newTime = new Time(5);
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
    resetTime();
    setPlaying(true);
    clearInterval(intervalRef.current);
    setNewInterval();
    resumeBtnRef.current.disabled = false;
    message.success("New game starts!");
  }

  const stopOrResume = async(stop) => {
    //stop the game
    //if there's a value of stop, means the game count down to zero
    //have to disable resume button at that time
    if(playing || stop){
      //if stop
      if(stop){
        resumeBtnRef.current.disabled = true;
      }
      //diable all the buttons
      const newCards = cards.map((card) => {
        return {...card, disabled:true};
      })
      //stop counting time
      clearInterval(intervalRef.current);
      //renew the state
      setPlaying(false);
      //clear the selections
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
      setNewInterval();
      //renew the state
      setPlaying(true);
      setFirstSelection(null);
      setSecondSelection(null);
      setCards(newCards);
    }
  }

  // if user click on newGame or change the difficulty, restart
  useEffect(()=>{
    if(newGameStatus === true){
      newGame();
      setNewGame(false);
    }
  },[newGameStatus]);

  const updateSettings = () => {
    const difficultyOption = diffRef.current.getFieldsValue().difficulty;
    const {flipBackTime, maxTime, maxMove} = diffRef.current.getFieldsValue();
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
    // * 1000 because the delayTime in difficulty is in ms
    const newDifficulty = Difficulty(cardNumber, flipBackTime * 1000);
    const newMove = Move(maxMove, 0);
    const newTime = Time(maxTime, 0);
    setDifficulty(newDifficulty);
    setMove(newMove);
    setTime(newTime);
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
    const userTime = {time:time.time, maxtime: time.maxTime};
    const userMove = {step:move.getSteps(), maxstep:move.getMaxSteps()};
    const userDiff = {cardnum:difficulty.getCardNum(), delaytime: difficulty.getDelayTime()};
    const userData = {score:userScore, time:userTime, cards:userCards, move:userMove, difficulty:userDiff};
    await db.saveGameStatus(userData);
    message.success("Successfully saved the game data!");
  }

  //check two cliked cards are a match or not
  useEffect(()=>{  
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
        setTimeout(() => {
          setFirstSelection(null);
          setSecondSelection(null);
          setCards(newCards);
          setMove((preMove) => {
            const newMove = new Move(preMove.maxMove, preMove.moveSteps+1);
            return newMove;
          });
          setScore(newScore);
        }, delayTime);
      }
    }
    matchCards();
  }, [secondSelection]);
  
  // get data from db to resume the saved game when mounted
  // and also, start a timer to count the time played
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
        setPlaying(true);
      }
    }
    call(db);
    setNewInterval();
    return (()=>{
      clearInterval(intervalRef.current);
    })
  }, []);

  // // using my own hooks to setup an interval
  // useInterval(() => {    
  //   setTime((time)=>{
  //     const newTime = new Time(time.maxTime, time.time + 1);
  //     return newTime;
  //   });
  // }, 1000);

  const setNewInterval = () => {
    intervalRef.current = setInterval(()=>{
      setTime((time)=>{
        const newTime = new Time(time.maxTime, time.time + 1);
        return newTime;
      });
    },1000);
  }

  useEffect(()=>{
    if(time.maxTime === time.time){
      message.error("Time is over!");
      stopOrResume(true);
    }
  },[time])

  useEffect(()=>{
    if(move.maxMove === move.moveSteps){
      message.error("Max move reached!");
      stopOrResume(true);
    }
  },[move])

  return (
    <div className='game'>
      <div className='gameheader'>
        <Button size={'large'} onClick={() => setNewGame(true)}>New Game</Button>
        <Button 
          size={'large'} 
          onClick={() => stopOrResume()} 
          ref={resumeBtnRef}
        >
        {playing? 'Stop' : 'Resume'}
        </Button>
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
            <Form.Item
              name='flipBackTime'
              initialValue={1}
              label='Time shown for a mismatch (in second)'
            >
              <Select 
                style={{
                  width: 120,
                }}
                options={[
                  {
                    value: 1,
                    label: '1',
                  },
                  {
                    value: 2,
                    label: '2',
                  },
                  {
                    value: 3,
                    label: '3',
                  },
                ]}
              />
            </Form.Item>
            <Form.Item
              name='maxTime'
              initialValue={-1}
              label='Time limit (in second)'
            >
              <Select 
                style={{
                  width: 120,
                }}
                options={[
                  {
                    value: 60,
                    label: '60',
                  },
                  {
                    value: 90,
                    label: '90',
                  },
                  {
                    value: 120,
                    label: '120',
                  },
                  {
                    value: 300,
                    label: '300',
                  },
                  {
                    value: -1,
                    label: 'No limit',
                  },
                ]}
              />
            </Form.Item>
            <Form.Item
              name='maxMove'
              initialValue={-1}
              label='Move limit'
            >
              <Select 
                style={{
                  width: 120,
                }}
                options={[
                  {
                    value: 20,
                    label: '20',
                  },
                  {
                    value: 40,
                    label: '40',
                  },
                  {
                    value: 60,
                    label: '60',
                  },
                  {
                    value: 100,
                    label: '100',
                  },
                  {
                    value: -1,
                    label: 'No limit',
                  },
                ]}
              />
            </Form.Item>
          </Form>
      </Modal>
      <div className='gamefooter'>
        <span>Total Moves: {move.moveSteps}</span> 
        <span>Moves Remain: {move.maxMove === -1 ? '∞' : move.maxMove - move.moveSteps}</span>
        <span>Total Time: {time.time}</span>
        <span>Time Remain: {time.maxTime === -1 ? '∞' : time.maxTime - time.time}</span>
        <span>Total Score: {score.getScore()}</span>
      </div>
    </div>
  )
}

// //another way to implement the interval
// function useInterval(callback, delay) {
//   const savedCallback = useRef();

//   // Remember the latest callback.
//   useEffect(() => {
//     savedCallback.current = callback;
//   }, [callback]);

//   // Set up the interval.
//   useEffect(() => {
//     function tick() {
//       savedCallback.current();
//     }
//     if (delay !== null) {
//       let id = setInterval(tick, delay);
//       return () => clearInterval(id);
//     }
//   }, [delay]);
// }