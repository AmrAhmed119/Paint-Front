import {Component, OnInit} from '@angular/core';
import {Konva} from "konva/cmj/_FullInternals";
import {ShapeService} from './shape-service.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = "Paint";
  layer: any;
  stage: any;
  transform: any;
  currentSelector = "screen";
  lastEvent: any;
  colorEvent: any;
  color: string = "black";
  size = 5;
  selectedShape: any;
  log = console.log;
  selectedFiles?: FileList;
  currentFile?: File;
  message = '';
  filename="";
  saveclicked=false;

  constructor(private service: ShapeService) {}

  ngOnInit(): void {

    let width = window.innerWidth * (80 / 100);
    let height = window.innerHeight * (95 / 100);
    this.stage = new Konva.Stage({
      container: 'board',
      width: width,
      height: height,
    });
    this.transform = new Konva.Transformer();
    this.layer = new Konva.Layer();
    this.layer.add(this.transform);
    this.stage.add(this.layer);

    this.stage.on("click", (event: any) => {
      if (this.currentSelector !== "screen") {
        this.selectedShape = null;
        return;
      }
      this.layer.getChildren().forEach(function (node: any) {
        node.draggable(false);
      });
      let id = event.target.attrs.id;
      this.selectedShape = event.target;
      // console.log("click triggered");
      // console.log("id of selected shape = " + id);
      if (id != undefined) {
        let shape = event.target;
        this.transform.nodes([shape]);
        shape.draggable(true);

        shape.on('transformstart', function () {
          console.log('transform start' + shape);
        });

        shape.on('dragmove', function () {
          console.log("moving shape" + shape);
        });
        shape.on('transform', function () {
          console.log('transform' + shape);
        });

        shape.on('transformend', () => {
          this.service.updateShape(shape.toJSON());
        });

        shape.on('dragend', () => {
          this.service.updateShape(shape.toJSON());
        });

      } else {
        this.transform.nodes([]);
      }
    });

  }

  public generateID(shape: any) {
    this.service.createShape(shape.toJSON()).subscribe(responseData => {
        shape.id(responseData['id']);
        console.log(shape.toJSON());
      }
    );
  }

  public drawShape(event: any) {

    this.stage.off('mousedown');
    this.stage.off('mouseup');
    this.stage.off('mousemove');
    this.transform.nodes([]);


    let type = this.getType(event);
    console.log(type);
    if (this.lastEvent != null) {
      this.lastEvent.target.style.background = "#ffffff";
    }
    this.lastEvent = event;

    if (this.currentSelector != type) {
      this.currentSelector = type;
      event.target.style.background = "#62666846";
      this.layer.getChildren().forEach(function (node: any) {
        node.draggable(false);
      });
    } else {
      this.currentSelector = "screen";
      event.target.style.background = "#ffffff";
      return;
    }

    let shape: any;
    let isNowDrawing = false;

    this.stage.on("mousedown", () => {
      shape = this.getShape(type);
      isNowDrawing = true;
      let pos = this.stage.getPointerPosition();
      shape.x(pos.x);
      shape.y(pos.y);
      shape.stroke(this.color);
      shape.strokeWidth(this.size);

      if (type === "Rectangle" || type === "Square") {
        shape.width(0);
        shape.height(0);
      } else if (type === "Circle") {
        shape.radius(0);
      } else if (type === "Ellipse") {
        shape.radiusX(0);
        shape.radiusY(0);
      } else if (type === "Triangle") {
        shape.sides(3);
        shape.radius(0);
      } else if (type === "RegularPolygon") {
        shape.sides(5);
        shape.radius(0);
      }

      this.layer.add(shape).batchDraw();
    });

    this.stage.on("mousemove", () => {
      if (isNowDrawing) {
        let pos = this.stage.getPointerPosition();

        if (type === "Rectangle" || type === "Triangle" || type === "RegularPolygon") {
          shape.width(pos.x - shape.x());
          shape.height(pos.y - shape.y());
        } else if (type === "Square") {
          let newX: number = pos.x - shape.x();
          let newY: number = pos.y - shape.y();
          let x: number = Math.min(newX, newY);
          shape.width(x)
          shape.height(shape.width());
        } else if (type === "Circle") {
          let rise = Math.pow(pos.y - shape.y(), 2);
          let run = Math.pow(pos.x - shape.x(), 2);
          let newRadius = Math.sqrt(rise * run);
          shape.radius(newRadius / 400);
        } else if (type === "Ellipse") {
          shape.radiusX(Math.abs(pos.x - shape.x()));
          shape.radiusY(Math.abs(pos.y - shape.y()));
        }

        this.layer.batchDraw();
      }
    });

    this.stage.on("mouseup", () => {
      isNowDrawing = false;
      shape.setAttr('type', type);
      console.log(shape.toJSON());
      this.generateID(shape);
      console.log("Done initializing " + type);
      console.log("color is " + shape.stroke())
    });

  }

  public freeHand(event: any) {

    this.stage.off('mousedown');
    this.stage.off('mouseup');
    this.stage.off('mousemove');
    this.transform.nodes([]);
    console.log(this.color);

    if (this.lastEvent != null) {
      this.lastEvent.target.style.background = "#ffffff";
    }
    this.lastEvent = event;

    let line: any;
    let isNowDrawing = false;

    if (this.currentSelector != "FreeHand") {
      this.currentSelector = "FreeHand";
      event.target.style.background = "#62666846";
      this.layer.getChildren().forEach(function (node: any) {
        node.draggable(false);
      });
    } else {
      this.currentSelector = "screen";
      event.target.style.background = "#ffffff";
      return;
    }

    this.stage.on("mousedown", () => {
      console.log(this.color);
      line = new Konva.Line();
      isNowDrawing = true;
      let pos = this.stage.getPointerPosition();
      line.points([pos.x, pos.y]);
      line.stroke(this.color);
      line.strokeWidth(this.size);
      line.lineCap("round");
      line.lineJoin("round");
      this.layer.add(line).batchDraw();
    });

    this.stage.on("mousemove", () => {
      if (isNowDrawing) {
        let pos = this.stage.getPointerPosition();
        line.points(line.points().concat([pos.x, pos.y]));
        line.lineCap("round");
        line.lineJoin("round");
        this.layer.batchDraw();
      }
    });

    this.stage.on("mouseup", () => {
      isNowDrawing = false;
      line.setAttr('type', "LineSegment");
      this.generateID(line);
      console.log("Done initializing FreeHand");
    });

  }

  public drawLine(event: any) {

    this.stage.off('mousedown');
    this.stage.off('mouseup');
    this.stage.off('mousemove');
    this.transform.nodes([]);

    if (this.lastEvent != null) {
      this.lastEvent.target.style.background = "#ffffff";
    }
    this.lastEvent = event;

    let line: any;
    let isNowDrawing = false;

    if (this.currentSelector != "line") {
      this.currentSelector = "line";
      event.target.style.background = "#62666846";
      this.layer.getChildren().forEach(function (node: any) {
        node.draggable(false);
      });
    } else {
      this.currentSelector = "screen";
      event.target.style.background = "#ffffff";
      return;
    }

    this.stage.on("mousedown", () => {
      line = new Konva.Line();
      isNowDrawing = true;
      let pos = this.stage.getPointerPosition();
      line.points([pos.x, pos.y, pos.x, pos.y]);
      line.stroke(this.color);
      line.strokeWidth(this.size);
      line.lineCap("round");
      line.lineJoin("round");
      this.layer.add(line).batchDraw();
    });

    this.stage.on("mousemove", () => {
      if (isNowDrawing) {
        let pos = this.stage.getPointerPosition();
        line.points()[2] = pos.x;
        line.points()[3] = pos.y;
        line.lineCap("round");
        line.lineJoin("round");
        this.layer.batchDraw();
      }
    });

    this.stage.on("mouseup", () => {
      isNowDrawing = false;
      line.setAttr('type', "LineSegment");
      this.generateID(line);
      console.log("Done initialzing Line")
    });

  }

  public fill(event: any) {
    const btn = document.getElementById('in');
    if (this.colorEvent != null) {
      console.log(this.lastEvent);
      this.colorEvent.target.style.opacity = 1;
    }
    this.colorEvent = event;
    if (this.color !== event.target.style.background) {
      this.color = event.target.style.background.toString();
      if (btn !== null) {
        btn.style.color = this.color;
      }
      event.target.style.opacity = 0.5;
      this.layer.getChildren().forEach(function (node: any) {
        node.draggable(false);
      });
    } else {
      this.color = "black";
      event.target.style.opacity = 1;
      return;
    }
    console.log(this.color);

  }

  public fillshape() {
    this.stage.off('mousedown mouseup mousemove');
    this.stage.on("mousedown", (event: any) => {
      event.target.fill(this.color);
      let shape = event.target;
      this.service.updateShape(shape.toJSON());
    });
  }

  public changeState(event: any) {
    if (this.lastEvent != null) {
      this.lastEvent.target.style.background = "#ffffff";
    }
    this.lastEvent = event;


    if (this.currentSelector != "edit") {
      this.currentSelector = "edit";
      event.target.style.background = "#62666846";
      this.layer.getChildren().forEach(function (node: any) {
        node.draggable(false);
      });
    } else {
      this.currentSelector = "screen";
      event.target.style.background = "#ffffff";
      return;
    }
  }


  public copy() {
    if (this.selectedShape !== null) {
      let newShape = this.selectedShape.clone();
      this.service.copyShape(this.selectedShape.id()).subscribe(responseData => {
        newShape.id(responseData['id']);
        console.log("first shape" + this.selectedShape.id());
        console.log("second shape" + newShape.id());
        this.selectedShape = newShape;
        this.layer.add(newShape).batchDraw();
        this.transform.nodes([newShape]);
      });
    }
  }

  public delete() {
    if (this.selectedShape !== null) {
      let shape = this.selectedShape;
      this.service.deleteShape(shape.id());
      shape.destroy();
      this.transform.nodes([]);
      this.selectedShape = null;
    }
  }

  public undo() {
    this.service.undo().subscribe(responseData => {
      console.log(responseData);
      if(responseData === null) {
        console.log("cannot undo");
        return;
      }
      let tempShape = responseData['shapes'];
      let operation = responseData['operation'];
      let arr = <Array<any>>tempShape;

      console.log(operation);
      arr.forEach((shape) => {
        this.processOperation(operation, shape);
      });
    })
  }

  public redo() {
    this.service.redo().subscribe(responseData => {
      if(responseData === null) {
        console.log("cannot redo");
        return;
      }
      let tempShape = responseData['shapes'];
      let operation = responseData['operation'];
      let arr = <Array<any>>tempShape;
      console.log(tempShape);
      console.log(operation);
      arr.forEach((shape) => {
        this.processOperation(operation, shape);
      });
    })
  }

  public clear() {
    this.service.clear();
    this.layer.removeChildren();
  }

  public processOperation(type: string, shape: any) {
    if (type === "CREATE") {
      let kind = shape['type'];
      this.layer.add(this.getObject(kind, shape)).batchDraw();
    } else if (type === "UPDATE") {
      let id = shape['id'];
      let op = this.stage.findOne("#" + id.toString());
      op.destroy();
      this.layer.add(this.getObject(shape['type'], shape)).batchDraw();
      console.log(this.layer);
    } else if (type === "DELETE") {
      let id = shape['id'];
      let op = this.stage.findOne("#" + id.toString());
      op.remove();
      op.destroy();
      console.log(op);
    } else if(type === "CLEAR") {
      this.clear();
    }
  }

  //get type
  public getType(event: any) {
    let shape = event.srcElement.innerText;
    let type: any;
    console.log(shape);
    switch (shape) {
      case "▭":
        type = "Rectangle";
        break;
      case "◯":
        type = "Circle";
        break;
      case "⬜":
        type = "Square";
        break;
      case "⬠":
        type = "RegularPolygon";
        break;
      case "⬭":
        type = "Ellipse";
        break;
      case "△":
        type = "Triangle";
        break;
    }
    return type;
  }

  public save(event: any) {
    this.changeState(event);
    console.log(this.stage.toJSON());
    this.service.save(this.stage.toJSON(),"JSON",this.filename).subscribe(response=>{
      this.download(response);
    });
    console.log("done");


  }
  public download(response:any){
    let link = document.createElement('a');
    link.download = response.name;
    console.log(response.url);
    link.href = response.url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  public load(event:any){
    this.changeState(event);
    this.currentSelector = "screen";
    this.selectedFiles = event.target.files;
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        this.currentFile = file;

        this.service.load(this.currentFile).subscribe(responseData=>{
          let x=responseData['children'];
          let y=x['0'];
          let z = y['children'];
          let arr = <Array<any>>z;
          for(let i=0;i<arr.length;i++) {
            if(i === 0) continue;
            let shape = arr[i]['attrs'];
            this.processOperation("CREATE",shape);
          }
      
        });
      }

      this.selectedFiles = undefined;
    }
  }

  public getObject(type: string, shape: any) {
    let choosenShape: any;
    switch (type) {
      case "Rectangle":
        choosenShape = new Konva.Rect(shape);
        break;
      case "Circle":
        choosenShape = new Konva.Circle(shape);
        break;
      case "Ellipse":
        choosenShape = new Konva.Ellipse(shape);
        break;
      case "Square":
        choosenShape = new Konva.Rect(shape);
        break;
      case "LineSegment":
        choosenShape = new Konva.Line(shape);
        break;
      case "Triangle":
        choosenShape = new Konva.RegularPolygon(shape);
        break;
      case "RegularPolygon":
        choosenShape = new Konva.RegularPolygon(shape);
        break;
    }
    return choosenShape;
  }

  // return shape
  public getShape(shape: string) {
    let choosenShape: any;
    switch (shape) {
      case "Rectangle":
        choosenShape = new Konva.Rect();
        break;
      case "Circle":
        choosenShape = new Konva.Circle();
        break;
      case "Ellipse":
        choosenShape = new Konva.Ellipse();
        break;
      case "Square":
        choosenShape = new Konva.Rect();
        break;
      case "Triangle":
        choosenShape = new Konva.RegularPolygon();
        break;
      case "RegularPolygon":
        choosenShape = new Konva.RegularPolygon();
        break;
    }
    return choosenShape;
  }


  /*
    // draw Rectangle
    public drawRectangle(event : any) {

      this.stage.off('mousedown');
      this.stage.off('mouseup');
      this.stage.off('mousemove');

      if(this.lastEvent != null) {
        this.lastEvent.target.style.background = "#ffffff";
      }
      this.lastEvent = event;

      if(this.currentSelector != "rectangle"){
        this.currentSelector = "rectangle";
        event.target.style.background = "#62666846";
        this.layer.getChildren().forEach(function(node:any){
          node.draggable(false);
        });
      }
      else {
        this.currentSelector = "screen";
        event.target.style.background = "#ffffff";
        return;
      }

      let rectangle : any;
      let isNowDrawing = false;

      this.stage.on("mousedown",()=>{
        rectangle = new Konva.Rect();
        isNowDrawing = true;
        let pos = this.stage.getPointerPosition();
        rectangle.x(pos.x);
        rectangle.y(pos.y);
        rectangle.width(0);
        rectangle.height(0);
        rectangle.fill("white");
        rectangle.stroke("grey");
        rectangle.strokeWidth(2);
        this.layer.add(rectangle).batchDraw();
      });

      this.stage.on("mousemove",()=>{
        if(isNowDrawing) {
          let pos = this.stage.getPointerPosition();
          rectangle.width(pos.x - rectangle.x());
          rectangle.height(pos.y - rectangle.y());
          this.layer.batchDraw();
        }
      });

      this.stage.on("mouseup",()=>{
        this.postGenerateID(rectangle,"Rectangle");
        isNowDrawing=false;
      });

    }

    // draw Circle
    public drawCircle(event : any) {

      if(this.lastEvent != null) {
        console.log(this.lastEvent)
        this.lastEvent.target.style.background = "#ffffff";
      }
      this.lastEvent = event;

      this.stage.off('mousedown');
      this.stage.off('mouseup');
      this.stage.off('mousemove');

      if(this.currentSelector != "circle"){
        this.currentSelector = "circle";
        event.target.style.background = "#62666846";
        this.layer.getChildren().forEach(function(node:any){
          node.draggable(false);
        });
      }
      else {
        this.currentSelector = "screen";
        event.target.style.background = "#ffffff";
        return;
      }

      let circle : any;
      let isNowDrawing = false;

      this.stage.on("mousedown",()=>{
        circle = new Konva.Circle();
        isNowDrawing = true;
        let pos = this.stage.getPointerPosition();
        circle.x(pos.x);
        circle.y(pos.y);
        circle.radius(0);
        circle.fill("white");
        circle.stroke("grey");
        this.layer.add(circle).batchDraw();
      });

      this.stage.on("mousemove",()=>{
        if(isNowDrawing) {
          let pos = this.stage.getPointerPosition();
          const rise = Math.pow(pos.y - circle.y(), 2);
          const run = Math.pow(pos.x - circle.x(), 2);
          const newRadius = Math.sqrt(rise * run);
          circle.radius(newRadius/400);
          this.layer.batchDraw();
        }
      });

      this.stage.on("mouseup",()=>{
        this.postGenerateID(circle,"Circle");
        isNowDrawing=false;
      });

    }

    // draw ellipse
    public drawEllipse(event : any) {

      this.stage.off('mousedown');
      this.stage.off('mouseup');
      this.stage.off('mousemove');

      if(this.lastEvent != null) {
        console.log(this.lastEvent)
        this.lastEvent.target.style.background = "#ffffff";
      }
      this.lastEvent = event;

      let ellipse : any;
      let isNowDrawing = false;

      if(this.currentSelector != "ellipse"){
        this.currentSelector = "ellipse";
        event.target.style.background = "#62666846";
        this.layer.getChildren().forEach(function(node:any){
          node.draggable(false);
        });
      }
      else {
        this.currentSelector = "screen";
        event.target.style.background = "#ffffff";
        return;
      }

      this.stage.on("mousedown",()=>{
        ellipse = new Konva.Ellipse();
        isNowDrawing = true;
        let pos = this.stage.getPointerPosition();
        ellipse.x(pos.x);
        ellipse.y(pos.y);
        ellipse.radiusX(0);
        ellipse.radiusY(0);
        ellipse.fill("white");
        ellipse.stroke("grey");
        this.layer.add(ellipse).batchDraw();
      });

      this.stage.on("mousemove",()=>{
        if(isNowDrawing) {
          let pos = this.stage.getPointerPosition();
          ellipse.radiusX(Math.abs(pos.x - ellipse.x()));
          ellipse.radiusY(Math.abs(pos.y - ellipse.y()));
          this.layer.batchDraw();
        }
      });

      this.stage.on("mouseup",()=>{
        this.postGenerateID(ellipse,"Ellipse");
        isNowDrawing=false;
      });

    }

    // draw square
    public drawSquare(event : any) {

      this.stage.off('mousedown');
      this.stage.off('mouseup');
      this.stage.off('mousemove');

      if(this.lastEvent != null) {
        console.log(this.lastEvent)
        this.lastEvent.target.style.background = "#ffffff";
      }
      this.lastEvent = event;

      let square : any;
      let isNowDrawing = false;

      if(this.currentSelector != "square"){
        this.currentSelector = "square";
        event.target.style.background = "#62666846";
        this.layer.getChildren().forEach(function(node:any){
          node.draggable(false);
        });
      }
      else {
        this.currentSelector = "screen";
        event.target.style.background = "#ffffff";
        return;
      }

      this.stage.on("mousedown",()=>{
        square = new Konva.Rect();
        isNowDrawing = true;
        let pos = this.stage.getPointerPosition();
        square.x(pos.x);
        square.y(pos.y);
        square.width(0);
        square.height(0);
        square.fill("white");
        square.stroke("grey");
        this.layer.add(square).batchDraw();
      });

      this.stage.on("mousemove",()=>{
        if(isNowDrawing) {
          let pos = this.stage.getPointerPosition();
          const to = Math.max(pos.x,pos.y);
          square.width(to - square.x());
          square.height(square.width());
          this.layer.batchDraw();
        }
      });

      this.stage.on("mouseup",()=>{
        this.postGenerateID(square,"Square");
        isNowDrawing=false;
      });

    }

    // draw triangle
    public drawTriangle(event : any) {

      this.stage.off('mousedown');
      this.stage.off('mouseup');
      this.stage.off('mousemove');

      if(this.lastEvent != null) {
        console.log(this.lastEvent)
        this.lastEvent.target.style.background = "#ffffff";
      }
      this.lastEvent = event;

      let triangle : any;
      let isNowDrawing = false;

      if(this.currentSelector != "triangle"){
        this.currentSelector = "triangle";
        event.target.style.background = "#62666846";
        this.layer.getChildren().forEach(function(node:any){
          node.draggable(false);
        });
      }
      else {
        this.currentSelector = "screen";
        event.target.style.background = "#ffffff";
        return;
      }

      this.stage.on("mousedown",()=>{
        triangle = new Konva.RegularPolygon();
        isNowDrawing = true;
        let pos = this.stage.getPointerPosition();
        triangle.x(pos.x);
        triangle.y(pos.y);
        triangle.sides(3);
        triangle.radius(0);
        triangle.fill("white");
        triangle.stroke("grey");
        this.layer.add(triangle).batchDraw();
      });

      this.stage.on("mousemove",()=>{
        if(isNowDrawing) {
          let pos = this.stage.getPointerPosition();
          triangle.width(pos.x - triangle.x());
          triangle.height(pos.y - triangle.y());
          this.layer.batchDraw();
        }
      });

      this.stage.on("mouseup",()=>{
        this.postGenerateID(triangle,"Triangle");
        isNowDrawing=false;;
      });

    }

    // free hand
    public freeHand(event : any) {

      this.stage.off('mousedown');
      this.stage.off('mouseup');
      this.stage.off('mousemove');

      if(this.lastEvent != null) {
        console.log(this.lastEvent)
        this.lastEvent.target.style.background = "#ffffff";
      }
      this.lastEvent = event;

      let line : any;
      let isNowDrawing = false;

      if(this.currentSelector != "triangle"){
        this.currentSelector = "triangle";
        event.target.style.background = "#62666846";
        this.layer.getChildren().forEach(function(node:any){
          node.draggable(false);
        });
      }
      else {
        this.currentSelector = "screen";
        event.target.style.background = "#ffffff";
        return;
      }

      this.stage.on("mousedown",()=>{
        line = new Konva.Line();
        isNowDrawing = true;
        let pos = this.stage.getPointerPosition();
        line.points([pos.x,pos.y]);
        line.stroke("black");
        line.strokeWidth(10);
        line.lineCap("round");
        line.lineJoin("round");
        this.layer.add(line).batchDraw();
      });

      this.stage.on("mousemove",()=>{
        if(isNowDrawing) {
          let pos = this.stage.getPointerPosition();
          line.points(line.points().concat([pos.x,pos.y]));
          line.lineCap("round");
          line.lineJoin("round");
          this.layer.batchDraw();
        }
      });

      this.stage.on("mouseup",()=>{
        this.postGenerateID(line,"LineSegment");
        isNowDrawing=false;
      });

    }

    // draw line
    public drawLine(event : any) {

      this.stage.off('mousedown');
      this.stage.off('mouseup');
      this.stage.off('mousemove');

      if(this.lastEvent != null) {
        console.log(this.lastEvent)
        this.lastEvent.target.style.background = "#ffffff";
      }
      this.lastEvent = event;

      let line : any;
      let isNowDrawing = false;

      if(this.currentSelector != "line"){
        this.currentSelector = "line";
        event.target.style.background = "#62666846";
        this.layer.getChildren().forEach(function(node:any){
          node.draggable(false);
        });
      }
      else {
        this.currentSelector = "screen";
        event.target.style.background = "#ffffff";
        return;
      }

      this.stage.on("mousedown",()=>{
        line = new Konva.Line();
        isNowDrawing = true;
        let pos = this.stage.getPointerPosition();
        line.points([pos.x,pos.y,pos.x,pos.y]);
        line.stroke("black");
        line.strokeWidth(5);
        line.lineCap("round");
        line.lineJoin("round");
        this.layer.add(line).batchDraw();
      });

      this.stage.on("mousemove",()=>{
        if(isNowDrawing) {
          let pos = this.stage.getPointerPosition();
          line.points()[2]=pos.x;
          line.points()[3]=pos.y;
          line.lineCap("round");
          line.lineJoin("round");
          this.layer.batchDraw();
        }
      });

      this.stage.on("mouseup",()=>{
        this.postGenerateID(line,"LineSegment");
        isNowDrawing=false;
      });

    }

    // draw polygon
    public drawPolygon(event : any) {

      this.stage.off('mousedown');
      this.stage.off('mouseup');
      this.stage.off('mousemove');

      if(this.lastEvent != null) {
        console.log(this.lastEvent)
        this.lastEvent.target.style.background = "#ffffff";
      }
      this.lastEvent = event;

      let polygon : any;
      let isNowDrawing = false;

      if(this.currentSelector != "line"){
        this.currentSelector = "line";
        event.target.style.background = "#62666846";
        this.layer.getChildren().forEach(function(node:any){
          node.draggable(false);
        });
      }
      else {
        this.currentSelector = "screen";
        event.target.style.background = "#ffffff";
        return;
      }

      this.stage.on("mousedown",()=>{
        polygon = new Konva.RegularPolygon();
        isNowDrawing = true;
        let pos = this.stage.getPointerPosition();
        polygon.x(pos.x);
        polygon.y(pos.y);
        polygon.sides(5);
        polygon.radius(0);
        polygon.fill("white");
        polygon.stroke("grey");
        this.layer.add(polygon).batchDraw();
      });

      this.stage.on("mousemove",()=>{
        if(isNowDrawing) {
          let pos = this.stage.getPointerPosition();
          polygon.width(pos.x - polygon.x());
          polygon.height(pos.y - polygon.y());
          this.layer.batchDraw();
        }
      });

      this.stage.on("mouseup",()=>{
        this.postGenerateID(polygon,"RegularPolygon");
        isNowDrawing=false;
      });

    }

  */
}