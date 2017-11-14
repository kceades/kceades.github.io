var player_turn = 1;
var num_moves = 0;
var board = [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];
var player1_name = 'Player 1';
var player2_name = 'Player 2';
// variable for the game status with:
// 0 == still playing
// 1 == game has finished
var game_status = 0;
var player1_wins = 0;
var player2_wins = 0;
var draws = 0;
var games_played = 0;
var ply = 9;
var red = 'rgba(255,0,0,0.5)';
var light_red = 'rgba(255, 153, 194,0.9)'
var blue = 'rgba(0,0,255,0.5)';
var light_blue = 'rgba(153, 230, 255,0.9)';
var victor_color = [0,light_blue,light_red];
var player_color = [0,'blue','red'];

$('#ailevel').on('change',function(){
	ply = parseInt($('#ailevel').val());
});

$('#player1').on('change keydown paste input', function(){
	player1_name = $('#player1').val();
	if (player1_name=='') {
		player1_name = 'Player 1';
	}
	$('#stat1name').html(player1_name.concat("'s Wins"));
	if (player_turn==1) {
		$('#whosturn').html(player1_name.concat("'s turn"));
	}
});

$('#player2').on('change keydown paste input', function(){
	player2_name = $('#player2').val();
	if (player2_name=='') {
		player2_name = 'Player 2';
	}
	$('#stat2name').html(player2_name.concat("'s Wins"));
	if (player_turn==2) {
		$('#whosturn').html(player2_name.concat("'s turn"));
	}
});

$('#PvP').on('click',function() {
	var pvp_class = $('#PvP').hasClass('notselected');
	if (pvp_class && num_moves==0) {
		resetStats();
		$('#PvP').removeClass('notselected');
		$('#PvP').addClass('selected');
		$('#PvE').removeClass('selected');
		$('#PvE').addClass('notselected');
		if ($('#name2').css('display')=='none') {
			$('#name2').css('display','inline-block');
		}
		player2_name = $('#player2').val();
		if (player2_name=='') {
			player2_name = 'Player 2';
		}
		$('#stat2name').html(player2_name.concat("'s Wins"));
	}
});

$('#PvE').on('click',function() {
	var pve_class = $('#PvE').hasClass('notselected');
	if (pve_class && num_moves==0) {
		resetStats();
		$('#PvE').removeClass('notselected');
		$('#PvE').addClass('selected');
		$('#PvP').removeClass('selected');
		$('#PvP').addClass('notselected');
		$('#name2').css('display','none');
		player2_name = 'The AI';
		$('#stat2name').html(player2_name.concat("'s Wins"))
	}
});

function resetStats() {
	player1_wins = 0;
	player2_wins = 0;
	draws = 0;
	games_played = 0;
	$('#stat1val').html(player1_wins);
	$('#stat2val').html(player2_wins);
	$('#statdrawsval').html(draws);
	$('#statgamesval').html(games_played);
}

function runGame() {
	var turn_box = document.querySelector('#whosturn');
	var row = Number(this.id.charAt(3));
	var col = Number(this.id.charAt(4));
	if (game_status==0) {
		var next_row = openRow(col,board);
		if (next_row!=-1) {
			var box_string = 'box'.concat(String(next_row).concat(String(col)));
			var canvas_object = document.getElementById(box_string);
			var ctx = canvas_object.getContext('2d');
			drawCircle(ctx,player_turn);
			updateGame(next_row,col,player_turn,turn_box);
			if (game_status==0) {
				if ($('#PvE').hasClass('selected')) {
					var moves_to_play = Math.min(ply,42-num_moves);
					var AI_move = calcAiMove(2,board,moves_to_play);
					var box_id = 'box'.concat(String(AI_move[0]),
						String(AI_move[1]));
					var ai_canvas_object = document.getElementById(box_id);
					var ai_ctx = ai_canvas_object.getContext('2d');
					drawCircle(ai_ctx,2);
					updateGame(AI_move[0],AI_move[1],2,turn_box);
				}
			}
		}
	}
}

function openRow(col,cboard) {
	var return_row = -1;
	var i = 0;
	for (i=0;i<6;i++) {
		if (cboard[i][col]==0) {
			return_row = i;
		}
	}
	return return_row;
}

function openMoves(cboard) {
	var return_moves = [];
	var current_row = 0;
	var i=0;
	for (i=0;i<7;i++) {
		current_row = openRow(i,cboard);
		if (current_row!=-1) {
			return_moves.push([current_row,i]);
		}
	}
	return return_moves;
}

function updateGame(row,col,player,turn_box_object) {
	board[row][col] = player;
	if (player==1) {
		player_turn = 2;
		turn_box_object.innerHTML = player2_name.concat("'s turn");
	} else {
		player_turn = 1;
		turn_box_object.innerHTML = player1_name.concat("'s turn");
	}
	num_moves++;
	checkStatus();
}

