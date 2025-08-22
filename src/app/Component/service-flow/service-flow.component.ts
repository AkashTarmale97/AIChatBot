import { Component, ElementRef, ViewChild } from '@angular/core';
import { ServiceFlowService } from '../../Services/service-flow.service';
import mermaid from 'mermaid';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-flow',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './service-flow.component.html',
  styleUrls: ['./service-flow.component.css']
})
export class ServiceFlowComponent {
  serviceName: string = '';
  mermaidCode: string = '';
  errorMessage: string = '';

  @ViewChild('mermaidDiv', { static: false }) mermaidDiv!: ElementRef<HTMLDivElement>;

  constructor(private serviceFlowService: ServiceFlowService) {
    mermaid.initialize({ startOnLoad: false, theme: 'forest' });
  }

  fetchFlow(): void {
    if (!this.serviceName) {
      this.errorMessage = 'Please enter a service name';
      return;
    }
    this.errorMessage = '';

    this.serviceFlowService.serviceFlow(this.serviceName).subscribe({
      next: (data) => {
        if (data.length > 0) {
          const service = data[0];
          this.mermaidCode = this.generateMermaid(service);
          setTimeout(() => void this.renderMermaid(), 0); // async call
        } else {
          this.errorMessage = 'No flow found for this service';
          this.mermaidCode = '';
        }
      },
      error: (err) => {
        this.errorMessage = 'Error fetching service flow';
        console.error(err);
      }
    });
  }

  generateMermaid(service: any): string {
    let flow = 'graph LR;\n';

    // Step 1: Sort steps (step1, step2, ..., stepN)
    const stepKeys = Object.keys(service)
      .filter(key => key.startsWith('step') && service[key])
      .sort((a, b) => {
        const numA = parseInt(a.replace('step', ''), 10);
        const numB = parseInt(b.replace('step', ''), 10);
        return numA - numB;
      });

    let prevNodeId = '';

    // Helper to generate safe node IDs from labels
    const toId = (label: string): string =>
      label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    stepKeys.forEach((key) => {
      const step = service[key];

      // Case 1: Simple string node
      if (typeof step === 'string' && step.trim() !== '') {
        const currId = toId(step);
        flow += `${currId}["${step}"];\n`;
        if (prevNodeId) {
          flow += `${prevNodeId} --> ${currId};\n`;
        }
        prevNodeId = currId;
      }

      // Case 2: Object with heading + subSteps
      else if (typeof step === 'object' && step.heading) {
        const heading = step.heading;
        const headingId = toId(heading);
        flow += `${headingId}["${heading}"];\n`;

        if (prevNodeId) {
          flow += `${prevNodeId} --> ${headingId};\n`;
        }

        prevNodeId = headingId;

        // Draw links from heading to subSteps
        if (step.subSteps && typeof step.subSteps === 'object') {
          (Object.values(step.subSteps) as string[]).forEach((subStep) => {
            const subId = toId(subStep);
            flow += `${subId}["${subStep}"];\n`;
            flow += `${headingId} --> ${subId};\n`;
          });
        }
      }
    });

    return flow;
  }


  // ✅ Async rendering for Mermaid v10+
  async renderMermaid(): Promise<void> {
    if (this.mermaidDiv && this.mermaidCode) {
      try {
        mermaid.parseError = () => { }; // prevent crash on invalid code
        const result = await mermaid.render('mermaidChart', this.mermaidCode);
        this.mermaidDiv.nativeElement.innerHTML = result.svg;
      } catch (err) {
        console.error('Mermaid render error:', err);
      }
    }
  }
}
