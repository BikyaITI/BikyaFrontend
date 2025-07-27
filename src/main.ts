import { bootstrapApplication } from "@angular/platform-browser"
import { AppComponent } from "./app/app.component"
import { provideRouter } from "@angular/router"
import { provideHttpClient, withInterceptors } from "@angular/common/http"
import { importProvidersFrom } from "@angular/core"
import { ReactiveFormsModule } from "@angular/forms"
import { routes } from "./app/app.routes"
import { authInterceptor } from "./app/core/interceptors/auth.interceptor"
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(ReactiveFormsModule),
    provideAnimations(), // Add animations provider for ngx-toastr
    provideToastr(), // Add Toastr provider for standalone components
  ],
}).catch((err) => console.error(err))
