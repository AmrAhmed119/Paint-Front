import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ExpressionService {

  private shapeURL = 'http://localhost:9090/shape';


  constructor(private http:HttpClient) { }

  public saveShape(data : string) : Observable<any> {
    return this.http.post<any>(this.shapeURL,data);
  }


}
