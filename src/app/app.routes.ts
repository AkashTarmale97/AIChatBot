import { Routes } from '@angular/router';
import { AIChatBotComponent } from './Component/aichat-bot/aichat-bot.component';

export const routes: Routes = [
    {
        path:'',
        pathMatch:'full',
        redirectTo:'chatbot'
    },
    {
        path:'chatbot',
        component:AIChatBotComponent
    }
];
