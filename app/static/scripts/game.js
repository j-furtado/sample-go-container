var currentPlayer = "red";
var gameEnd = false;
// size of the board is 7*6
var MAX_X = 7;
var MAX_Y = 6;

function clickCell(posX, posY, id) {
  console.log("Game has ended: " + gameEnd)
  if ( !gameEnd ){
    console.log("Cell("+ posX + "," + posY + ") was clicked: " + checkIfCellWasClicked(id));
    if( !checkIfCellWasClicked(id) && noEmptyCellBelow(posX, posY)) {
      $("#history tr:last").after('<tr><td>' + currentPlayer.toUpperCase() + ' plays: <strong>[' + posX + ',' + posY + ']</strong></td></tr>');
      $("#history").scrollTop($("#history")[0].scrollHeight);
      $.ajax({
        async: true,
        url: "clickCell",
        contentType: "application/x-www-form-urlencoded",
        data: {
          "posX": posX,
          "posY": posY,
          "player": currentPlayer
        },
        crossDomain: false,
        method: "POST",
        success: function(response){
          player = currentPlayer;
          colorCell(id);
          if(response != ""){
            $("#history tr:last").after('<tr><td>The game has ended. ' + player.toUpperCase() + ' is the winner.</td></tr>');
            gameEnd = true;
            console.log("The game has ended. " + player + " is the winner.");
          }
        },
        error: function(xhr) {
          console.log("Error communicating with the server. Please try again.");
        }
      });
    }
  } else {
    resetGame();
  }
  $("#play_desc").animate({scrollTop:$("#play_desc")[0].scrollHeight}, 1000);
}


function resetGame(){
  $.ajax({
    async: true,
    url: "reset",
    crossDomain: false,
    method: "GET",
    success: function(response){
      gameEnd = false;
      resettingBoard();
      $("#history tr:last").after('<tr><td> The game was resetted! A new game begins.</td></tr>');
    },
    error: function(xhr) {
      console.log("Error communicating with the server. Please try again.");
    }
  });
  $("#play_desc").animate({scrollTop:$("#play_desc")[0].scrollHeight}, 1000);
}

// Check if the current cell already has a chip
function checkIfCellWasClicked(cellId){
  var id = "#" + cellId;
  return ( $(id).hasClass("red") || $(id).hasClass("blue"));
}

// Check if the cell below has a chip
function noEmptyCellBelow(posX, posY){
  if ( posY > 1 ){
    return checkIfCellWasClicked(posX + "_" + (posY-1));
  }
  return true;
}

function colorCell(cellId){
  var cellColor;
  var id = "#" + cellId;
  if( currentPlayer == "red") {
    $(id).removeClass("blue"); // just to make sure
    $(id).addClass("red");
    currentPlayer = "blue";
    cellColor = "red";
  } else {
    $(id).removeClass("red"); // just to make sure
    $(id).addClass("blue");
    currentPlayer = "red";
    cellColor = "blue";
  }
  return cellColor;
}

function resettingBoard(){
  console.log("Resetting the game board.");
  for( var x = 1; x <= MAX_X; x++) {
    for (var y = 1; y <= MAX_Y; y++) {
      var id = "#" + x + "_" + y;
      $(id).removeClass("red");
      $(id).removeClass("blue");

    }
  }
}
