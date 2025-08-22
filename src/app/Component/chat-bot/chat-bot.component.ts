import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatBotService } from '../../Services/chat-bot.service';
import domtoimage from 'dom-to-image';

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
  flowSteps: (string | StepObject)[] = [];  // store filtered steps only

   @ViewChild('flowContainer') flowContainer!: ElementRef;

  constructor(private chatBotService: ChatBotService) {}

  fetchFlow() {
    if (!this.serviceName.trim()) return;

    this.chatBotService.getServiceFlow(this.serviceName).subscribe({
      next: (data) => {
        console.log('Fetched Flow:', data);

        this.flowSteps = Object.keys(data || {})
          .filter(key => key.startsWith('step'))
          .map(key => {
            const step = data[key];

            // ✅ Case 1: If it's a string and not empty
            if (typeof step === 'string' && step.trim() !== '') {
              return step.trim();
            }

            // ✅ Case 2: If it's an object with heading/substeps
            if (step && typeof step === 'object') {
              const stepObj = step as StepObject;

              // Skip empty heading & substeps
              const hasHeading = !!stepObj.heading?.trim();
              const hasSubSteps = stepObj.subSteps && Object.values(stepObj.subSteps).some(s => s?.trim());

              if (hasHeading || hasSubSteps) {
                return stepObj;
              }
            }

            // ❌ Skip empty steps
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

  domtoimage.toPng(node, {
    width: node.scrollWidth,      // full width
    height: node.scrollHeight,    // full height
    style: {
      'transform': 'scale(1)',
      'transform-origin': 'top left'
    }
  })
  .then((dataUrl: string) => {
    const link = document.createElement('a');
    link.download = `${this.serviceName}_flowchart.png`;
    link.href = dataUrl;
    link.click();
  })
  .catch((error: any) => console.error('Error generating image:', error));
}


}
