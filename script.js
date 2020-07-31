//<!DOCTYPE javascript>
//----------global vars--------

//canvas properties
var c;
var ctx;

//Grid properties
var gridHeight;
var gridWidth;
var sideLen;
var grid;
var minSquares =250**2;
var maxSquares = 250**2;


//maze properties
const directions = [[1,0],[-1,0],[0,1],[0,-1]];
var startNode;
var endNode;


//movement properties
//e.g for penalisting either moving upwards or diagonally
var diagCost = 14;
var yCost = 1;
var xCost = 1;
var acceptDiag = false;


//colouring
var colouring = true;
var pathColour = "yellow"
var openSetColour = "green"
var closedSetColour = "red";
var startColour = "aqua";
var endColour = "blue"
var waitTime = 100;
var prevSquare = [];
var leftId;
var rightId;
var endNodeSelected = false;
var startNodeSelected = false;


var cursorX;
var cursorY;
//debug
var counter = 0;
 
//----------main code---------------

function main() { // runs on webpage fully loaded
    //canvas prep
    c = document.getElementById("main");
    ctx = c.getContext("2d");
    c.width = document.body.clientWidth/1.1;
    c.height = Math.floor(document.body.clientWidth/2.5);
    //
    console.log(c.width,c.height);
    document.getElementById("waitTimeSlider").oninput = function() {
        waitTime = this.value;
    }

    //Event listeners
    c.addEventListener('mousedown', mousedown, true);
    c.addEventListener('mouseup', mouseup, true);
    c.addEventListener('mousemove', mousemove, true);


    //Create grid

    sideLen = calcSquareSize(minSquares,maxSquares);

    grid = createGrid(gridWidth,gridHeight);
    drawGrid();
    
    findStartNode();
    findEndNode();
}


function mousedown(e){
    let x = Math.floor( (e.pageX -c.getBoundingClientRect().left)/sideLen);
    let y = Math.floor((e.pageY-c.getBoundingClientRect().top)/sideLen);
     if(e.button ==0 && leftId == null){
         leftId = setInterval(whileLeftClickDown,25);
         if(grid[x][y] == endNode){
             endNodeSelected = true;
         }
          if(grid[x][y] == startNode){
             startNodeSelected = true;
         }
     }else if(e.button ==2 && rightId == null){
         rightId = setInterval(whileRightClickDown,25);
     }

 }


function mouseup(e){
    if(e.button ==0 ){
       clearInterval(leftId);
        endNodeSelected = false;
        startNodeSelected = false;
        leftId =  null;
     }
    if(e.button ==2 ){
       clearInterval(rightId);
        rightId = null;
     }

}

function mousemove(e){
    cursorX = e.pageX -c.getBoundingClientRect().left;
    cursorY= e.pageY-c.getBoundingClientRect().top;
    
}

function whileLeftClickDown(){

    
    let x = Math.floor(cursorX/sideLen);
    let y = Math.floor(cursorY/sideLen);
    if(cursorX>=0 && cursorY>=0 && x<=gridWidth && y<gridHeight){
        x = Math.floor(cursorX/sideLen);
        y = Math.floor(cursorY/sideLen);
        console.log(( "pageX: " + x +",pageY: " + y ));
        
        if(grid[x][y].walkable == 1 && endNodeSelected == false && startNodeSelected==false && grid[x][y] != startNode && grid[x][y] != endNode ){
            grid[x][y].walkable =0;
            
            colourNode(grid[x][y],"black")
        }else if(grid[x][y].walkable == 1 && endNodeSelected == true && grid[x][y] != startNode){
            colourNode(endNode,"white")
            endNode = grid[x][y];
            colourNode(endNode,endColour);
        }else if(grid[x][y].walkable == 1 && startNodeSelected == true && grid[x][y] != endNode){
            colourNode(startNode,"white")
            startNode = grid[x][y];
            colourNode(startNode,startColour);
        }
    }    
}

