
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
	var points = 0; //points to display later
	
    Q.load(["bumper.mp3"]);
    Q.load(["ping.mp3"]);
    Q.load(["pop.mp3"]);
	Q.load(["gameOver.mp3"]);
	Q.load(["winGame.mp3"]);
  
  var lives = new Q.UI.Text({ 
	  label: "Lives: 3",
      color: "white",
      x: Q.width - 45,
      y: 15
    }); 
	
	
	Q.UI.Text.extend("Lives",{
    init: function() {
      this._super({
        label: "lives: 3",
        //align: "left",
        x: Q.width - 45,
        y: 15,
        weight: "normal",
        size:18
      });

      Q.state.on("change.lives",this,"lives");
    },

    lives: function(lives) {
      this.p.label = "lives: " + lives;
    }
  });
  
	////////////////////////////
	var points = new Q.UI.Text({
		label: "Pts: 0",
		color: "white",
		x: 35,
		y: 15,
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
      this.p.x = Q.width / 2 + this.p.w / 2;
	  
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
			Q.stageScene('gameOver');		
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
			//point increase
			Q.state.set("lives",1);
			Q.stage().trigger('removeBlock');
			Q.audio.play('pop.mp3');
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
          Q.stageScene('winGame');
        }
      });
	  
	  stage.insert(points);
	  stage.insert(lives);
    }));
	
	Q.scene('startScreen',new Q.Scene(function(stage) {
		stage.insert(new Q.UI.Text({ 
		label: "       BLOCK BREAK\n\nMove with L and R arrow",
		color: "blue",
		x: 160,
		y: 50
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
		
		Q.audio.play('winGame.mp3');
    }));
	
	Q.stageScene('startScreen');
  });  
});

//Fix UI elements
//Attempt soundtrack again