var currentPlayer = "red";
var gameEnd = false;
// size of the board is 7*6
var MAX_X = 7;
var MAX_Y = 6;

// Syncs the game board status of the server with the page
// Allows for page refreshes
$( document ).ready(function() {
  $("#player").text("Now playing: " + currentPlayer.toUpperCase());
  $.ajax({
    async: true,
    url: "resync",
    crossDomain: false,
    contentType: 'application/octet-stream; charset=utf-8',
    method: "GET",
    success: function(response){
      var boardStatus = JSON.parse(response);
      if(boardStatus.LastPlayer != null && boardStatus.LastPlayer != "" ) {
        currentPlayer = ((boardStatus.LastPlayer == "red") ? "blue" : "red");
        $("#player").text("Now playing: " + currentPlayer.toUpperCase());
      }
      if (boardStatus.Ended != null) {
        gameEnd = boardStatus.Ended;
      }
      fillBoard(boardStatus.Board);
    },
    error: function(xhr) {
      console.log("Error communicating with the server. Please try again.");
    }
  });
});

function clickCell(posX, posY, id) {
  console.log("Game has ended: %s", gameEnd)
  if ( !gameEnd ){
    if ( !noEmptyCellBelow(posX, posY) ) {
      var coords = calcValidPosition(posX,posY);
      posX = coords[0];
      posY = coords[1];
      id = posX + "_" + posY;
    }

    if( !checkIfCellWasClicked(id) ) {
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
          $("#player").text("Now playing: " + currentPlayer.toUpperCase());
          if(response != ""){
            $("#history tr:last").after('<tr><td>The game has ended. ' + player.toUpperCase() + ' is the winner.</td></tr>');
            gameEnd = true;
            console.log("The game has ended. %s is the winner.", player);
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

function calcValidPosition(posX, posY){
  for( var y = posY; y > 0; y--) {
    if( checkIfCellWasClicked(posX + "_" + y) ){
      return new Array(posX, y+1);
    }
  }
  return new Array(posX, 1); // if it can't find any position, return the lowest position on the board
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
  var cellColor = currentPlayer;
  var id = "#" + cellId;
  colorCellWithColor(id, cellColor);
  if( currentPlayer == "red") {
    currentPlayer = "blue";
  } else {
    currentPlayer = "red";
  }
  return cellColor;
}

function colorCellWithColor(cellID, color){
  $(cellID).addClass(color);
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

function fillBoard(board) {
  for (var x = 1; x <= MAX_X; x++) {
    for (var y = 1; y <= MAX_Y; y++) {
      var id = "#" + x + "_" + y;
      if(board[x][y] != null && board[x][y] != ""){
          colorCellWithColor(id, board[x][y].trim());
          console.log("Filling cell: %s with color %s", id, board[x][y].trim());
      }
    }
  }
}
