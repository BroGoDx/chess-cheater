var controlpanel = '<div id="CHESS_SETTINGS">\
<h1><b>CHESS CHEATER</b> Deluxe Pro Ultimate</h1>\
<a href="#" id="CHESS_SETTINGS_START">Start Auto-Pwn</a>\
<a href="#" id="CHESS_SETTINGS_RESET">Stop and Clear</a>\
<a href="#" id="CHESS_SETTINGS_TIME">Set Time</a>\
<p>Press "Start Auto-Pwn"</p>\
</div>';
var autopwn = false;
var moved = false;

$('body').append(controlpanel);

function status(text) {
	$('#CHESS_SETTINGS p').text(text);
}

function get_letter(pos, bside) {
	var num = get_number(pos, bside) - 1;
	// from 0 to 7
	var ascii = 97 + num;
	var str = String.fromCharCode(ascii);
	return str.charAt(0);
}
function get_number(pos, bside) {
	// from 1 to 8
	return Math.floor((pos + 5) / (bside / 8)) + 1;
}
function get_number_reverse(pos, bside) {
	return 9 - get_number(pos, bside);
}

$('body').keyup(function(e){
   if(e.keyCode == 32){
       autopwn = true;
   }
});

window.setInterval(function(){
	pwn();
}, 50);

function pwn() {
	if (!autopwn) {
		return;
	}

	var username = $('#layout_top_username .chess_com_username_link').text();

	// Am I top or bottom?
	var mySide = $(".plyrb:contains('"+ username + "')").attr('id');
	var currSide = $('.timerin.active').parent().attr('id');

	if (mySide == currSide) {
		if (moved) {
			return;
		}
		// my turn
		moved = true;

		// set color
		$('#CHESS_SETTINGS').addClass('compute');
		$('#CHESS_SETTINGS').removeClass('wait');

		var topOffset = 95;
		// topOffset is the area taken by the browser toolbar etc.

		// Board positioning
		var btop = $('#chessboard_dummy').offset().top;
		var bleft = $('#chessboard_dummy').offset().left;
		var bside = $('#chessboard_dummy').width();
		$.get('http://localhost:5000/position', {boardTop: btop + topOffset,
			boardLeft: bleft,
			boardSide: bside});

		// Is it the first move?
		if ($('.notationVertical').length == 0) {
			$.get('http://localhost:5000/makemove?', function() {
				status('Made the first move');
			});
			return;
		}

		// The yellow squares
		var squares = $('div').filter(function() {
			return $(this).css('background-color') == 'rgb(255, 255, 51)';
		});
		if (squares.length != 2) {
			status('Unable to detect board diff');
			moved = false;
			return;
		}
		var num1 = get_number_reverse(parseInt($(squares[0]).css('top')), bside);
		var let1 = get_letter(parseInt($(squares[0]).css('left')), bside);
		var num2 = get_number_reverse(parseInt($(squares[1]).css('top')), bside);
		var let2 = get_letter(parseInt($(squares[1]).css('left')), bside);
		var sq1 = let1 + num1;
		var sq2 = let2 + num2;

		var finalPos = $('.notationVertical:last-of-type .mhl a').text().replace('+','');
		if (finalPos.indexOf("=") != -1) {
			finalPos = finalPos.substring(0,2) + finalPos.substring(3,4).toLowerCase();
		} else if (finalPos == "O-O" || finalPos == "O-O-O") {
			if (sq1.indexOf("e") != -1) {
				finalPos = sq2;
			} else {
				finalPos = sq1;
			}
		} else {
			finalPos=finalPos.substring(finalPos.length - 2);
		}

		var combined;
		if (sq1 == finalPos) {
			combined = sq2 + finalPos;
		} else {
			combined = sq1 + finalPos;
		}
		status('Enemy did ' + combined);
		$.get('http://localhost:5000/addmove', {move: combined}, function() {
			$.get('http://localhost:5000/makemove?', function(data) {
				status(data);
			});
		});
	} else {
		// their turn
		moved = false;
		$('#CHESS_SETTINGS').removeClass('compute');
		$('#CHESS_SETTINGS').addClass('wait');
	}

}

$("#CHESS_SETTINGS_START").click(function() {
	autopwn = true;
});

$("#CHESS_SETTINGS_RESET").click(function() {
	moved = false;
	autopwn = false;
	$('#CHESS_SETTINGS').removeClass('compute');
	$('#CHESS_SETTINGS').removeClass('wait');

	$.get('http://localhost:5000/clear?', function() {
		status('Cleared');
	});
	
});

$("#CHESS_SETTINGS_TIME").click(function() {
	var time_entered = prompt("Enter time in milli-seconds","100")
	$.get('http://localhost:5000/setspeed?', {time: time_entered}, function(data) {
		status(data);
	});
})