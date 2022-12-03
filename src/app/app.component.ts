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

  ngOnInit(): void {
    var width = 500;
    var height = 500;
    this.stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height,
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    throw new Error('Method not implemented.');
  }
  

  public rect() {

    var recta = new Konva.Rect({
    x : 50,
    y : 50,
    width: 100,
    height: 50,
    fill: 'green',
    stroke: 'black',
    strokeWidth: 5,
    draggable: true,
    });
    this.layer.add(recta);
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
