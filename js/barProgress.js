var bar = new ProgressBar.Circle(container, {
    color: '#010101',
    // This has to be the same size as the maximum width to
    // prevent clipping
    strokeWidth: 8,
    trailWidth: 4,
    easing: 'easeInOut',
    duration: 1400,
    text: {
      autoStyleContainer: false
    },
    from: { color: '#7fdf67', width: 4 },
    to: { color: '#7fdf67', width: 8 },
    // Set default step function for all animate calls
    step: function(state, circle) {
      circle.path.setAttribute('stroke', state.color);
      circle.path.setAttribute('stroke-width', state.width);
  
      var value = Math.round(circle.value() * 100);
      let nameProgress = ' <span class="name_pro"> PROGRESS</span>';
      if (value === 0) {
        circle.setText('0'+ nameProgress);
      } else {
        circle.setText(value + nameProgress);
      } 
    }
  });
  bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
  bar.text.style.fontSize = '2rem';
  bar.text.style.fontWeight = 'bold';