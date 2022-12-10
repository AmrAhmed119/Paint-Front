import { Component, OnInit } from '@angular/core';
import {KonvaModule} from "ng2-konva";
import {KonvaComponent} from "ng2-konva";
import { Konva } from "konva/cmj/_FullInternals";
import { Layer } from 'konva/cmj/Layer';
import { max } from 'rxjs';
import { ShapeService } from './shape-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{

  title = 'Paint';
  layer : any;
  stage : any;
  transfom : any;
  currentSelector = "screen";
  lastEvent : any;

  constructor(private service : ShapeService) {}

  ngOnInit(): void {

    let width = 1100;
    let height = 600;
    this.stage = new Konva.Stage({
      container: 'board',
      width: width,
      height: height,
    });
    this.transfom = new Konva.Transformer();
    this.layer = new Konva.Layer();
    this.layer.add(this.transfom);
    this.stage.add(this.layer);

    this.stage.on("click", (event : any) => {
      if(this.currentSelector !== "screen") {
        return;
      }
      console.log("click triggered");
      this.stage.off('mousedown');
      this.stage.off('mouseup');
      this.stage.off('mousemove');
      let id = event.target.attrs.id;
      console.log("id = ");
      console.log(id);
      if(id != undefined && id != null){
        let shape=event.target;
        this.transfom.nodes([shape]);
        shape.draggable(true);
        console.log(shape.draggable());
      }
      else {
        this.transfom.nodes([]);
      }
    });
    

  }

  // get the shape id (unique) from back-end (request)
  public postGenerateID(shape : any, shapeType : string){
    let convertJson = JSON.parse(shape.toJSON());
    convertJson['type'] = shapeType;
    this.service.saveShape(convertJson).subscribe((responseData) => {
        console.log(responseData);
        shape.id('#'.concat(responseData));
      }
    );
  }

  // draw the selected shape
  public drawShape(event : any) {

    this.stage.off('mousedown');
    this.stage.off('mouseup');
    this.stage.off('mousemove');

    let type = this.getType(event);

    if(this.lastEvent != null) {
      this.lastEvent.target.style.background = "#ffffff";
    }
    this.lastEvent = event;

    if(this.currentSelector != type){
      this.currentSelector = type;
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

    let shape : any;
    let isNowDrawing = false;

    this.stage.on("mousedown",()=>{
      shape = this.getShape(type);
      isNowDrawing = true;
      let pos = this.stage.getPointerPosition();
      shape.fillEnabled(true);
      shape.x(pos.x);
      shape.y(pos.y);
      shape.stroke("black");
      shape.strokeWidth(2);

      if(type === "Rectangle" || type === "Square") {
        shape.width(0);
        shape.height(0);
      } 
      else if(type === "Circle") {
        shape.radius(0);
      } 
      else if(type === "Ellipse") {
        shape.radiusX(0);
        shape.radiusY(0);
      } 
      else if(type === "Triangle") {
        shape.sides(3);
        shape.radius(0);
      } 
      else if(type === "RegularPolygon") {
        shape.sides(5);
        shape.radius(0);
      }

      this.layer.add(shape).batchDraw();
    });

    this.stage.on("mousemove",()=>{
      if(isNowDrawing) {
        let pos = this.stage.getPointerPosition();

        if(type === "Rectangle" || type === "Triangle" || type === "RegularPolygon") {
          shape.width(pos.x - shape.x());
          shape.height(pos.y - shape.y());
        } 
        else if(type === "Square") {
          const to = Math.max(pos.x,pos.y);
          shape.width(to - shape.x());
          shape.height(shape.width());
        } 
        else if(type === "Circle") {
          const rise = Math.pow(pos.y - shape.y(), 2);
          const run = Math.pow(pos.x - shape.x(), 2);
          const newRadius = Math.sqrt(rise * run);
          shape.radius(newRadius/400);
        } 
        else if(type === "Ellipse") {
          shape.radiusX(Math.abs(pos.x - shape.x()));
          shape.radiusY(Math.abs(pos.y - shape.y()));
        } 
  
        this.layer.batchDraw();
      }
    });

    this.stage.on("mouseup",()=>{
      this.postGenerateID(shape,type);
      this.transfom.nodes([shape]);
      isNowDrawing=false;
    });

    console.log(type);
  }

  //get type
  public getType(event : any) {
    let shape = event.srcElement.innerText;
    let type : any;

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

  // return shape
  public getShape(shape : string) {
    let choosenShape : any;
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

    if(this.currentSelector != "FreeHand"){
      this.currentSelector = "FreeHand";
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
      line.strokeWidth(5);
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
      this.transfom.nodes([line]);
      alert(this.transfom);
      this.stage.draw();
      isNowDrawing=false;
      this.stage.off('mousedown');
      this.stage.off('mouseup');
      this.stage.off('mousemove');
      console.log(line.points())
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

  public select(event : any) {

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
