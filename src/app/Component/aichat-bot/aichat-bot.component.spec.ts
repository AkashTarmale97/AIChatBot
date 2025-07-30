import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AIChatBotComponent } from './aichat-bot.component';

describe('AIChatBotComponent', () => {
  let component: AIChatBotComponent;
  let fixture: ComponentFixture<AIChatBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AIChatBotComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AIChatBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
