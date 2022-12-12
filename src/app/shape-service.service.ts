import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ShapeService {

  private shapeURL = 'http://localhost:9090/api/';

  constructor(private http: HttpClient) {
  }

  public getShapes(): Observable<any> {
    return this.http.get<any>(this.shapeURL + "GETDataBase");
  }

  public createShape(data: any): Observable<any> {
    return this.http.post<any>(this.shapeURL + "Create", data);
  }

  public updateShape(data: any) {
    this.http.post<any>(this.shapeURL + "Update", data).subscribe();
  }

  public copyShape(data: any): Observable<any> {
    return this.http.post<any>(this.shapeURL + "Copy", data);
  }

  public deleteShape(data: string) {
    this.http.post<any>(this.shapeURL + "Delete", data).subscribe();
  }

  public save(stage: any, type: any) {
    this.http.post(this.shapeURL + "Save",
      {
        jsonStage: stage,
        fileType: type
      }
    ).subscribe();
  }

  public undo(): Observable<any> {
    return this.http.get<any>(this.shapeURL + "Undo");
  }

  public redo(): Observable<any> {
    return this.http.get<any>(this.shapeURL + "Redo");
  }

  public clear() {
    this.http.get<any>(this.shapeURL + "Clear").subscribe();
  }


}
