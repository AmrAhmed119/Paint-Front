import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ShapeService {

  private shapeURL = 'http://localhost:8080/';

  constructor(private http:HttpClient) { }

  public saveShape(data : any) : Observable<any> {
    return this.http.post<any>(this.shapeURL + "POSTShape", data);
  }

  public getShapes() : Observable<any> {
    return this.http.get<any>(this.shapeURL + "GETDataBase");
  }
}