function whileRightClickDown(){
    let x = Math.floor(cursorX/sideLen);
    let y = Math.floor(cursorY/sideLen);
    if(cursorX>=0 && cursorY>=0 && x<=gridWidth && y<gridHeight){
        x = Math.floor(cursorX/sideLen);
        y = Math.floor(cursorY/sideLen);
        console.log(( "pageX: " + x +",pageY: " + y ));
        
        if(grid[x][y].walkable == 0 && endNodeSelected == false && startNodeSelected==false && grid[x][y] != startNode && grid[x][y] != endNode ){
            grid[x][y].walkable =1;
            
            colourNode(grid[x][y],"white")
        }
    }
}
/*

//OLD MOUSE DOWN CODE

function onClick(e){

    cursorX = e.pageX -c.getBoundingClientRect().left;
    cursorY= e.pageY-c.getBoundingClientRect().top;
    console.log(( "pageX: " + cursorX +",pageY: " + cursorY ));
    x = Math.floor(cursorX/sideLen);
    y = Math.floor(cursorY/sideLen);
    if(cursorX>=0 && cursorY>=0 && x<=gridWidth && y<gridHeight){
        x = Math.floor(cursorX/sideLen);
        y = Math.floor(cursorY/sideLen);
        console.log(( "pageX: " + x +",pageY: " + y ));
        if(grid[x][y].walkable == 1 ){
            grid[x][y].walkable =0;
            
            colourNode(grid[x][y],"black")
        }else {
            grid[x][y].walkable =1;
            colourNode(grid[x][y],"white")
        }
    }    
}
*/




function createGrid(x,y,walkState) {
    var arr = [];
    var temp = [];
    console.log(arr); 
    for ( let i =0; i<x; i++) {
        var temp = [];
        for ( let j =0; j<x; j++) {
            temp.push(new node(i,j,walkState)); // initialised at 0 meaning square that can be crossed 
        }
        arr.push(temp);
    }
    console.log(arr); 
    return arr;  
}
function calcSquareSize(min,max) { 
    // side lengths dont have to be integers but we need it to divide both the width and height EXACTLY
    //so we can divide the gcd
    var w = c.width;
    var h = c.height;
    var k = gcd(w,h);
    if((w/k)*(h/k) < min){
        console.log(k/Math.sqrt((w/k)*(h/k) / min));
        
      k = k*(Math.sqrt((w/k)*(h/k) / min)); 
    }
    if((w/k)*(h/k) > max){
        k = k*(Math.sqrt((w/k)*(h/k) / max)); 
    }
    console.log(k)
    gridHeight=Math.floor(h/k);
    gridWidth=Math.floor(w/k);
    console.log(gridWidth,gridHeight,gridWidth*gridHeight)
    return k;
    
}
function nodeFromInt(n) {
    return [Math.floor(n / gridWidth ),n%gridHeight]
    
    
    
}
function colourNode(node,colour){
    let temp = ctx.fillStyle;
    ctx.fillStyle = colour
    ctx.fillRect((node.x*sideLen)+1,(node.y*sideLen)+1,sideLen-1,sideLen-1);
    ctx.fillStyle = temp;
}

function drawGrid(){
    drawBlankGrid(sideLen);
    for(let x=0;x<gridWidth;x++){
        for(let y=0;y<gridHeight;y++){
            if(grid[x][y].walkable == 0 ){
                colourNode(grid[x][y],"black")
                }
            else if(grid[x][y] == startNode){
                    colourNode(grid[x][y],startColour);
                }
            else if(grid[x][y] == endNode){
                    colourNode(grid[x][y],endColour);
            
            
            }
        }
    }
    
    
}

function drawBlankGrid(k)  {
    //draws grid using the square size given
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,c.width,c.height);
    ctx.closePath();
    ctx.fillStyle = "black";
    for(let i = 0;i<=gridWidth;i++){
        ctx.fillRect(i*k,0,1,gridHeight*k)
    }
    for(let j = 0;j<=gridHeight+1;j++){
        
        ctx.fillRect(0,j*k,gridWidth*k,1)
        
    }
}

