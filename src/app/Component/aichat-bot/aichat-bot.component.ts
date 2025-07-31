import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ServiceFlowService } from '../../Services/service-flow.service';

interface StepObject {
  heading: string;
  subSteps: { [key: string]: string };
}

@Component({
  selector: 'app-aichat-bot',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './aichat-bot.component.html',
  styleUrl: './aichat-bot.component.css'
})
export class AIChatBotComponent {
  userInput: string = '';
  userName = '';
  isNameAsked = true;
  step1 = true;
  services = ['service1', 'service2', 'service3'];
  stepsData: Array<{ [key: string]: string | StepObject }> = [];
  // stepsData = [];
  // stepsData=[{
  //   step1:'Client',
  //   step2:'LB',
  //   step3:'EIS',
  //   step4:'CBS',
  //   step5:'DB'
  // }]

  messages: { text?: string, sender: 'user' | 'bot', renderCanvas?: boolean }[] = [];

  @ViewChild('chatBody') chatBody!: ElementRef;
  // @ViewChild('flowCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChildren('canvasElem') canvasElems!: QueryList<ElementRef<HTMLCanvasElement>>;

  private ctx!: CanvasRenderingContext2D;

  constructor(private serviceFlow: ServiceFlowService) {
    this.messages.push({ text: 'Please enter your name:', sender: 'bot' });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  handleUserInput() {
    const input = this.userInput.trim();
    if (!input) return;

    this.messages.push({ text: input, sender: 'user' });

    if (this.isNameAsked) {
      this.userName = input;
      this.isNameAsked = false;
      this.botReply(`Hello ${this.userName}, how can I help you?`);
    } else {
      this.processInput(input);
    }

    this.userInput = '';
  }

  processInput(input: string) {
    const lower = input.toLowerCase();

    if (lower.includes('service flow')) {
      this.step1 = false;
      this.botReply('Please Enter Service Name.');
      return;
    }

    if (this.step1 == false) {
      const matchedService = this.services.find(service => lower.includes(service.toLowerCase()));
      if (matchedService) {
        this.botReply(`Service Flow for ${matchedService}:`);
        this.serviceFlow.serviceFlow(matchedService).subscribe((data) => {
          this.stepsData = data;
          this.messages.push({
            sender: 'bot',
            renderCanvas: true
          });
          setTimeout(() => {
            const canvas = this.canvasElems?.last?.nativeElement;
            if (canvas) {
              this.ctx = canvas.getContext('2d')!;
              this.clearCanvas(canvas);
              this.drawFlow(canvas);  
            }
          }, 0);

          console.log('Flow loaded:', data);
        });
      }
      else{
        this.botReply('Sorry!! No Service Found....');
      }
      // Push a message with renderCanvas flag


      // Wait until canvas renders in DOM

    } else {
      this.botReply('Sorry!!! Please try something else.');
    }
  }

  botReply(text: string) {
    this.messages.push({ text, sender: 'bot' });
  }

  scrollToBottom() {
    try {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    } catch (err) { }
  }

  clearCanvas(canvas: HTMLCanvasElement) {
    if (this.ctx && canvas) {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  drawFlow(canvas: HTMLCanvasElement) {
  const stepsObj = this.stepsData[0];
  const steps = Object.keys(stepsObj)
    .filter(key => key.startsWith('step') && stepsObj[key])
    .map(key => stepsObj[key]);

  const boxWidth = 100;
  const boxHeight = 50;
  const startX = 30;
  const startY = 150;
  const gapX = 140;
  const subGapY = 70;

  this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  this.ctx.font = '14px Arial';
  this.ctx.textAlign = 'center';
  this.ctx.textBaseline = 'middle';

  let currentX = startX;
  const baseY = startY;

  steps.forEach((step, stepIndex) => {
    const nextStep = steps[stepIndex + 1];

    if (typeof step === 'string') {
      // Draw main step
      this.drawBox(currentX, baseY, boxWidth, boxHeight, '#bbdefb', '#1976d2', step);

      // Arrow to next step
      if (nextStep) {
        const toX = currentX + boxWidth + gapX - 20;
        const toY = baseY + boxHeight / 2;
        this.drawArrow(currentX + boxWidth, toY, toX, toY);
      }

      currentX += gapX;

    } else if (typeof step === 'object' && step !== null && 'heading' in step && 'subSteps' in step) {
      const heading = step.heading;
      const subSteps = Object.values(step.subSteps);

      // Draw heading box
      this.drawBox(currentX, baseY, boxWidth, boxHeight, '#ffe082', '#f57f17', heading);

      // Connect previous step to heading
      if (stepIndex > 0 && typeof steps[stepIndex - 1] === 'string') {
        const fromX = currentX - gapX + boxWidth;
        const fromY = baseY + boxHeight / 2;
        this.drawArrow(fromX, fromY, currentX, fromY);
      }

      // Coordinates for substeps
      const subX = currentX + boxWidth + 40;
      const totalHeight = (subSteps.length - 1) * subGapY;
      const startSubY = baseY - totalHeight / 2;

      subSteps.forEach((sub, idx) => {
        const subY = startSubY + idx * subGapY;

        // Draw substep box
        this.drawBox(subX, subY, boxWidth, boxHeight, '#c8e6c9', '#388e3c', sub);

        // Arrow from heading to substep
        this.drawArrow(currentX + boxWidth, baseY + boxHeight / 2, subX, subY + boxHeight / 2);

        // Arrow from substep to next main step
        if (nextStep && typeof nextStep === 'string') {
          const nextX = subX + boxWidth + 60;
          const nextY = baseY;
          this.drawArrow(subX + boxWidth, subY + boxHeight / 2, nextX, nextY + boxHeight / 2);
        }
      });

      // Move currentX past heading + substeps area
      currentX = subX + boxWidth + 60;
    }
  });
}

drawBox(x: number, y: number, width: number, height: number, fill: string, stroke: string, text: string) {
  this.ctx.fillStyle = fill;
  this.ctx.fillRect(x, y, width, height);
  this.ctx.strokeStyle = stroke;
  this.ctx.strokeRect(x, y, width, height);
  this.ctx.fillStyle = '#000';
  this.ctx.fillText(text, x + width / 2, y + height / 2);
}

drawArrow(fromX: number, fromY: number, toX: number, toY: number) {
  this.ctx.beginPath();
  this.ctx.moveTo(fromX, fromY);
  this.ctx.lineTo(toX, toY);
  this.ctx.stroke();

  const headlen = 6;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  this.ctx.beginPath();
  this.ctx.moveTo(toX, toY);
  this.ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
  this.ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
  this.ctx.lineTo(toX, toY);
  this.ctx.fill();
}



  downloadImage() {
    const canvas = this.canvasElems?.last?.nativeElement;
    if (!canvas) return;

    const imageUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'flowchart.png';
    link.click();
  }

}