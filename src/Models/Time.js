export default function Time(_maxTime = -1, _time = 0) {
  let maxTime;
  let time;
  let remainTime;
  const me = {};
  function initialize(_maxTime = -1, _time = 0){
    // maxTime = -1 indicates that user doesn't limit the time
    maxTime = _maxTime;
    remainTime = _maxTime;
    time = _time;
  }
  function setMaxTime(_maxTime){
    maxTime = _maxTime;
  }
  function setRemainTime(_remainTime){
    remainTime = _remainTime;
  }
  function getRemainTime () {
    if(maxTime === -1){
      return '∞';
    }
    else{
      return remainTime;
    }
  }
  function setTime (_time){
    time = _time;
  }
  function getTime (){
    return time;
  }
  function getMaxTime (){
    return maxTime;
  }

  initialize(_maxTime, _time);
  me.maxTime = maxTime;
  me.time = time;
  me.remainTime = remainTime;
  me.setMaxTime = setMaxTime;
  me.getMaxTime = getMaxTime;
  me.setRemainTime = setRemainTime;
  me.getRemainTime = getRemainTime;
  me.setTime = setTime;
  me.getTime = getTime;
  return me;
}