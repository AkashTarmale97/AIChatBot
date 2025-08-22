import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatBotService } from '../../Services/chat-bot.service';
import html2canvas from 'html2canvas';  // ✅ Import html2canvas
import domtoimage from 'dom-to-image-more';

interface StepObject {
  heading: string;
  subSteps?: { [key: string]: string };
}

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css']
})
export class ChatBotComponent {
  serviceName = '';
  flowSteps: (string | StepObject)[] = [];

  @ViewChild('flowContainer') flowContainer!: ElementRef;

  constructor(private chatBotService: ChatBotService) {}

  fetchFlow() {
    if (!this.serviceName.trim()) return;

    this.chatBotService.getServiceFlow(this.serviceName).subscribe({
      next: (data) => {
        this.flowSteps = Object.keys(data || {})
          .filter(key => key.startsWith('step'))
          .map(key => {
            const step = data[key];
            if (typeof step === 'string' && step.trim() !== '') {
              return step.trim();
            }

            if (step && typeof step === 'object') {
              const stepObj = step as StepObject;
              const hasHeading = !!stepObj.heading?.trim();
              const hasSubSteps = stepObj.subSteps && Object.values(stepObj.subSteps).some(s => s?.trim());

              if (hasHeading || hasSubSteps) {
                return stepObj;
              }
            }

            return null;
          })
          .filter(step => step !== null) as (string | StepObject)[];
      },
      error: (err) => {
        console.error('Error fetching flow:', err);
        this.flowSteps = [];
      }
    });
  }

  isObject(value: any): value is StepObject {
    return value !== null && typeof value === 'object';
  }

generateImage() {
  if (!this.flowContainer) return;

  const node = this.flowContainer.nativeElement;

  // Save original overflow
  const originalOverflow = node.style.overflow;
  node.style.overflow = 'visible';

  // ✅ Add debug border
  node.style.border = '3px solid red';

  // ✅ Use scrollHeight for full content capture
  const width = node.scrollWidth;
  const height = node.scrollHeight;

  // Optional: log dimensions
  console.log('Canvas size:', width, height);

  setTimeout(() => {
    html2canvas(node, {
      backgroundColor: '#ffffff',
      scale: 2,
      scrollX: 0,
      scrollY: 0,
      width: width,
      height: height,
      useCORS: true
    }).then((canvas: HTMLCanvasElement) => {
      console.log('Canvas actual size:', canvas.width, canvas.height);
      const link = document.createElement('a');
      link.download = `${this.serviceName}_flowchart.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      // Clean up
      node.style.overflow = originalOverflow;
      node.style.border = '';
    }).catch(err => {
      console.error('Image generation failed:', err);
      node.style.overflow = originalOverflow;
      node.style.border = '';
    });
  }, 300);
}

}
