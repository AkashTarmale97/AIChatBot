import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

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
  step1=true;
  stepsData=[{
    step1:'Client',
    step2:'LB',
    step3:'EIS',
    step4:'CBS',
    step5:'DB'
  }]

  messages: { text?: string, sender: 'user' | 'bot', renderCanvas?: boolean }[] = [];

  @ViewChild('chatBody') chatBody!: ElementRef;
  @ViewChild('flowCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  constructor() {
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
      this.step1=false;
      this.botReply('Please Enter Service Name.');
      return;
    }

    if (lower.includes('service 1') && this.step1==false) {
      this.botReply('Service Flow:');

      // Push a message with renderCanvas flag
      this.messages.push({
        sender: 'bot',
        renderCanvas: true
      });

      // Wait until canvas renders in DOM
      setTimeout(() => {
        const canvas = this.canvasRef?.nativeElement;
        if (canvas) {
          this.ctx = canvas.getContext('2d')!;
          this.drawFlow();
        }
      }, 0);
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
    } catch (err) {}
  }

  drawFlow() {
    const stepsObj = this.stepsData[0]; // Assuming single object
    const steps = Object.values(stepsObj);
    // const steps = ['Step 1', 'Step 2', 'Step 3', 'Step 4'];
    const boxWidth = 100;
    const boxHeight = 50;
    const startX = 30;
    const startY = 70;
    const gap = 40;

    steps.forEach((step, i) => {
      const x = startX + i * (boxWidth + gap);

      this.ctx.fillStyle = '#bbdefb';
      this.ctx.fillRect(x, startY, boxWidth, boxHeight);

      this.ctx.strokeStyle = '#1976d2';
      this.ctx.strokeRect(x, startY, boxWidth, boxHeight);

      this.ctx.fillStyle = '#000';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(step, x + boxWidth / 2, startY + boxHeight / 2 + 5);

      if (i < steps.length - 1) {
        const arrowStartX = x + boxWidth;
        const arrowY = startY + boxHeight / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(arrowStartX, arrowY);
        this.ctx.lineTo(arrowStartX + gap - 10, arrowY);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(arrowStartX + gap - 10, arrowY - 5);
        this.ctx.lineTo(arrowStartX + gap, arrowY);
        this.ctx.lineTo(arrowStartX + gap - 10, arrowY + 5);
        this.ctx.fill();
      }
    });
  }

  downloadImage() {
    const canvas = this.canvasRef.nativeElement;
    const imageUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'flowchart.png';
    link.click();
  }
}
