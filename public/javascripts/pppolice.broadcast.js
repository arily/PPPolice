  window.onload = function(){
  var pull = io.connect('http://localhost:13333');
  pull.on('report.farm',function(data) {
    console.log('farm',data);
    storage('farm',data);
  });
  pull.on('report.refarm',function(data) {
    console.log('farm');
    storage('refarm',data);
  });
  pull.on('report.defarm',function(data) {  
    console.log('farm');
    storage('defarm',data);
  });
    setTimeout(_=> {pull.emit('history')},1000);
  }