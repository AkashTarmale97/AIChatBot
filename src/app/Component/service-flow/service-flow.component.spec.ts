import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceFlowComponent } from './service-flow.component';

describe('ServiceFlowComponent', () => {
  let component: ServiceFlowComponent;
  let fixture: ComponentFixture<ServiceFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceFlowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServiceFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
