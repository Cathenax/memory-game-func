export default function Move(_maxMove = -1, _moveSteps = 0) {
  let maxMove;
  let moveSteps;
  let me = {};
  function initialize(_maxMove = -1, _moveSteps = 0){
    // maxMove = -1 indicates that user doesn't limit the moves
    maxMove = _maxMove;
    moveSteps = _moveSteps;
  }
  function setMaxMoves(_maxMove){
    maxMove = _maxMove;
  }
  function setSteps (_step) {
    moveSteps = _step;
  }
  function getSteps () {
    return moveSteps;
  }
  function getMaxSteps () {
    return maxMove;
  }
  function getRemainSteps () {
    if(maxMove === -1){
      return '∞';
    }
    else{
      return maxMove - moveSteps;
    }
  }
  
  initialize(_maxMove, _moveSteps);
  me.maxMove = maxMove;
  me.moveSteps = moveSteps;
  me.setMaxMoves = setMaxMoves;
  me.getMaxSteps = getMaxSteps;
  me.setSteps = setSteps;
  me.getSteps = getSteps;
  me.getRemainSteps = getRemainSteps;

  return me;
}