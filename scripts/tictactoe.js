var player_turn = 1;
var num_moves = 0;
var board = [[0,0,0],[0,0,0],[0,0,0]];
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
		player2_name = 'The evil AI';
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
	var canvas_object = document.getElementById(this.id);
	var ctx = canvas_object.getContext('2d');
	var row = Number(this.id.charAt(3));
	var col = Number(this.id.charAt(4));
	if (game_status==0) {
		if (board[row][col]==0) {
			if (player_turn==1) {
				drawX(ctx);
				updateGame(row,col,1,turn_box);
				if (game_status==0) {
					if ($('#PvE').hasClass('selected')) {
						var moves_to_play = Math.min(ply,9-num_moves);
						var AI_move = calcAiMove(2,board,moves_to_play);
						var box_id = 'box'.concat(String(AI_move[0]),
							String(AI_move[1]));
						var ai_canvas_object = document.getElementById(box_id);
						var ai_ctx = ai_canvas_object.getContext('2d');
						drawO(ai_ctx);
						updateGame(AI_move[0],AI_move[1],2,turn_box);
					}
				}
			} else {
				drawO(ctx);
				updateGame(row,col,2,turn_box);
			}
		}
	}
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

function drawX(c_ctx) {
	c_ctx.beginPath()
	c_ctx.lineWidth = 5;
	c_ctx.moveTo(15,15);
	c_ctx.lineTo(85,85);
	c_ctx.stroke();
	c_ctx.moveTo(15,85);
	c_ctx.lineTo(85,15);
	c_ctx.stroke();
}

function drawO(c_ctx) {
	c_ctx.beginPath();
	c_ctx.lineWidth = 5;
	c_ctx.arc(50,50,35,0,2*Math.PI);
	c_ctx.stroke();
}

function calcAiMove(player,cboard,moves_left) {
	var possible_moves = openMoves(cboard);
	var adjusted_ply = Math.min(ply,9-num_moves);
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
				var next_score = calcAiMove(1,new_board,moves_left-1);
				if (next_score!=-100) {
					further_moves.push([next_score,move]);
				}
			}
		}
		if (further_moves.length==0) {
			return possible_moves[0];
		} else {
			further_moves = further_moves.sort(function(a,b) {
				return b[0]-a[0];
			});
			console.log(further_moves)
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
		var min_next = Math.min.apply(null,next_scores);
		var max_next = Math.max.apply(null,next_scores);
		if (max_next>(-1*min_next)) {
			return max_next;
		} else {
			return min_next;
		}
	}
}

function openMoves(cboard) {
	var return_moves = [];
	var i=0;
	var j=0;
	for (i=0;i<3;i++) {
		for (j=0;j<3;j++) {
			if (cboard[i][j]==0) {
				return_moves.push([i,j]);
			}
		}
	}
	return return_moves;
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
	for (i = 0; i < 3; i++) {
		if (cboard[0][i]==cboard[1][i] && cboard[1][i]==cboard[2][i] && cboard[0][i]!=0) {
			victor = cboard[0][i];
		}
	}
	return victor;
}

function checkRows(cboard) {
	var victor = 0;
	var i=0;
	for (i = 0; i < 3; i++) {
		if (cboard[i][0]==cboard[i][1] && cboard[i][1]==cboard[i][2] && cboard[i][0]!=0) {
			victor = cboard[i][0];
		}
	}
	return victor;
}

function checkMainDiagonal(cboard) {
	var victor = 0;
	if (cboard[0][0]==cboard[1][1] && cboard[1][1]==cboard[2][2] && cboard[0][0]!=0) {
		victor = cboard[0][0];
	}
	return victor;
}

function checkOffDiagonal(cboard) {
	var victor = 0;
	if (cboard[2][0]==cboard[1][1] && cboard[1][1]==cboard[0][2] && cboard[2][0]!=0) {
		victor = cboard[2][0];
	}
	return victor;
}

function checkStatus() {
	// Checking for a row victor or column victor
	var victor = 0;
	var i=0;
	for (i = 0; i < 3; i++) {
		if (board[i][0]==board[i][1] && board[i][1]==board[i][2] && board[i][0]!=0) {
			victor = board[i][0];
			var j=0;
			for (j = 0; j < 3; j++) {
				var canvas_object = document.querySelector('#box'.concat(String(i),String(j)));
				canvas_object.style.backgroundColor = 'rgba(0,255,0,0.5)';
			}
		}
		if (board[0][i]==board[1][i] && board[1][i]==board[2][i] && board[0][i]!=0) {
			victor = board[0][i];
			var j=0;
			for (j = 0; j < 3; j++) {
				var canvas_object = document.querySelector('#box'.concat(String(j),String(i)));
				canvas_object.style.backgroundColor = 'rgba(0,255,0,0.5)';
			}
		}
	}
	// Checking for diagonal victor
	if (board[0][0]==board[1][1] && board[1][1]==board[2][2] && board[0][0]!=0) {
		victor = board[0][0];
		var j=0;
		for (j = 0; j < 3; j++) {
			var canvas_object = document.querySelector('#box'.concat(String(j),String(j)));
			canvas_object.style.backgroundColor = 'rgba(0,255,0,0.5)';
		}
	}
	if (board[2][0]==board[1][1] && board[1][1]==board[0][2] && board[2][0]!=0) {
		victor = board[2][0];
		var j=0;
		for (j = 0; j < 3; j++) {
			var canvas_object = document.querySelector('#box'.concat(String(2-j),String(j)));
			canvas_object.style.backgroundColor = 'rgba(0,255,0,0.5)';
		}
	}
	if (victor==0 && num_moves==9) {
		var turn_box = document.querySelector('#whosturn');
		turn_box.innerHTML = "It's a draw.";
		var replay_button = document.querySelector('.replay');
		replay_button.innerHTML = 'Play again?!';
		draws++;
		updateStats();
	} else {
		if (victor!=0) {
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
	for (i=0; i<3; i++) {
		for (j=0; j<3; j++) {
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
document.getElementById('box10').addEventListener('click',runGame,false);
document.getElementById('box11').addEventListener('click',runGame,false);
document.getElementById('box12').addEventListener('click',runGame,false);
document.getElementById('box20').addEventListener('click',runGame,false);
document.getElementById('box21').addEventListener('click',runGame,false);
document.getElementById('box22').addEventListener('click',runGame,false);

document.getElementById('replay').addEventListener('click',resetGame,false);