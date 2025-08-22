import { Routes } from '@angular/router';
import { AIChatBotComponent } from './Component/aichat-bot/aichat-bot.component';
import { ServiceFlowComponent } from './Component/service-flow/service-flow.component';
import { ChatBotComponent } from './Component/chat-bot/chat-bot.component';

export const routes: Routes = [
    {
        path:'',
        pathMatch:'full',
        redirectTo:'chatbot'
    },
    {
        path:'chatbot',
        component:AIChatBotComponent
    },
    {
        path:'service',
        component:ServiceFlowComponent
    },
    {
        path:"flow",
        component:ChatBotComponent
    }
];
