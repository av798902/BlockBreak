//Alain Vincent
//CSC 496
//Homework 4
//November 4, 2014

//Global variables to manipulate
var pointsNum = 0;
var livesNum = 3;

$(function() {
  var Q = window.Q = Quintus({audioSupported: [ 'mp3' ]})
                     .include('Audio,Input,Sprites,Scenes,UI,Touch')
                     .setup()
					 .touch()
					 .enableSound();
					 
  Q.input.keyboardControls();
  Q.input.touchControls({ 
            controls:  [ ['left','<' ],[],[],[],['right','>' ] ]
  });
	
  Q.load(["bumper.mp3"]);
  Q.load(["ping.mp3"]);
  Q.load(["pop.mp3"]);
  Q.load(["gameOver.mp3"]);
  Q.load(["winGame.mp3"]);
  Q.load(["music.mp3"]);
  
  var points = new Q.UI.Text({
		label: "Pts: " + pointsNum,
		color: "white",
		x: 35,
		y: 15,
	}); 
	
  var lives = new Q.UI.Text({ 
	  label: "Lives: " + livesNum,
      color: "white",
      x: Q.width - 45,
      y: 15
    });	
   
  Q.Sprite.extend("Paddle", {     // extend Sprite class to create Q.Paddle subclass
    init: function(p) {
      this._super(p, {
        sheet: 'paddle',
        speed: 250,
        x: 0,
      });
      this.p.x = Q.width/2;
      this.p.y = Q.height - this.p.h + 10;
      if(Q.input.keypad.size) {
        this.p.y -= Q.input.keypad.size + this.p.h;
      }
    },
	 
    step: function(dt) {
      if(Q.inputs['left']) { 
        this.p.x -= dt * this.p.speed;
      } else if(Q.inputs['right']) {
        this.p.x += dt * this.p.speed;
      } 
	  
	  
      if(this.p.x < 30) { 
        this.p.x = 30;
      } else if(this.p.x > Q.width - 30) { 
        this.p.x = Q.width - 30;
      }
//      this._super(dt);	      // no need for this call anymore
    }
  });

  Q.Sprite.extend("Ball", {
    init: function() {
      this._super({
        sheet: 'ball',
        speed: 150,
        dx: 1,
        dy: -1,
      });
      this.p.y = Q.height / 2 + 20;
      //this.p.x = Q.width / 2 + this.p.w / 2;
	  this.p.x = Math.random() * (Q.width - 5) + 5;
	  
	  this.on('hit', this, 'collision');  // Listen for hit event and call the collision method
	  
	  this.on('step', function(dt) {      // On every step, call this anonymous function
		  var p = this.p;
		  Q.stage().collide(this);   // tell stage to run collisions on this sprite

		  p.x += p.dx * p.speed * dt;
		  p.y += p.dy * p.speed * dt;

		  if(p.x < 0) { 
			p.x = 0;
			p.dx = 1;
			Q.audio.play('ping.mp3');
		  } else if(p.x > Q.width - 10) { 
			p.dx = -1;
			p.x = Q.width - p.w;
			Q.audio.play('ping.mp3');
		  }

		  if(p.y <= 50) {
			p.y = 50;
			p.dy = 1;
			Q.audio.play('ping.mp3');
		  } else if(p.y > Q.height) {
			livesNum--;
			if (livesNum > 0){
				var containerZ = Q.stage().insert(new Q.UI.Container({
					fill: "black",
					border: 5,
					shadow: 10,
					shadowColor: "rgba(0,0,0,0.5)",
					x: Q.width - 50,
					y: 10
				}));
				Q.stage().insert(new Q.UI.Text({ 
					label: " ",
					color: "white",
					x: 0,
					y: 0
					}),containerZ); 
				containerZ.fit(3,50);
				var lives = new Q.UI.Text({ 
					label: "Lives: " + livesNum,
					color: "white",
					x: Q.width - 45,
					y: 15
				});	
				Q.stage().insert(lives);
				this.destroy();
				Q.stage().insert(new Q.Ball());
			} else if (livesNum == 0) {
				Q.audio.stop('music.mp3');
				Q.stageScene('gameOver');
			}
			}
	  });
    },
	
	collision: function(col) {                // collision method
		if (col.obj.isA("Paddle")) {
//			alert("collision with paddle");
			this.p.dy = -1;
			Q.audio.play("bumper.mp3");
		} else if (col.obj.isA("Block")) {
//			alert("collision with block");
			col.obj.destroy();
			this.p.dy *= -1;
			Q.audio.play('pop.mp3');
		    var containerY = Q.stage().insert(new Q.UI.Container({
				fill: "black",
				border: 5,
				shadow: 10,
				shadowColor: "rgba(0,0,0,0.5)",
				x: 50,
				y: 10
			}));
			Q.stage().insert(new Q.UI.Text({ 
				label: " ",
				color: "white",
				x: 0,
				y: 0
				}),containerY); 
			containerY.fit(3,40);
			pointsNum += 10;
			var points = new Q.UI.Text({
				label: "Pts: " + pointsNum,
				color: "white",
				x: 45,
				y: 15,
				}); 
			Q.stage().insert(points);
			Q.stage().trigger('removeBlock');
			
		}	
	}
  });

  Q.Sprite.extend("Block", {
    init: function(props) {
      this._super(_(props).extend({ sheet: 'block'}));
      this.on('collision',function(ball) { 
        this.destroy();
        ball.p.dy *= -1;
        Q.stage().trigger('removeBlock');
      });
    }
  });

//  Q.load(['blockbreak.png','blockbreak.json'], function() {
    Q.load(['blockbreak.png'], function() {
    // Q.compileSheets('blockbreak.png','blockbreak.json');  
	Q.sheet("ball", "blockbreak.png", { tilew: 20, tileh: 20, sy: 0, sx: 0 });
	Q.sheet("block", "blockbreak.png", { tilew: 40, tileh: 20, sy: 20, sx: 0 });
	Q.sheet("paddle", "blockbreak.png", { tilew: 60, tileh: 20, sy: 40, sx: 0 });		 		 
	
	Q.scene('game',new Q.Scene(function(stage) {
      stage.insert(new Q.Paddle());
      stage.insert(new Q.Ball());
	  Q.audio.stop('winGame.mp3');
	  Q.audio.stop('gameOver.mp3');
	  Q.audio.play('music.mp3',{ loop: true });
	  pointsNum = 0;
	  livesNum = 3;
      var blockCount=0;
      for(var x=0;x<6;x++) {
        for(var y=0;y<5;y++) {
          stage.insert(new Q.Block({ x: x*50+35, y: y*30+50}));
          blockCount++;
        }
      }
	  
      stage.on('removeBlock',function() {
		blockCount--;
        if(blockCount == 0) {
		  Q.audio.stop('music.mp3');
          Q.stageScene('winGame');
        }
      });

	  stage.insert(points);
	  stage.insert(lives);
    }));
	
	Q.scene('startScreen',new Q.Scene(function(stage) {
		Q.audio.stop('winGame.mp3');
	    Q.audio.stop('gameOver.mp3');
		stage.insert(new Q.UI.Text({ 
		label: "       BLOCK BREAK\n\nMove with L and R arrow",
		color: "blue",
		x: 160,
		y: 50
		})); 
		
		stage.insert(new Q.UI.Button({
		label: "About Game",
		x: Q.width/2,
		y: 225,
		fill: "grey", 
		border: 3, 
		shadow: 10, 
		shadowColor: "rgba(0,0,0,0.5)",
		}, function() {
			Q.stageScene('infoPage');
		}));
		
		stage.insert(new Q.UI.Button({
		label: "Play Game",
		x: Q.width/2,
		y: 300,
		fill: "grey", 
		border: 3, 
		shadow: 10, 
		shadowColor: "rgba(0,0,0,0.5)",
		}, function() {
			Q.stageScene('game');
		}));
		
	}));
    
	Q.scene('gameOver',new Q.Scene(function(stage) {
		var container = stage.insert(new Q.UI.Container({
		fill: "red",
		border: 5,
		shadow: 10,
		shadowColor: "rgba(0,0,0,0.5)",
		x: Q.width/2,
		y: Q.height/2
		}));
	
		stage.insert(new Q.UI.Text({ 
		label: "Game Over\n You Lose",
		color: "white",
		x: 0,
		y: 0
		}),container); 
		container.fit(Q.width,Q.height); 

		stage.insert(new Q.UI.Button({
		label: "Play Again",
		x: Q.width/2,
		y: 300,
		fill: "grey", 
		border: 3, 
		shadow: 10, 
		shadowColor: "rgba(0,0,0,0.5)",
		}, function() {
			Q.stageScene('game');
		}));
		
		stage.insert(new Q.UI.Button({
		label: "Title Screen",
		x: Q.width/2,
		y: 375,
		fill: "grey", 
		border: 3, 
		shadow: 10, 
		shadowColor: "rgba(0,0,0,0.5)",
		}, function() {
			Q.stageScene('startScreen');
		}));
		
		Q.audio.play('gameOver.mp3');
    }));
	
	Q.scene('winGame',new Q.Scene(function(stage) {
		var container = stage.insert(new Q.UI.Container({
		fill: "blue",
		border: 5,
		shadow: 10,
		shadowColor: "rgba(0,0,0,0.5)",
		y: Q.height/2,
		x: Q.width/2
		}));
	
		stage.insert(new Q.UI.Text({ 
		label: "Game Over\n  You Win",
		color: "white",
		x: 0,
		y: 0
		}),container); 
		container.fit(Q.width,Q.height); 
		
		stage.insert(new Q.UI.Button({
		label: "Play Again",
		x: Q.width/2,
		y: 300,
		fill: "grey", 
		border: 3, 
		shadow: 10, 
		shadowColor: "rgba(0,0,0,0.5)",
		}, function() {
			Q.stageScene('game');
		}));
		
		stage.insert(new Q.UI.Button({
		label: "Title Screen",
		x: Q.width/2,
		y: 375,
		fill: "grey", 
		border: 3, 
		shadow: 10, 
		shadowColor: "rgba(0,0,0,0.5)",
		}, function() {
			Q.stageScene('startScreen');
		}));
		
		Q.audio.play('winGame.mp3');
    }));
	
	Q.scene('infoPage',new Q.Scene(function(stage) {
		stage.insert(new Q.UI.Text({
		label: "   How to move paddle:\nUse L and R arrow keys",
		color: "white",
		x: 160,
		y: 50
		})); 
		
		stage.insert(new Q.UI.Text({ 
		label: "You have 3 lives \nto beat the game",
		color: "red",
		x: 160,
		y: 125
		})); 
		
		stage.insert(new Q.UI.Text({ 
		label: "        Win or lose:\nHit a button to replay",
		color: "white",
		x: 160,
		y: 200
		})); 
		
		stage.insert(new Q.UI.Text({ 
		label: "The game uses sound!\n   Put your volume up",
		color: "red",
		x: 160,
		y: 275
		})); 
		
		stage.insert(new Q.UI.Button({
		label: "Title Screen",
		x: 85,
		y: 375,
		fill: "grey", 
		border: 3, 
		shadow: 10, 
		shadowColor: "rgba(0,0,0,0.5)",
		}, function() {
			Q.stageScene('startScreen');
		}));
		
		stage.insert(new Q.UI.Button({
		label: "Play Game",
		x: 237,
		y: 375,
		fill: "grey", 
		border: 3, 
		shadow: 10, 
		shadowColor: "rgba(0,0,0,0.5)",
		}, function() {
			Q.stageScene('game');
		}));
	}));	
	Q.stageScene('startScreen');
  });  
});
