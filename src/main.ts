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
    provideToastr({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
      enableHtml: true,
      toastClass: 'ngx-toastr-custom',
      titleClass: 'toast-title-custom',
      messageClass: 'toast-message-custom',
      easing: 'ease-in-out',
      easeTime: 300,
      tapToDismiss: true,
      newestOnTop: true,
      maxOpened: 5,
      autoDismiss: true,
      resetTimeoutOnDuplicate: true,
      includeTitleDuplicates: false,
      iconClasses: {
        error: 'toast-error-icon',
        info: 'toast-info-icon',
        success: 'toast-success-icon',
        warning: 'toast-warning-icon'
      }
    }), // Add Toastr provider with custom configuration
  ],
}).catch((err) => console.error(err))
