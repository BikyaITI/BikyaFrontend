import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterOutlet } from "@angular/router"
import { NavbarComponent } from "./shared/components/navbar/navbar.component"
import { ChatbotComponent } from "./shared/components/chatbot/chatbot.component";
import { PublicProfileComponent } from "./features/public-profile/public-profile.component";


@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ChatbotComponent],
  template: `
    <app-navbar></app-navbar>
    <app-chatbot></app-chatbot>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  title = "Bikya Marketplace"
}