function drawCircle(c_ctx,player) {
	c_ctx.beginPath();
	c_ctx.lineWidth = 5;
	c_ctx.arc(50,50,35,0,2*Math.PI);
	c_ctx.strokeStyle = player_color[player];
	c_ctx.stroke();
	c_ctx.fillStyle = player_color[player];
	c_ctx.fill();
}

function calcAiMove(player,cboard,moves_left) {
	var possible_moves = openMoves(cboard);
	var adjusted_ply = Math.min(ply,42-num_moves);
	if (moves_left==adjusted_ply) {
		var further_moves = []
		var i=0;
		for (i=0;i<possible_moves.length;i++) {
			var move = possible_moves[i];
			var new_board = cboard.map(function(arr) {
				return arr.slice();
			});
			new_board[move[0]][move[1]] = player;
			var result = evaluateBoard(new_board);
			if (result==2) {
				return move;
			} else {
				further_moves.push([calcAiMove(1,new_board,moves_left-1),move]);
			}
		}
		if (further_moves.length==0) {
			return possible_moves[0];
		} else {
			further_moves = further_moves.sort(function(a,b) {
				return b[0]-a[0];
			});
			return further_moves[0][1];
		}
	} else if (moves_left==0) {
		return 0;
	} else {
		var i=0;
		var next_scores = []
		for (i=0;i<possible_moves.length;i++) {
			var move = possible_moves[i];
			var new_board = cboard.map(function(arr) {
				return arr.slice();
			});
			new_board[move[0]][move[1]] = player;
			var result = evaluateBoard(new_board);
			if (result==2) {
				return 100*moves_left/adjusted_ply;
			} else if (result==1) {
				return -100*moves_left/adjusted_ply;
			} else {
				var next_score = 0;
				if (player==1) {
					next_score = calcAiMove(2,new_board,moves_left-1);
				} else {
					next_score = calcAiMove(1,new_board,moves_left-1);
				}
				next_scores.push(next_score)
			}
		}
		var max_score = Math.max.apply(null,next_scores);
		var min_score = Math.min.apply(null,next_scores);
		if (player==1) {
			return min_score;
		} else {
			return max_score;
		}
	}
}

function evaluateBoard(cboard) {
	var row_check = checkRows(cboard);
	if (row_check!=0) {
		return row_check;
	}
	var col_check = checkCols(cboard);
	if (col_check!=0) {
		return col_check;
	}
	var main_diag_check = checkMainDiagonal(cboard);
	if (main_diag_check!=0) {
		return main_diag_check;
	}
	var off_diag_check = checkOffDiagonal(cboard);
	if (off_diag_check!=0) {
		return off_diag_check;
	}
	return 0;
}

function checkCols(cboard) {
	var victor = 0;
	var i=0;
	var j=0;
	for (j=0;j<3;j++) {
		for (i = 0; i < 7; i++) {
			if (cboard[j][i]==cboard[j+1][i] && cboard[j+1][i]==cboard[j+2][i] && cboard[j+2][i]==cboard[j+3][i] && cboard[j][i]!=0) {
				victor = cboard[j][i];
			}
		}
	}
	return victor;
}

function checkRows(cboard) {
	var victor = 0;
	var i=0;
	var j=0;
	for (i = 0; i < 6; i++) {
		for (j=0;j<4;j++) {
			if (cboard[i][j]==cboard[i][j+1] && cboard[i][j+1]==cboard[i][j+2] && cboard[i][j+2]==cboard[i][j+3] && cboard[i][j]!=0) {
				victor = cboard[i][j];
			}
		}
	}
	return victor;
}

function checkMainDiagonal(cboard) {
	var victor = 0;
	var i=0;
	var j=0;
	for (i=0;i<3;i++) {
		for (j=0;j<4;j++) {
			if (cboard[i][j]==cboard[i+1][j+1] && cboard[i+1][j+1]==cboard[i+2][j+2] && cboard[i+2][j+2]==cboard[i+3][j+3] && cboard[i][j]!=0) {
				victor = cboard[i][j];
			}
		}
	}
	return victor;
}

function checkOffDiagonal(cboard) {
	var victor = 0;
	var i=0;
	var j=0;
	for (i=0;i<3;i++) {
		for (j=0;j<4;j++) {
			if (cboard[i+3][j]==cboard[i+2][j+1] && cboard[i+2][j+1]==cboard[i+1][j+2] && cboard[i+1][j+2]==cboard[i][j+3] && cboard[i+3][j]!=0) {
				victor = cboard[i+3][j];
			}
		}
	}
	return victor;
}