//need gcd to get square size
//recursive implementattion of binary GCD algorithmn
//https://en.wikipedia.org/wiki/Binary_GCD_algorithm
function gcd(x,y) {
    if(x==y){
        return x;
    }
    if(x==0) {
        return y;
    }
    if(y==0) {
        return x;
    }
    //next part works using bitwise operators
    //checking if u is even
    if(~x & 1) { // ~x inverts bits of x and &= and so if the first bit is 1 ==1 (the AND operators just checks they are the same)
        if (y & 1) {// y is odd so we can remove a factor of 2 from x but not y since the 2 is not needed
            return gcd(x >> 1, y);
        }else{ // when they are both even we can remove a factor of 2 since we have already checked that they are not the same since 2 is the smallest prime we can factor it out by shifting all the bits to the left
            return gcd(x >> 1, y >> 1) << 1; // we remove the factor of 2 from it so it uses smaller numbers. then at the end we factor it back in
        }
    }
    if (~y & 1){ // y is odd, x is even so we take out the factor of 2 from v
        return gcd(x, y >> 1);
    }
    if (x > y){
        return gcd((x - y) >> 1, y); // basically x-y is even and y is odd since we have checked the other cases so they are both odd and odd - odd = even. so we then remove the factor of 2 and pass it back to algoritmn 
    }
    return gcd((y - x) >> 1, x);// last case y is bigger than x and they are both odd see ^^^
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffleArray(arr){
    tA = [];
    tA =tA.concat(arr);
    //console.log(tA);
    for(let i = (tA.length - 1); i > 0; i-=1){
        const j = Math.floor(Math.random() * i)
        const temp = tA[i]
        tA[i] = tA[j]
        tA[j] = temp
        
}

return tA
    
}



// Usage!

class node {
    constructor(x, y,walkable=1) {
        this.x = x;
        this.y = y;
        this.walkable = walkable;
        this.hcost = 0;
        this.gcost = 0;
        this.parent;
        this.heapIndex; //idk how you do interfaces in js
   }
     getFcost(){
        return this.gcost+this.hcost; // the overall cost of a node
    }
    compareTo(n){
       // console.log(n)
        let val = -this.getFcost()+n.getFcost();
        if(val == 0){
            return -this.hcost+n.hcost;
        }else{
            return val;    
        }
        
        
    }
}



//https://blog.bitsrc.io/implementing-heaps-in-javascript-c3fbf1cb2e65 << good explanation on heaps
//https://www.youtube.com/watch?v=3Dw5d7PlcTM << tutorial related to a* also works for djikstra
// not generic version because js dumb
class heap{
    
    constructor(maxSize){
        this.items = new Array(maxSize);
        this.currentItemCount = 0;
        
    }
    
    addItem(item){
        //console.log(item)
        item.heapIndex = this.currentItemCount;
        this.items[this.currentItemCount] = item;
        this.sortUp(item);
        this.currentItemCount++;
    }
    
    sortUp(item){
        //console.log(item,"sortup")
        let parentIndex = Math.floor((item.heapIndex-1)/2);
        if(item.heapIndex ==0){
            return;
        }
        
        while(true){ // basically visit all the parents till it is in the right place and we can exit the loop
            let parentItem = this.items[parentIndex];
            if(item.compareTo(parentItem) >0){
                this.swap(item,parentItem)
            }
            else{ //sort complete the heap is now sorted again
                break;
            }
            parentIndex = Math.floor((item.heapIndex-1)/2);
            if(parentIndex<=0){
                return;
            }
            
        }
    }
    
    sortDown(item){
        while(true){ // keep looping till done
            let leftChildIndex = (item.heapIndex*2)+1;
            let rightChildIndex = (item.heapIndex*2)+2;
            let swapIndex = 0;
                
            //swaping with the children
            if(leftChildIndex < this.currentItemCount){ // so child exists and we are not at the bottom of the tree yet
                swapIndex = leftChildIndex;
                if(rightChildIndex < this.currentItemCount){//check the right child exists
                    //now we check priority of children so which has a lower value
                    if(this.items[leftChildIndex].compareTo(this.items[rightChildIndex]) < 0){ // child on right has higher priority so we swap that one 
                        swapIndex = rightChildIndex;
                        
                    }
                    
                }
                 //check if it needs to be swapped based on priority
                if(item.compareTo(this.items[swapIndex]) <0){ // this means the parent is lower priority (so in this case it has a higher fcost so it goes further down the tree)
                    this.swap(item,this.items[swapIndex]);
                }else{
                    return;
                }
                
            }else{ // parent has no children so no need to do anything
                return;
            }
           
        
        }
    }
    
    contains(item){
        
        return (this.items[item.heapIndex] === item)
    }
    
    getCount(){
        return currentItemCount;
    }
    
    updateItem(item){
        this.sortUp(item);
        //this.sortDown(item); // not necesserayy
        
        
    }
    
    removeFirstItem(){
        let firstItem = this.items[0];
        this.currentItemCount--;
        this.items[0] = this.items[this.currentItemCount]
        this.items[0].heapIndex = 0;
        this.sortDown(this.items[0])
        return firstItem;
    }
    
    swap(itemA,itemB){
        this.items[itemA.heapIndex] = itemB;
        this.items[itemB.heapIndex] = itemA;
        //swap heap indexes
        let temp = itemA.heapIndex;
        itemA.heapIndex = itemB.heapIndex;
        itemB.heapIndex =  temp;
        
    }

}


function getNeighbours(node){
    let neighbours = [];
    if(acceptDiag){
        for (let  x = -1; x<=1;x++){
            for (let y = -1; y<=1;y++){
                if(x ==0 && y==0) { // dont add the node itself to the list of neighbours
                    continue 
                }

                let newX = x+node.x;
                let newY = y+node.y;
                if(newX>=0 && newX< gridWidth && newY>=0 && newY< gridHeight){

                    neighbours.push(grid[newX][newY]);

                }

            }

        }
    }else{// no diagonals
        for (let  x = -1; x<=1;x++){
            for (let y = -1; y<=1;y++){
                if((Math.abs(x)+Math.abs(y)!=1)) { // dont add the node itself to the list of neighbours
                    continue 
                }

                let newX = x+node.x;
                let newY = y+node.y;
                if(newX>=0 && newX< gridWidth && newY>=0 && newY< gridHeight){

                    neighbours.push(grid[newX][newY]);

                }

            }

        }
        
        
        
    }
    //return the neighbours
    return neighbours;
    
    
}

function getDistance(node1,node2){
    //so 3 possibilities
    //go diagonally and then move on x
    //go diagonally and then move on the y
    //or go along x and then along y
    let xD = Math.abs((node2.x-node1.x));
    let yD = Math.abs((node2.y-node1.y));
    
    return Math.min(Math.abs(xD*xCost) + Math.abs((yD)*yCost), Math.abs(diagCost*(xD))+ (Math.abs(yD-xD)*Math.abs(yCost)),Math.abs(diagCost*(yD))+ (Math.abs(xD-yD)*Math.abs(xCost)))
    
}

function retracePath(startNode,endNode){
    path = [];
    currentNode = endNode; //we work in reverse since its through parents
    while(currentNode !=startNode){
        path.push(currentNode);
        if(currentNode != startNode && currentNode != endNode){
            colourNode(currentNode,pathColour);

        }
        
        currentNode = currentNode.parent;
        
    }
    
    path.reverse();
    return path;
    
    
}

//https://www.youtube.com/watch?v=mZfyt03LDH4&t=365s

async function aStar(startPos,endPos){
    //open set of nodes
    var openSet = new heap(gridWidth*gridHeight);
    var closedSet = [];
    openSet.addItem(startPos);
    //find node with lowest f cost
    
    while(openSet.currentItemCount > 0){
        currentNode = openSet.removeFirstItem();
        //NO LONGER NECESSARY WITH THE HEAP
        /*
        for(let i =0; i<openSet.length;i++){
            if(openSet[i].getFcost() < currentNode.getFcost() || (openSet[i].getFcost() == currentNode.getFcost() && openSet[i].hcost < currentNode.hcost) )
            currentNode = openSet[i]; //this means the node we are checking has either a lower fcost (total distance to the target and distance from start and ) or the lowest distance from the 
        }
    
        //now we have the node we move it to the closed set
        let i = openSet.indexOf(currentNode);
        openSet.splice(i,1); */
        
        
        
        closedSet.push(currentNode);
        if(currentNode != startNode && currentNode != endNode){
        colourNode(currentNode,closedSetColour);
        }
        
        await sleep(waitTime);
        //checking if we are at the end
        if(currentNode == endPos){
            console.log("epic");
            return retracePath(startPos,endPos);
            
        
        }
        //now we check the neighbouring nodes and remove the repeats
        let n = getNeighbours(currentNode);
        for(let i =0;i<n.length;i++){
            //removing repeats or closed nodes
            if(closedSet.includes(n[i]) || n[i].walkable ==0){
                continue;
            }
            var newMoveCostToNeighbour = currentNode.gcost + getDistance(currentNode,n[i]);
            if(newMoveCostToNeighbour < n[i].gcost || ! openSet.contains(n[i])){
               // console.log(n,i)
                n[i].gcost = newMoveCostToNeighbour;
              //  console.log(n[i].gcost,newMoveCostToNeighbour)
                n[i].hcost = getDistance(n[i],endPos);
                n[i].parent = currentNode;
                //console.log(! openSet.contains(n[i]));
                if(! openSet.contains(n[i])){
                   // console.log(n[i],i)

                    openSet.addItem(n[i])
                    if(n[i] != startNode && n[i] != endNode){
                        colourNode(n[i],openSetColour);
                        await sleep(waitTime);
                    }
                
                    }
            }

        }
    }
}


//Djikstra 2

async function djikstra(startPos,endPos){
    //open set of nodes
    var openSet = new heap(gridWidth*gridHeight);
    var closedSet = [];
    openSet.addItem(startPos);
    //find node with lowest f cost
    
    while(openSet.currentItemCount > 0){
        currentNode = openSet.removeFirstItem();
        //NO LONGER NECESSARY WITH THE HEAP
        /*
        for(let i =0; i<openSet.length;i++){
            if(openSet[i].getFcost() < currentNode.getFcost() || (openSet[i].getFcost() == currentNode.getFcost() && openSet[i].hcost < currentNode.hcost) )
            currentNode = openSet[i]; //this means the node we are checking has either a lower fcost (total distance to the target and distance from start and ) or the lowest distance from the 
        }
    
        //now we have the node we move it to the closed set
        let i = openSet.indexOf(currentNode);
        openSet.splice(i,1); */
        
        
        
        closedSet.push(currentNode);
        if(currentNode != startNode && currentNode != endNode){
        colourNode(currentNode,closedSetColour);
        }
        
        await sleep(waitTime);
        //checking if we are at the end
        if(currentNode == endPos){
            console.log("epic");
            return retracePath(startPos,endPos);
            
        
        }
        //now we check the neighbouring nodes and remove the repeats
        let n = getNeighbours(currentNode);
        for(let i =0;i<n.length;i++){
            //removing repeats or closed nodes
            if(closedSet.includes(n[i]) || n[i].walkable ==0){
                continue;
            }
            var newMoveCostToNeighbour = currentNode.gcost + getDistance(currentNode,n[i]);
            if(newMoveCostToNeighbour < n[i].gcost || ! openSet.contains(n[i])){
               // console.log(n,i)
                n[i].gcost = newMoveCostToNeighbour;
              //  console.log(n[i].gcost,newMoveCostToNeighbour)
                n[i].hcost = 0;
                n[i].parent = currentNode;
                //console.log(! openSet.contains(n[i]));
                if(! openSet.contains(n[i])){
                   // console.log(n[i],i)

                    openSet.addItem(n[i])
                    if(n[i] != startNode && n[i] != endNode){
                        colourNode(n[i],openSetColour);
                        await sleep(waitTime);
                    }
                
                    }
            }

        }
    }
}









//wrote this one based of the a* one 
//since djikstra is a* without the h cost (distance to the end) taken into account
/*
//////////////////////////////
//////////// OLD /////////////
//////////////////////////////
async function djikstra(startPos,endPos){
    //open set of nodes
    var openSet = [];
    var closedSet = [];
    openSet.push(startPos);
    //find node with lowest f cost
    while(openSet.length > 0){
        currentNode = openSet[0];
        for(let i =0; i<openSet.length;i++){
            if(openSet[i].getFcost() < currentNode.getFcost() || (openSet[i].getFcost() == currentNode.getFcost() && openSet[i].hcost < currentNode.hcost) )
            currentNode = openSet[i]; //this means the node we are checking has either a lower fcost (total distance to the target and distance from start and ) or the lowest distance from the 
        }
    
        //now we have the node we move it to the closed set
        let i = openSet.indexOf(currentNode);
        openSet.splice(i,1);
        closedSet.push(currentNode);
        colourNode(currentNode,closedSetColour);
        
        
        await sleep(waitTime);
        //checking if we are at the end
        if(currentNode == endPos){
            console.log("epic");
            return retracePath(startPos,endPos);
            
        
        }
        //now we check the neighbouring nodes and remove the repeats
        let n = getNeighbours(currentNode);
        for(let i =0;i<n.length;i++){
            //removing repeats or closed nodes
            if(closedSet.includes(n[i]) || n[i].walkable ==0){
                continue;
            }
            var newMoveCostToNeighbour = currentNode.gcost + getDistance(currentNode,n[i]);
            if(newMoveCostToNeighbour < n[i].gcost || ! openSet.includes(n[i])){
                n[i].gcost = newMoveCostToNeighbour;
               // console.log(n[i].gcost,newMoveCostToNeighbour)
                n[i].hcost = 0;
                n[i].parent = currentNode;
                
                if(! openSet.includes(n[i])){
                    openSet.push(n[i])
                    colourNode(n[i],openSetColour);
                    await sleep(waitTime);
                }
            }

        }
    }
}
*/

function findEndNode(){
    let nodeFound = false;
    let range = 1;
    while(!nodeFound){
        for(let y = gridHeight-1;y>=gridHeight-(range+1);y--){
            for(let x = gridWidth-1;x>=gridWidth-(range+1);x--){
                //console.log(x,y)
                if(grid[x][y].walkable ==1){
                    endNode = grid[x][y];
                    colourNode(endNode,endColour)
                    console.log("found",endNode)
                    return;
                    
                    
                }
            }
        }
        
      range+=1;  
    }
    
    
}

function constrain(n,min,max){
    
   return Math.min(Math.max(n, min), max);
}
function findStartNode(){
    let nodeFound = false;
    let range = 1;
    while(!nodeFound){
        for(let y = 0;y<=(range);y++){
            for(let x = 0;x<=(range);x++){
                //console.log(x,y)
                if(grid[x][y].walkable ==1){
                    startNode = grid[x][y];
                    colourNode(startNode,startColour)
                    console.log("found",startNode)
                    return;
                    
                    
                }
            }
        }
        
        range+=1;
    }
    
    
}


//recursive backtracking algorithmn for maze generation
//usually it works by removing edges. im 
function recursiveBacktrackingMaze(n){
    //start assuming that all grid tiles are not walkable
    //and clearing everything
    grid = createGrid(gridWidth,gridHeight,0);
    drawGrid();
    backtrackMaze(n);
    findStartNode();
    findEndNode();
    
    
}
function getCenrteNode(){
    let x = Math.floor(gridWidth/2);
    let y = Math.floor(gridHeight/2);
    return grid[x][y];
}
async function backtrackMaze(node){
    node.walkable = 1;
    colourNode(node,"white");
    counter+=1;
    
    let dir = shuffleArray(directions);
    
    //console.log(dir.length);
    while(dir.length > 0){
        //console.log(dir)
        //await sleep(10*counter)
        d = dir.pop();
        //times 2 since we are checking if the node in between is ok so that way we dont connect 2 paths
        nX = (d[0]*2)+node.x;
        nY = (d[1]*2)+node.y;
        

        //console.log(nX,nY);
        if(0<=nX && nX<gridWidth && nY < gridHeight && nY>=0){
          if(grid[nX][nY].walkable ==0 ){
                //colourNode(grid[nX][nY],"red");
                let lX = node.x +d[0];
                let lY = node.y+d[1];
                grid[lX][lY].walkable = 1;
                colourNode(grid[lX][lY],"white");
 
              // console.log(lX,lY);
                try{
                    backtrackMaze(grid[nX][nY]);  
                }catch (e){
                    console.log(e)
                    break;
                }
                
            
            }  
        }
        
    }
}
//  in memoram carve function

function addBorder(t = grid[0][0],b = grid[gridWidth-1][gridHeight-1]){
    //draw border
    //top
    let dx = b.x-t.x;
    let dy = b.y-t.y;
    for(let i = 0;i<dx;i++){
        grid[t.x+i][t.y].walkable = 0;
        grid[t.x+i][b.y].walkable = 0;
        colourNode(grid[t.x+i][t.y],"black");
        colourNode(grid[t.x+i][b.y],"black");
    }
    for(let i = 0;i<=dy;i++){
        grid[t.x][t.y+i].walkable = 0;
        grid[b.x][t.y+i].walkable = 0;
        colourNode(grid[t.x][t.y+i],"black");
        colourNode(grid[b.x][t.y+i],"black");
    }
}
function divisionMaze(tL,bR){
    grid = createGrid(gridWidth,gridHeight,1);
    addBorder();
    drawGrid();
    recursiveDivisionMaze(tL,bR);
    findStartNode();
    findEndNode();
}

async function recursiveDivisionMaze(topLeftNode,bottomRightNode){
    //gen random x and random y coordinate
    let dx = (bottomRightNode.x-topLeftNode.x)-2;
    let dy = (bottomRightNode.y-topLeftNode.y)-2;
    if(dx < 2 || dy<2){
       // console.log("l");
        return;
    }
    //coordinates of walls
    let x = Math.floor((Math.random()*100))%dx + topLeftNode.x+1;
    //console.log(dx,dy);
    let y = Math.floor((Math.random()*100))%dy + topLeftNode.y+1;
    //holes in walls
    let hX = Math.floor((Math.random()*100))%(x-topLeftNode.x)+topLeftNode.x;
    let hY = Math.floor((Math.random()*100))%(y-topLeftNode.y)+topLeftNode.y;
    let hY2 = Math.floor((Math.random()*100))%(bottomRightNode.y - y)+y;
    let hX2 = Math.floor((Math.random()*100))%(bottomRightNode.x - x)+x;
    //fill the rows
    // X row
    for(let i = 1;i<dy;i++){
        if(i+1 == hY || i-1==hY ||i==hY ||i+1 == hY2 || i-1==hY2 ||i==hY2){
            continue;
        }else{
            grid[x][topLeftNode.y+i].walkable =0;
            colourNode(grid[x][topLeftNode.y+i],"black")
            
        }
    }
    for(let i = 1;i<dx;i++){
        if(i+1 == hX || i-1==hX ||i==hX ||i+1 == hX2 || i-1==hX2 ||i==hX2){
            continue;
        }else{
            grid[topLeftNode.x+i][y].walkable =0;
            colourNode(grid[topLeftNode.x+i][y],"black")
        }
    }
    //now four corners
    try{ 
    recursiveDivisionMaze(topLeftNode,grid[constrain(x-1,0,gridWidth-1)][constrain(y-1,0,gridHeight-1)]); //top left quad
    recursiveDivisionMaze(grid[constrain(x+1,0,gridWidth-1)][topLeftNode.y],grid[bottomRightNode.x][constrain(y-1,0,gridHeight-1)]) // top right
    recursiveDivisionMaze(grid[topLeftNode.x][constrain(y+1,0,gridHeight-1)],grid[constrain(x-1,0,gridWidth-1)][bottomRightNode.y]) // bottom left
    recursiveDivisionMaze(grid[constrain(x+1,0,gridWidth-1)][constrain(y+1,0,gridHeight-1)],bottomRightNode)
    
    
    }catch{
        return;
    }
    
    //drawGrid();
    
    
    
    
    
}



//Add event to tell it to run script once entire page is loaded
document.addEventListener('DOMContentLoaded', function() { main();  });
