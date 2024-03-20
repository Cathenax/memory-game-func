import React from 'react';
import './card.css';

export default function Card(props) {
  const {id, card, handleCardClick} = props;
  const {emoji, emojiId, flipped, matchFound, disabled} = card;
  let status;
  if(matchFound){
    status = true;
  }
  else{
    status = disabled;
  }

  return(
    <button 
      className={`container ${flipped ? "flipped" : ""}`}
      disabled={status} 
      onClick={() => handleCardClick(id)} 
      data-id={emojiId}
      id={id}
    >
      <div className="inner">
        <div className="front">
          {emoji}
        </div>
        <div className="back">?</div>
      </div>
    </button>
  )   
}
