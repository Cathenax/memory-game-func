export default function Difficulty(_cardNum = 16, _delayTime = 1000) {
  const me = {};
  let cardNum;
  let delayTime;

  function initialize(_cardNum = 16, _delayTime = 1000){
    //default card number is 16, a 4x4 game board
    cardNum = _cardNum * 1;
    delayTime = _delayTime * 1;
  }
  function setCardNum (_cardNum) {
    cardNum = _cardNum * 1;
  }
  function getCardNum () {
    return cardNum;
  }
  function setDelayTime (_delayTime) {
    delayTime = _delayTime * 1;
  }
  function getDelayTime () {
    return delayTime;
  }

  initialize(_cardNum, _delayTime);

  me.setCardNum = setCardNum;
  me.getCardNum = getCardNum;
  me.setDelayTime = setDelayTime;
  me.getDelayTime = getDelayTime;
  me.cardNum = cardNum;
  me.delayTime = delayTime;

  return me;
}