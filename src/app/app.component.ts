import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AIChatBotComponent } from "./Component/aichat-bot/aichat-bot.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AIChatBotComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'AIChatBot';
}
