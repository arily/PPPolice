  window.onload = function(){
  var pull = io.connect('/');
  pull.on('report.farm',function(data) {
    console.log('farm',data);
    storage('farm',data);
  });
  pull.on('report.refarm',function(data) {
    console.log('refarm',data);
    storage('refarm',data);
  });
  pull.on('report.defarm',function(data) {  
    console.log('defarm',data);
    storage('defarm',data);
  });
  pull.on('connect',_=>{
    setTimeout(_=> {pull.emit('history')},500);
  })
  }