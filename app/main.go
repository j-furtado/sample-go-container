package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"strconv"
)

// The Board is 7*6
var MAX_X = 7
var MAX_Y = 6

/*
To avoid messing around with coordinates, it's assumed that the position 0
doesn't count, so BoardMatrix[0][Y] or BoardMatrix[X][0] shouldn't
be used.
*/
var BoardMatrix = [8][7]string{}

// Player types
var BLUEPLAYER = "blue"
var REDPLAYER = "red"

/*
* Functions
 */

func checkLeft(x int64, y int64, player string) int {
	counter := 0
	for i := int(x) - 1; i > 0; i-- {
		if BoardMatrix[i][y] == player {
			counter++
		} else {
			break
		}
	}
	return counter
}

func checkRight(x int64, y int64, player string) int {
	counter := 0
	for i := int(x) + 1; i <= MAX_X; i++ {
		if BoardMatrix[i][y] == player {
			counter++
		} else {
			break
		}
	}
	return counter
}

func checkUp(x int64, y int64, player string) int {
	counter := 0
	for i := int(y) + 1; i <= MAX_Y; i++ {
		if BoardMatrix[x][i] == player {
			counter++
		} else {
			break
		}
	}
	return counter
}

func checkDown(x int64, y int64, player string) int {
	counter := 0
	for i := int(y) - 1; i > 0; i-- {
		if BoardMatrix[x][i] == player {
			counter++
		} else {
			break
		}
	}
	return counter
}

func checkDiagLeftUp(x int64, y int64, player string) int {
	counter := 0
	for up, left := int(y)+1, int(x)-1; up <= MAX_Y && left > 0; up, left = up+1, left-1 {
		if BoardMatrix[left][up] == player {
			counter++
		} else {
			break
		}
	}
	return counter
}

func checkDiagLeftDown(x int64, y int64, player string) int {
	counter := 0
	for down, left := int(y)-1, int(x)-1; down > 0 && left > 0; down, left = down-1, left-1 {
		if BoardMatrix[left][down] == player {
			counter++
		} else {
			break
		}
	}
	return counter
}

func checkDiagRightUp(x int64, y int64, player string) int {
	counter := 0
	for up, right := int(y)+1, int(x)+1; up <= MAX_Y && right <= MAX_X; up, right = up+1, right+1 {
		if BoardMatrix[right][up] == player {
			counter++
		} else {
			break
		}
	}
	return counter
}

func checkDiagRightDown(x int64, y int64, player string) int {
	counter := 0
	for down, right := int(y)-1, int(x)+1; down > 0 && right <= MAX_X; down, right = down-1, right+1 {
		if BoardMatrix[right][down] == player {
			counter++
		} else {
			break
		}
	}
	return counter
}

func checkForWin(x int64, y int64, player string) bool {
	if BoardMatrix[x][y] == "" {
		if player == BLUEPLAYER {
			BoardMatrix[x][y] = BLUEPLAYER
		} else {
			BoardMatrix[x][y] = REDPLAYER
		}
	}

	log.Printf("Check For Win\nBoardMatrx[%d][%d]: %s", x, y, BoardMatrix[x][y])

	left := checkLeft(x, y, player)
	right := checkRight(x, y, player)
	totalHor := left + right + 1
	log.Printf("Check For Win\nVHorizontal: %d", totalHor)

	up := checkUp(x, y, player)
	down := checkDown(x, y, player)
	totalVer := up + down + 1
	log.Printf("Check For Win\nVertical: %d", totalVer)

	diagLeftUp := checkDiagLeftUp(x, y, player)
	diagRightDown := checkDiagRightDown(x, y, player)
	totalDiagLeft := diagLeftUp + diagRightDown + 1
	log.Printf("Check For Win\nDiagonal Left: %d", totalDiagLeft)

	diagRightUp := checkDiagRightUp(x, y, player)
	diagLeftDown := checkDiagLeftDown(x, y, player)
	totalDiagRight := diagRightUp + diagLeftDown + 1
	log.Printf("Check For Win\nDiagonal Right: %d", totalDiagRight)

	return (totalHor == 4 || totalVer == 4 || totalDiagLeft == 4 || totalDiagRight == 4)
}

func click_cell(w http.ResponseWriter, req *http.Request) {
	req.ParseForm()
	posX, err := strconv.ParseInt(req.Form.Get("posX"), 10, 64)
	posY, err := strconv.ParseInt(req.Form.Get("posY"), 10, 64)
	currentPlayer := req.Form.Get("player")

	log.Printf("Click Cell:\nX = %d\nY = %d\nCurrent Player = %s", posX, posY, currentPlayer)

	if err != nil {
		log.Printf("Error: %s", err)
		os.Exit(2)
	}
	win := checkForWin(posX, posY, currentPlayer)
	if win {
		log.Printf("%s is the winner", currentPlayer)
		fmt.Fprintln(w, "win")
	} else {
		log.Printf("No win")
	}
}

func reset(w http.ResponseWriter, req *http.Request) {
	BoardMatrix = [8][7]string{}
	log.Printf("Resetting the game board.")
}

func index(w http.ResponseWriter, req *http.Request) {
	t, _ := template.ParseFiles("Templates/index.html")
	t.Execute(w, "")
}

func main() {
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/", index)
	http.HandleFunc("/clickCell", click_cell)
	http.HandleFunc("/reset", reset)
	port := ":8080"
	http.ListenAndServe(port, nil)
	log.Println("Listening on port ", port)
}
