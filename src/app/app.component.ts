import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterOutlet } from "@angular/router"
import { NavbarComponent } from "./shared/components/navbar/navbar.component"
import { PublicProfileComponent } from "./features/public-profile/public-profile.component";
import { ChatbotComponent } from "./shared/components/chatbot/chatbot.component";
import { FooterComponent } from "./shared/components/footer/footer.component";


@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ChatbotComponent, FooterComponent],
  template: `
   
       <div class="d-flex flex-column min-vh-100">
       <app-navbar></app-navbar>
  <main class="flex-grow-1">
    <router-outlet></router-outlet>
    <app-chatbot></app-chatbot>
  </main>
    <app-footer></app-footer>

</div>

  `,
})
export class AppComponent {
  title = "Bikya Marketplace"
}
