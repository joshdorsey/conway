function setCookie(name, value, days){
  if(days){
    var date = new Date();
    date.setTime(date.getTime()+days*24*60*60*1000);
    var expires = "; expires=" + date.toGMTString();
  } else var expires = "";
  document.cookie = name+"=" + value+expires + ";path=/";
}

function getCookie(cname){
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++){
        var c = ca[i];
        while(c.charAt(0)==' ') c = c.substring(1);
        if(c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

function fallsIn(min, max, val){
    if(val < min || val > max) return false;
    return true;
}

function Grid(_w, _h){
    this.w = _w;
    this.h = _h;
    this.s = new Array(_h);
    for(var i = 0; i < _h; i++){
        this.s[i] = new Array(_w);
        for(var j = 0; j < _w; j++){
            this.s[i][j] = false;
        }
    }
    
    this.initialize = function(el){
        for(var i = 0; i < this.h; i++){
            for(var j = 0; j < this.w; j++){
                var div = document.createElement("div");
                div.id = "cell";
                if(this.s[i][j]) div.className = "true" + " " + i + "d" + j;
                else div.className = "false" + " " + i + "d" + j;
                div.setAttribute("onclick", "clicked(" + i + ", " + j + ");");
                el.appendChild(div);
            }
            el.appendChild(document.createElement("br"));
            el.appendChild(document.createElement("br"));
        }
    }

    this.loadState = function(s){
        for(var i = 0; i < this.h; i++){
            for(var j = 0; j < this.w; j++){
                this.s[i][j] = s[i][j];
            }
        }
        this.update();
    }    
    
    this.getNeighbors = function(l, x, y){
        var n = 0;
        for(var j = -1; j < 2; j++){
            for(var i = -1; i < 2; i++){
                if(fallsIn(0, this.h-1, x+j) && fallsIn(0, this.w-1, y+i) && !(i == 0 && j == 0)){
                    if(l[x+j][y+i]) n++;
                }
            }
        }
        return n;
    }
    
    this.update = function(){
        for(var i = 0; i < this.h; i++){
            for(var j = 0; j < this.w; j++){
                if(this.s[i][j]){
                    $("." + i + "d" + j).removeClass("false");
                    $("." + i + "d" + j).addClass("true");
                } else {
                    $("." + i + "d" + j).removeClass("true");
                    $("." + i + "d" + j).addClass("false");
                }
            }
        }
    }
    
    this.advance = function(){
        var sTime = performance.now();
        var tState = new Array(this.h);
        for(var i = 0; i < this.h; i++){
            tState[i] = new Array(this.w);
            for(var j = 0; j < this.w; j++){
                tState[i][j] = this.s[i][j];
            }
        }
        //this.clear();
        for(var i = 0; i < this.h; i++){
            for(var j = 0; j < this.w; j++){
                if(tState[i][j]){
                    if(this.getNeighbors(tState, i, j) < 2){
                        this.s[i][j] = false;
                        //console.log("Cell " + i + " " + j + " died of starvation.");
                    } else if(this.getNeighbors(tState, i, j) > 3){
                        this.s[i][j] = false;
                        //console.log("Cell " + i + " " + j + " died of overpopulation.");
                    }
                } else {
                    if(this.getNeighbors(tState, i, j) == 3){
                        this.s[i][j] = true;
                        //console.log("Cell " + i + " " + j + " sprung to life.");
                    }
                }
            }
        }
        this.update();
        var eTime = performance.now();
        console.log("Update took " + (eTime-sTime).toFixed(2) + " milliseconds on " + (this.w*this.h) + " cells.");
    }

    this.clear = function(){
        for(var i = 0; i < this.h; i++){
            for(var j = 0; j < this.w; j++){
                this.s[i][j] = false;
            }
        }
        this.update();
    }

    this.randomStart = function(p){
        this.clear();
        for(var i = 0; i < this.h; i++){
            for(var j = 0; j < this.w; j++){
                if(Math.random() > 1-p) this.s[i][j] = true;
            }
        }
        this.update();
    }
}

function clicked(x, y){
    if(grid.s[x][y]){
        $("." + x + "d" + y).toggleClass("true");
        $("." + x + "d" + y).toggleClass("false");
        grid.s[x][y] = false;
    }
    else if(!grid.s[x][y]){
        $("." + x + "d" + y).toggleClass("true");
        $("." + x + "d" + y).toggleClass("false");
        grid.s[x][y] = true;
    }
    setCookie("state", encodeURI(JSON.stringify(grid.s, null, 4)), 10);
}

var grid = new Grid(50, 30);
grid.initialize(document.getElementById("container"));

if(getCookie("state") != ""){
    console.log("Found stored state");
    grid.loadState(JSON.parse(decodeURI(getCookie("state"))));
}

var loopId = -1;
var rsPercent = 0.2;
var speed = 50;

// 21.1px per
//$("#container").width(22.3*grid.w+"px");
document.getElementById("stopButton").disabled = true;

window.addEventListener("keydown", function(e){
    if(e.keyCode == "32"){
        if(loopId == -1) play();
        else stop();
    } else if(e.keyCode == "65"){
        grid.advance();
    } else if(e.keyCode == "67"){
        grid.clear();
    } else if(e.keyCode == "82"){
        grid.randomStart(rsPercent);
    }
}, false);

function play(){
    if(loopId == -1){
        document.getElementById("playButton").disabled = true;
        document.getElementById("stopButton").disabled = false;
        loopId = setInterval(function(){grid.advance()}, speed);
    }
}

function stop(){
    clearInterval(loopId);
    document.getElementById("playButton").disabled = false;
    document.getElementById("stopButton").disabled = true;
    loopId=-1;
}

function setSpeed(s){
    speed = s;
    if(loopId != -1){
        clearInterval(loopId);
        setInterval(function(){grid.advance()}, speed);
    }
}
