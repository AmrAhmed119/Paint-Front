import { TestBed } from '@angular/core/testing';

import { ShapeServiceService } from './shape-service.service';

describe('ShapeServiceService', () => {
  let service: ShapeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShapeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
