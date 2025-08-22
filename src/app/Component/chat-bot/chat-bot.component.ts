import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatBotService } from '../../Services/chat-bot.service';
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
  showDiagram = false;  // 👈 controls both diagram + download button

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
            if (typeof step === 'string' && step.trim()) return step.trim();
            if (step && typeof step === 'object') {
              const stepObj = step as StepObject;
              const hasHeading = !!stepObj.heading?.trim();
              const hasSubSteps =
                stepObj.subSteps && Object.values(stepObj.subSteps).some(s => s?.trim());
              if (hasHeading || hasSubSteps) return stepObj;
            }
            return null;
          })
          .filter(step => step !== null) as (string | StepObject)[];

        // Show diagram + button only if steps exist
        this.showDiagram = this.flowSteps.length > 0;
      },
      error: (err) => {
        console.error('Error fetching flow:', err);
        this.flowSteps = [];
        this.showDiagram = false;
      }
    });
  }

  isObject(value: any): value is StepObject {
    return value !== null && typeof value === 'object';
  }

  generateImage() {
    if (!this.flowContainer) return;

    const node = this.flowContainer.nativeElement;

    domtoimage.toPng(node, { bgcolor: '#ffffff' })
      .then((dataUrl: string) => {
        const link = document.createElement('a');
        link.download = `${this.serviceName}_flowchart.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err: unknown) => console.error('Image generation failed:', err));
  }
}
