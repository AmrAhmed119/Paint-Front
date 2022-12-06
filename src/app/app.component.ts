import { Component, OnInit } from '@angular/core';
import {KonvaModule} from "ng2-konva";
import {KonvaComponent} from "ng2-konva";
import { Konva } from "konva/cmj/_FullInternals";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  title = 'Paint';
  layer : any;
  stage : any;
  cnt = 1;
  num = "1";
  color = "red";
  shape : any;

  ngOnInit(): void {
    var width = 1000;
    var height = 500;
    this.stage = new Konva.Stage({
    container: 'board',
    width: width,
    height: height,
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }
  
  public clear() {

    this.shape = this.stage.findOne('#2');

    this.shape.destroy();

    console.log(this.shape);

  }

  public rect() {

    var recta = new Konva.Rect({
    x : 50,
    y : 50,
    width: 100,
    height: 50,
    fill: this.color,
    stroke: 'black',
    strokeWidth: 5,
    draggable: true,
    id: this.num
    });
    this.color = "green";
    this.cnt++;
    this.num =this.cnt.toString();
    this.layer.add(recta);
    console.log(this.cnt);

}

  circle() {

    let ccircle = new Konva.Circle({
      x: 200,
      y: 200,
      radius: 50,
      fill: 'orange',
      stroke: 'blue',
      strokeWidth: 7,
      draggable: true,
    });
    this.layer.add(ccircle);
    
  }

  square() {
    var recta = new Konva.Rect({
      x : 50,
      y : 50,
      width: 100,
      height: 100,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 5,
      draggable: true,
      });
      this.layer.add(recta);

  }

  polygon() {
    var hexagon = new Konva.RegularPolygon({
      x: 100,
      y: 150,
      sides: 6,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      draggable: true,
      strokeWidth: 4,
    });
    this.layer.add(hexagon);
  }
}
