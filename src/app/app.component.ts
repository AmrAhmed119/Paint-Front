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

  constructor(private service : ShapeService) {}

  ngOnInit(): void {

    let width = 1000;
    let height = 500;
    this.stage = new Konva.Stage({
      container: 'board',
      width: width,
      height: height,
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

  }

  // Request function
  public postGenerateID(shape : any, shapeType : string){
    let convertJson = JSON.parse(shape.toJSON());
    convertJson['type'] = shapeType;
    this.service.saveShape(convertJson).subscribe((responseData) => {
      shape.id('#'.concat(responseData));
      }
    );
  }

  // draw Rectangle
  public drawRectangle() {

    this.stage.off('mousedown');
    this.stage.off('mouseup');
    this.stage.off('mousemove');

    let rectangle : any;
    let isNowDrawing = false;

    this.stage.on("mousedown",()=>{
      console.log("before");
      console.log(rectangle);
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
      console.log("after");
      console.log(rectangle);
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
      isNowDrawing=false;
      console.log(rectangle.width());
      this.postGenerateID(rectangle,"Rectangle");
      console.log(rectangle.id());
    });

  }

  // draw Circle
  public drawCircle() {

    this.stage.off('mousedown');
    this.stage.off('mouseup');
    this.stage.off('mousemove');

    let circle : any;
    let isNowDrawing = false;
    
    this.stage.on("mousedown",()=>{
      circle = new Konva.Circle();
      console.log(circle);
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
        circle.radius(newRadius/300);
        this.layer.batchDraw();
      }
    });

    this.stage.on("mouseup",()=>{
      this.postGenerateID(circle,"Circle");
      isNowDrawing=false;
    });

  }

  // draw ellipse
  public drawEllipse() {

    this.stage.off('mousedown');
    this.stage.off('mouseup');
    this.stage.off('mousemove');

    let ellipse : any;
    let isNowDrawing = false;
    
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
  public drawSquare() {

    this.stage.off('mousedown');
    this.stage.off('mouseup');
    this.stage.off('mousemove');

    let square : any;
    let isNowDrawing = false;

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
  public drawTriangle() {

    this.stage.off('mousedown');
    this.stage.off('mouseup');
    this.stage.off('mousemove');

    let triangle : any;
    let isNowDrawing = false;

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
      isNowDrawing=false;
    });

  }

  // free hand
  public freeHand() {

    this.stage.off('mousedown');
    this.stage.off('mouseup');
    this.stage.off('mousemove');

    let line : any;
    let isNowDrawing = false;
    
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
  public drawLine() {

    this.stage.off('mousedown');
    this.stage.off('mouseup');
    this.stage.off('mousemove');

    let line : any;
    let isNowDrawing = false;
    
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
  public drawPolygon() {

    this.stage.off('mousedown');
    this.stage.off('mouseup');
    this.stage.off('mousemove');

    let polygon : any;
    let isNowDrawing = false;

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


}
