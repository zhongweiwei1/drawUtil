export default (()=>{
    let index=-1;
    function drawer(){
        this.sourceShapes = []; // 源图像  打算放置到画布上的图 画笔轨迹
        this.targetShapes=[];   // 目标图像  已经放置在画布上的图  橡皮擦轨迹
        this.canvas = document.getElementById("canvas");
        this.shape = "";
        this.ctx = this.canvas.getContext("2d");
        this.mouseDown = 0;   // 鼠标是否按下
        this.startX=0;
        this.startY=0;
        this.isReset=false, // 是否撤销过
        this.resetShapes=[],  // 撤销的内容
        this.resetIndex=-1;     // 当前撤销的index
        this.hasClear = false;  // 清屏
        this.clearShape = [];   // 清屏时的shapes
        this.initEvent();
        this.initMobile();
    }
    drawer.prototype = {
        addHandler(element,type,handler){
            if(element.addEventListener){
                element.addEventListener(type,handler,false);
            }else if(element.attachEvent){
                element.attachEvent('on'+type,handler)
            }else{
                element['on'+type] = handler;
            }
        },
        removeHandler(element,type,handler){
            if(element.removeEventListener){
                element.removeEventListener(type,handler,false);
            }else if(element.detachEvent){
                element.detachEvent('on'+type,handler)
            }
        },
        initEvent(){
            this.handler = (e)=> {
                e.stopPropagation();
                e.preventDefault();
                this.startPaint(e);
            };
            this.drawHandler = (e)=>{
                e.stopPropagation();
                e.preventDefault();
                this.draw(e);
            }
            this.destroy = function(t) {
                this.removeHandler(this.canvas,"mousedown",this.handler);
                this.addHandler(this.canvas,"mousedown",this.handler);
            };
            this.addHandler(this.canvas,"mousedown",this.handler);
            this.addHandler(this.canvas,"mouseup",()=>{
                this.mouseDown = 0;
                this.startX = 0;
                this.startY = 0;
                this.endX = 0;
                this.endY = 0;
                this.ctx.closePath();
                this.destroy();
            })
        },
        initMobile(){
            console.log($(this.canvas))
            $(this.canvas).bind("touchstart touchmove touchend touchcancel", function(e){
                let touches = e.originalEvent.changedTouches, first=touches[0],type="";
                switch(e.type){
                    case "touchstart": type="mousedown"; break;
                    case "touchmove": type="mousemove"; break;
                    case "touchend": type="mouseup"; break;
                }
                let simulateEvent = document.createEvent("MouseEvent");
                simulateEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY,false, false, false, false, 0/*left*/, null);
                first.target.dispatchEvent(simulateEvent);
                e.preventDefault();
            },{passive:true})
        },
        initStatus(shapeType){
            this.shape = shapeType;
        },
        startPaint(e){
            console.log("start paint...")
            if(!this.shape)return;
            this.rect = this.canvas.getBoundingClientRect();
            this.rectX = this.rect.x;
            this.rectY = this.rect.y;
            this.mouseDown = 1;
            let clientX = e.clientX?e.clientX:e.targetTouches[0].pageX,clientY = e.clientY?e.clientY:e.targetTouches[0].pageY;
            this.startX = clientX - this.rectX;
            this.startY = clientY - this.rectY;
            if(this.shape=="1"){
                this.createShpes();
                this.targetShapes[index].x.push(this.startX);
                this.targetShapes[index].y.push(this.startY);

                this.ctx.beginPath();
                this.ctx.lineWidth="2";
                this.ctx.globalCompositeOperation="source-over";
                this.ctx.strokeStyle = "red";
                this.ctx.moveTo(this.startX,this.startY);
                this.ctx.lineTo(this.startX,this.startY);
                this.ctx.stroke();
                this.ctx.closePath();
            }else if(this.shape=="2"){
                if(this.targetShapes.length==0)return;
                this.createShpes();
                this.sourceShapes[index].x.push(this.startX);
                this.sourceShapes[index].y.push(this.startY);

                this.ctx.beginPath();
                this.ctx.lineWidth="5";
                this.ctx.globalCompositeOperation="destination-out";
                this.ctx.moveTo(this.startX,this.startY);
                this.ctx.lineTo(this.startX,this.startY);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            this.addHandler(this.canvas,"mousemove",this.drawHandler,false);
        },
        createShpes(){
            index = index+1;
            this.resetIndex = index+1;
            if(this.shape==1){
                this.targetShapes[index] = {
                    id:new Date().getTime()+"",
                    shape:this.shape,
                    x:[],
                    y:[]
                }
            }else if(this.shape=="2"){
                this.sourceShapes[index] = {
                    id:new Date().getTime()+"",
                    shape:this.shape,
                    x:[],
                    y:[]
                }
            }
        },
        draw(e){
            console.log("draw...",this.mouseDown);
            if(this.mouseDown==1){
                let clientX = e.clientX?e.clientX:e.targetTouches[0].pageX,clientY = e.clientY?e.clientY:e.targetTouches[0].pageY;
                this.endX = clientX - this.rectX;
                this.endY = clientY - this.rectY;
                if(this.shape=="1"){
                    this.ctx.beginPath();
                    this.ctx.lineWidth="2";
                    this.ctx.strokeStyle = "red";
                    this.ctx.moveTo(this.startX,this.startY);
                    this.ctx.lineTo(this.endX,this.endY);
                    this.ctx.stroke();
                    this.targetShapes[index].x.push(this.startX);
                    this.targetShapes[index].y.push(this.startY);
                }else if(this.shape=="2"){
                    this.ctx.beginPath();
                    this.ctx.lineWidth="5";
                    this.ctx.globalCompositeOperation="destination-out";
                    this.ctx.moveTo(this.startX,this.startY);
                    this.ctx.lineTo(this.endX,this.endY);
                    this.ctx.stroke();
                    this.sourceShapes[index].x.push(this.startX);
                    this.sourceShapes[index].y.push(this.startY);
                }
                this.ctx.closePath();
                this.startX = this.endX;
                this.startY = this.endY;
            }
        },
        // 恢复
        recoverDraw(){
            if(this.isReset){
                if(this.resetShapes.length>0){
                    let item = this.resetShapes.pop();
                    if(item){
                        this.resetIndex++;
                        if(item.shape=="1"){
                            this.targetShapes.push(item);
                        }else if(item.shape=="2"){
                            this.sourceShapes.push(item);
                        }
                        console.log(this.targetShapes,this.sourceShapes);
                        this.redraw();
                    }
                }else{
                    console.log("没有可以恢复的内容了");
                }
            }else{
                console.log("没有可以恢复的内容了");
            }
        },
        // 撤销
        resetDraw(){
            if(!this.isEmptyShapes(this.targetShapes) || !this.isEmptyShapes(this.sourceShapes)){
                console.log("撤销")
                this.resetIndex--;
                this.isReset = true;
                if (this.targetShapes[this.resetIndex]){
                    let resetItem = this.targetShapes.splice(this.resetIndex,1);
                    this.resetShapes.push(...resetItem);
                } else if(this.sourceShapes[this.resetIndex]){
                    let resetItem = this.sourceShapes.splice(this.resetIndex,1);
                    this.resetShapes.push(...resetItem);
                }
                this.redraw();
            }else if(!this.isEmptyShapes(this.clearShape)){
                for(let key in this.clearShape){
                    if(this.clearShape[key] && this.clearShape[key].shape=="1")this.targetShapes[key] = this.clearShape[key];
                    if(this.clearShape[key] && this.clearShape[key].shape=="2")this.sourceShapes[key] = this.clearShape[key];
                }
                this.clearShape.length=0;
                this.redraw();
            }else{
                console.log("没有可以撤销的内容了");
            }
        },
        redraw(){
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
            let shapes = [...this.targetShapes,...this.sourceShapes];
            for(let j=0;j<shapes.length;j++){
                let item = shapes[j];
                if(!item) continue;
                if(item.shape=="1"){
                    for(let i=0;i<item.x.length-1;i++){
                        this.ctx.beginPath();
                        this.ctx.lineWidth="2";
                        this.ctx.strokeStyle = "red";
                        this.ctx.globalCompositeOperation="source-over";
                        this.ctx.moveTo(item.x[i],item.y[i]);
                        this.ctx.lineTo(item.x[i+1],item.y[i+1]);
                        this.ctx.stroke();
                        this.ctx.closePath();
                    }
                }else if(item.shape=="2"){
                    for(let i=0;i<item.x.length-1;i++){
                        this.ctx.beginPath();
                        this.ctx.lineWidth="5";
                        this.ctx.globalCompositeOperation="destination-out";
                        this.ctx.moveTo(item.x[i],item.y[i]);
                        this.ctx.lineTo(item.x[i+1],item.y[i+1]);
                        this.ctx.stroke();
                        this.ctx.closePath();
                    }
                }
            }
        },
        // 清屏 可恢复
        clearRect(){
            this.hasClear = true;
            this.asignArr(this.targetShapes,this.clearShape);
            this.asignArr(this.sourceShapes,this.clearShape);
            this.sourceShapes.length = 0;
            this.targetShapes.length = 0;
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        },
        // 重置 不可恢复
        clearAllRect(){
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
            this.sourceShapes = [];
            this.targetShapes=[];
            this.shape = "";
            this.mouseDown = 0;   // 鼠标是否按下
            this.startX=0;
            this.startY=0;
            this.isReset=false, // 是否撤销过
            this.resetShapes=[],  // 撤销的内容
            this.resetIndex=-1;     // 当前撤销的index
            index=-1;
        },
        isEmptyShapes(shape){
            if(!shape || shape.length==0)return true;
            let values = [...shape.values()];
            for(let s=0;s<values.length;s++){
                if(values[s])return false;
            }
            return true;
        },
        asignArr(arr,tar){
            for(let key in arr){
                tar[key] = arr[key];
            }
        }
    }
    return drawer;
})(window)