function checkStatus() {
	// Checking for a row victor or column victor
	var victor = evaluateBoard(board);
	if (victor==0 && num_moves==42) {
		var turn_box = document.querySelector('#whosturn');
		turn_box.innerHTML = "It's a draw.";
		var replay_button = document.querySelector('.replay');
		replay_button.innerHTML = 'Play again?!';
		draws++;
		updateStats();
	} else {
		if (victor!=0) {
			var i=0;
			var j=0;
			for (i=0; i<6; i++) {
				for (j=0; j<7; j++) {
					cid = 'box'.concat(String(i),String(j))
					var canvas_object = document.getElementById(cid);
					canvas_object.style.backgroundColor = victor_color[victor];
				}
			}
			var turn_box = document.querySelector('#whosturn');
			if (victor==1) {
				player1_wins++;
				turn_box.innerHTML = player1_name.concat(' wins!');
			} else {
				player2_wins++;
				turn_box.innerHTML = player2_name.concat(' wins!');
			}
			var replay_button = document.querySelector('.replay');
			replay_button.innerHTML = 'Play again?!';
			updateStats();
		}
	}
}

function updateStats() {
	games_played++;
	game_status = 1;
	$('#stat1val').html(player1_wins);
	$('#stat2val').html(player2_wins);
	$('#statdrawsval').html(draws);
	$('#statgamesval').html(games_played);
}

function resetGame() {
	var replay_button = document.querySelector('.replay');
	replay_button.innerHTML= 'Reset';
	var i=0;
	var j=0;
	for (i=0; i<6; i++) {
		for (j=0; j<7; j++) {
			cid = 'box'.concat(String(i),String(j))
			var canvas_object = document.getElementById(cid);
			canvas_object.style.backgroundColor = 'white';
			var ctx = canvas_object.getContext('2d');
			ctx.clearRect(0,0,100,100);
			board[i][j] = 0;
		}
	}
	num_moves = 0;
	player_turn = 1;
	game_status = 0;
	var turn_box = document.querySelector('#whosturn');
	turn_box.innerHTML = player1_name.concat("'s turn");
}

document.getElementById('box00').addEventListener('click',runGame,false);
document.getElementById('box01').addEventListener('click',runGame,false);
document.getElementById('box02').addEventListener('click',runGame,false);
document.getElementById('box03').addEventListener('click',runGame,false);
document.getElementById('box04').addEventListener('click',runGame,false);
document.getElementById('box05').addEventListener('click',runGame,false);
document.getElementById('box06').addEventListener('click',runGame,false);
document.getElementById('box10').addEventListener('click',runGame,false);
document.getElementById('box11').addEventListener('click',runGame,false);
document.getElementById('box12').addEventListener('click',runGame,false);
document.getElementById('box13').addEventListener('click',runGame,false);
document.getElementById('box14').addEventListener('click',runGame,false);
document.getElementById('box15').addEventListener('click',runGame,false);
document.getElementById('box16').addEventListener('click',runGame,false);
document.getElementById('box20').addEventListener('click',runGame,false);
document.getElementById('box21').addEventListener('click',runGame,false);
document.getElementById('box22').addEventListener('click',runGame,false);
document.getElementById('box23').addEventListener('click',runGame,false);
document.getElementById('box24').addEventListener('click',runGame,false);
document.getElementById('box25').addEventListener('click',runGame,false);
document.getElementById('box26').addEventListener('click',runGame,false);
document.getElementById('box30').addEventListener('click',runGame,false);
document.getElementById('box31').addEventListener('click',runGame,false);
document.getElementById('box32').addEventListener('click',runGame,false);
document.getElementById('box33').addEventListener('click',runGame,false);
document.getElementById('box34').addEventListener('click',runGame,false);
document.getElementById('box35').addEventListener('click',runGame,false);
document.getElementById('box36').addEventListener('click',runGame,false);
document.getElementById('box40').addEventListener('click',runGame,false);
document.getElementById('box41').addEventListener('click',runGame,false);
document.getElementById('box42').addEventListener('click',runGame,false);
document.getElementById('box43').addEventListener('click',runGame,false);
document.getElementById('box44').addEventListener('click',runGame,false);
document.getElementById('box45').addEventListener('click',runGame,false);
document.getElementById('box46').addEventListener('click',runGame,false);
document.getElementById('box50').addEventListener('click',runGame,false);
document.getElementById('box51').addEventListener('click',runGame,false);
document.getElementById('box52').addEventListener('click',runGame,false);
document.getElementById('box53').addEventListener('click',runGame,false);
document.getElementById('box54').addEventListener('click',runGame,false);
document.getElementById('box55').addEventListener('click',runGame,false);
document.getElementById('box56').addEventListener('click',runGame,false);

document.getElementById('replay').addEventListener('click',resetGame,false);