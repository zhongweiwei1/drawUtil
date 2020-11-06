export default (()=>{
    let index=-1;
    function drawer(){
        this.sourceShapes = []; // 源图像  打算放置到画布上的图 画笔轨迹
        this.targetShapes=[];   // 目标图像  已经放置在画布上的图  橡皮擦轨迹
        this.canvas = document.getElementById("canvas");
        this.shape = "";
        this.ctx = this.canvas.getContext("2d");
        this.rect = this.canvas.getBoundingClientRect();
        this.rectX = this.rect.x;
        this.rectY = this.rect.y;
        this.mouseDown = 0;   // 鼠标是否按下
        this.startX=0;
        this.startY=0;
        this.isReset=false, // 是否撤销过
        this.resetShapes=[],  // 撤销的内容
        this.resetIndex=-1;     // 当前撤销的index
        this.initEvent();
    }
    drawer.prototype = {
        initEvent(){
            // 在源图像外显示目标图像，只有源图像外的目标图像部分是显示的，源图像是透明的 
            // this.ctx.globalCompositeOperation = "destination-out";.
            this.handler = (e)=> {
                this.startPaint(e);
            };
            this.drawHandler = (e)=>{
                this.draw(e);
            }
            this.destroy = function(t) {
                this.canvas.removeEventListener('mousedown', this.handler, false);
                this.canvas.removeEventListener('mousemove', this.drawHandler, false);
                this.canvas.addEventListener("mousedown",this.handler, false);
            };
            this.canvas.addEventListener("mousedown",this.handler, false);
            this.canvas.addEventListener("mouseup",()=>{
                this.mouseDown = 0;
                this.destroy();
                console.log(this.sourceShapes);
                console.log(this.targetShapes);
            })
        },
        initStatus(shapeType){
            this.shape = shapeType;
        },
        startPaint(e){
            this.mouseDown = 1;
            let clientX = e.clientX,clientY = e.clientY;
            this.startX = clientX - this.rectX;
            this.startY = clientY - this.rectY;
            this.createShpes();
            console.log(this.shape,"----");
            if(this.shape=="1"){
                this.targetShapes[index].x.push(this.startX);
                this.targetShapes[index].y.push(this.startY);

                // console.log("startX",this.startX,"startY",this.startY,"clientX",clientX,"clientY",clientY,"rect",this.rect)
                this.ctx.beginPath();
                this.ctx.lineWidth="2";
                this.ctx.globalCompositeOperation="source-over";
                this.ctx.strokeStyle = "rgb(0,0,3)";
                this.ctx.moveTo(this.startX,this.startY);
                this.ctx.lineTo(this.startX,this.startY);
                this.ctx.stroke();
                this.ctx.closePath();
            }else if(this.shape=="2"){
                this.sourceShapes[index].x.push(this.startX);
                this.sourceShapes[index].y.push(this.startY);

                // console.log("startX",this.startX,"startY",this.startY,"clientX",clientX,"clientY",clientY,"rect",this.rect)
                this.ctx.beginPath();
                this.ctx.lineWidth="50";
                this.ctx.globalCompositeOperation="destination-out";
                this.ctx.moveTo(this.startX,this.startY);
                this.ctx.lineTo(this.startX,this.startY);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            this.canvas.addEventListener("mousemove",this.drawHandler, false);
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
            if(this.mouseDown==1){
                let clientX = e.clientX,clientY = e.clientY;
                this.endX = clientX - this.rectX;
                this.endY = clientY - this.rectY;
                if(this.shape=="1"){
                    this.ctx.beginPath();
                    this.ctx.lineWidth="2";
                    this.ctx.strokeStyle = "rgb(0,0,3)";
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
                console.log("恢复");
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
            if(this.targetShapes.length>0 || this.sourceShapes.length>0){
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
                console.log(this.resetShapes);
                this.clearRect();
                this.redraw();
            }else{
                console.log("内有可以撤销的内容了");
            }
        },
        redraw(){
            let shapes = [...this.targetShapes,...this.sourceShapes];
            for(let j=0;j<shapes.length;j++){
                let item = shapes[j];
                if(!item) continue;
                console.log("---");
                if(item.shape=="1"){
                    for(let i=0;i<item.x.length-1;i++){
                        this.ctx.beginPath();
                        this.ctx.lineWidth="2";
                        this.ctx.strokeStyle = "rgb(0,0,3)";
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
        // 清屏
        clearRect(){
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        },
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
        }
    }
    return drawer;
})(window)