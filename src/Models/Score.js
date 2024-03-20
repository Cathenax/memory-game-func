export default function Score(_score) {
  let score;
  const me = {};
  function initialize(_score = 0){
    score = _score;
  }
  function setScore (_score) {
    score = _score;
  }
  function getScore () {
    return score;
  }
  
  initialize(_score);
  me.score = score;
  me.setScore = setScore;
  me.getScore = getScore; 
  return me;
}
