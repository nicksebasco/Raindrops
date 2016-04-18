document.addEventListener('DOMContentLoaded', function() {
  // trivial function that returns a random integer between min and max values.
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  // object of equations used in the game
  var equationList = {
      // dictionary of math operation functions that each return an object containing an answer, innerText for the
      // rain drop div, and a type used for identification purposes.
      plus: function(x,y){
          var sum = x+y;
          if ( Math.abs(parseInt(sum) - parseFloat(sum.toFixed(1))) >=.1 ){
              sum = parseFloat(parseFloat(sum).toFixed(1));
          }
          else{
              sum = parseInt(sum)
          }
          return {equation: String(x) + " + " + String(y), answer: sum, type: "add" }
      },
      minus: function(x,y){
          var difference = x-y;
          if (Math.abs(parseInt(difference) - parseFloat(difference.toFixed(1))) >=.1 ){
              difference = parseFloat(parseFloat(difference).toFixed(1));
          }
          else{
              difference = parseInt(difference);
          }
          return {equation: String(x) + " - " + String(y), answer: difference, type: "minus" }
      },
      times: function(x,y){
          return {equation: String(x) + " x " + String(y), answer: x*y, type: "times" }
      },
      divide: function(x,y){
          return {equation: "<math style='margin-top:45%'><mn>"+String(x)+"</mn><mo>&divide</mo><mn>"+String(y)+"</mn></math>", answer: x/y, type: "divide" }
      },
      squared: function(x,y){
          return {equation: x+"<sup style='font-size: 8px; margin-left:1px;'>2<sup>", answer: x*y, type: "squared" }
      }
  }
  // Function used to generate a random equation with random values.
  function generateEquation(){
      // list of equation types from equationList ["plus", "minus",...etc]
      var eqKeys = Object.keys(equationList);
      // selects a random equation type
      var key = eqKeys[getRandomInt(1,eqKeys.length)-1];
      // used for addition and subtraction, chooses whether or not the values will be integers or decimals
      var newType = ["int","dec"][getRandomInt(0,1)];
      var newEquation;

      switch(key){
          case "plus":
              // integer addittion up to 100
              // decimal addition up to 10 + tens place decimal
              var x = newType === "int" ? getRandomInt(0,100): getRandomInt(1,10) + parseFloat(Math.random().toFixed(1));
              var y = newType === "int" ? getRandomInt(0,100): getRandomInt(1,10) + parseFloat(Math.random().toFixed(1));
              newEquation = equationList['plus'](x,y);
              break;
          case "minus":
              // integer subtraction up to 100
              // decimal subtraction up to 10 + tens place decimal
              var x = newType === "int" ? getRandomInt(0,100): getRandomInt(1,10) + parseFloat(Math.random().toFixed(1));
              var y = newType === "int" ? getRandomInt(0,100): getRandomInt(1,10) + parseFloat(Math.random().toFixed(1));
              newEquation = equationList['minus'](x,y);
              break;
          case "times":
              var x = getRandomInt(1,11), y = getRandomInt(1,100);
              newEquation = equationList['times'](x,y);
              break;
          case "divide":
              var x = getRandomInt(1,10), y = getRandomInt(1,10);
              newEquation = equationList['divide'](x,y);
              break;
          case "squared":
              var x = getRandomInt(1,100);
              newEquation = equationList['squared'](x,x);
              break;
      }
      return newEquation
  }

  function RainDrop(name){
    // drop attributes
    this.drop = document.createElement("div");
    this.equation = generateEquation();
    // drop styling
    this.drop.className = "drop";
    this.drop.id = "drop" + String(name);
    this.drop.style.display = "none";
    this.drop.innerHTML = this.equation.equation;
  }
  RainDrop.prototype.updateAnswerContainer = function(){
    document.getElementById("answer-container").innerHTML =  String(this.equation.answer).length > 6? this.equation.answer.toFixed(4): this.equation.answer;
  }

  var rainGame = {

    floor: document.getElementById("floor"),
    container: document.getElementById("game-container"),

    initializeParameters: function(){
      this.drop = null;
      this.timer = null;
      this.waterlevel = [0];
      this.dropContainer = {};
      this.newVariableStorage = {};
      this.start = false;
      this.inputValue = 0;
      this.turnCount = 0;
      this.peekCount = 3;
      this.score = 0;
      this.currentHeight = 0;
    },
    calculateScore: function(){
      // function that calculates a score based on the speed of response
      // linear equation of the form -.00243309 + 1.1 will provide multipliers
      // from (.1-1 based on speed of response)
      var baseUnit = 20;
      var offset = .05815 + .1;
      var timeFactor = -(.00243309*this.currentHeight) + 1.1+ offset;
      this.score = this.score + (timeFactor*baseUnit);
      document.getElementById("Score").innerHTML = Math.round(this.score)
    },
    updateTurnCount: function(){
      this.turnCount += 1;
      // display turn number in stats container
      document.getElementById("levelCount").innerHTML = "Level: " + String(this.turnCount);
      return this.turnCount
    },
    updateAnswerContainer: function(){
      document.getElementById("answer-container").innerHTML =  String(this.dropContainer[Object.keys(this.dropContainer).length -1][1])
    },
    updateWater: function(){
      // increment the water level by 50 and then remove the old water level from the array.
      this.waterlevel.push(50 + this.waterlevel.pop());
      document.getElementById("waterHeight").innerHTML =  "Water Height: " + String(this.waterlevel);
    },
    gameover: function(){
      this.drop = null;
      var pos = document.getElementById('pos');
      pos.className = "posOver";
      pos.innerHTML = "Game Over";
    },
    spawnDrop: function(name){
      // create a new drop
      var drop = new RainDrop(name);
      // add drop to the drop container.
      this.dropContainer[name] = [drop.equation.equation,drop.equation.answer, drop.equation.type];
      // set raingames's drop attribute to the newly created drop.
      this.drop = drop.drop;
      // initialize drop style so that it spawns at the top.
      this.drop.style.top = "0px";
      // insert new drop into the game-container div.
      this.container.appendChild(this.drop);
      drop.updateAnswerContainer();
    },
    generateWater: function(height){
      // create a new water level
      var newlevel = document.createElement("div");
        newlevel.id = "waterlevel";
        newlevel.className = "waterlevel";
        newlevel.style.height = height;
        newlevel.style.borderTop = height <= 0 ? "none": ".5px solid blue";

      // remove drop
      this.container.removeChild(this.drop);
      // remove old water level
      this.container.removeChild(document.getElementById("waterlevel"));
      // append new water level
      this.container.appendChild(newlevel);
    },
    multiplierEquation: function(x){
      return (-(.00243309*x) + 1.1+.05815 + .1).toFixed(2)
    },
    move: function (waterLevel){
      var self = this;
      // make the drop visible once movement starts
      this.drop.style.display = "inline";
      // get exact html position (floor.getBoundingClientRect().top)
        if (this.drop.getBoundingClientRect().bottom  ===  this.floor.getBoundingClientRect().top+2 ){
          clearTimeout(this.timer);
          this.generateWater( (parseInt(waterLevel) + 50)+'px' );
          this.updateWater();
          this.init(Object.keys(this.dropContainer).length);
        }
        else{
          // current height of rain drop
          this.currentHeight = this.drop.getBoundingClientRect().top;
          // display the changing multiplier value as the rain drop falls
          document.getElementById("multiplier").innerHTML = "Multiplier: "+ this.multiplierEquation(this.currentHeight);
          // move the rain drop
          this.drop.style.top = parseInt(this.drop.style.top)+2 +'px'; // pseudo-property code: Move down by 10px
          this.timer = setTimeout(function(){ self.move(waterLevel) },50); // call move with appropriate waterLevel argument
        }

    },
    init: function (name){
      var self = this;
      // updates levels in stats container
      this.updateTurnCount()
      // if water level fills up game container, game = Over
      if ( this.waterlevel[0] === 450 ){
        this.gameover();
      }
      else{
        this.spawnDrop(name);
        // if user has not not started the game yet, wait for a click to initiate animation,
        // else proceed with continous animation.
        if (!this.start){
          this.container.addEventListener('click',function(){
            document.getElementById("pos").innerText = ""; // reset "click to Play innerText"
            self.start = true;
            self.move(self.waterlevel[0]);
            this.removeEventListener('click',arguments.callee,false); // arguments.calle has deprecated, use named function expression instead
          },false)
        }
        else{
          this.move(this.waterlevel[0]);
        }
      }
    },
    addListeners: function(){
      var self = this;

      var playButton = document.getElementById("playAgain");
      var answerContainer = document.getElementById('answer-container');
      var textInput = document.getElementById("guess");

      function boot(){
        location.reload();
      }
      function checkAnswer(event){
        if (self.peekCount > 0){
          answerContainer.style.backgroundColor = "white";
          self.peekCount -= 1;
          document.getElementById("peekCount").innerHTML = self.peekCount;
          setTimeout(function(){
            answerContainer.style.backgroundColor = "#29293d";
          },1000)
        }
      }
      function checkInput(e){
        var dropKey = Object.keys(self.dropContainer).length-1;
        var answer = self.dropContainer[dropKey][1];
        var evt = e || window.event;
        var keycode =  evt.keyCode;

        function passedConditions(){
          clearTimeout(self.timer)
          self.container.removeChild(self.drop)
          self.calculateScore()
          self.init(Object.keys(self.dropContainer).length)
        }

        if(keycode === 13){
          self.inputValue = textInput.value;
          if( answer ===  parseFloat(self.inputValue) ) {
              passedConditions();
          }
          else if ( self.dropContainer[dropKey][2] === "divide" ){
            // if user Input is within 3 correct decimal places the value will be accepted
            if( answer.toPrecision(3) === parseInt(self.inputValue).toPrecision(3)
              || answer.toPrecision(3).slice(1) === String(self.inputValue)
              // will except at a minimum .xx for division
                || answer.toPrecision(2).slice(1) === String(self.inputValue)){
                  passedConditions();
            }
          }
          // every time enter is pressed, clear the input regardless of correctness
          textInput.value = "";
        }
      }
      playButton.addEventListener("click",boot);
      answerContainer.addEventListener("click", checkAnswer);
      document.addEventListener("keydown", checkInput);
    },
    playGame: function(){
      // call methods
      this.initializeParameters();
      this.addListeners();
      this.init( Object.keys(this.dropContainer).length );
      // set background text
      document.getElementById("pos").innerHTML = "<span class='click2play-text'>Click</span> <span class='click2play-text'>to</span> <span class='click2play-text'>Play!</span> ";
    }
  }
  rainGame.playGame();
})
