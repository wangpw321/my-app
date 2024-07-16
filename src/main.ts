import { bootstrapApplication } from '@angular/platform-browser';
import { HomeComponent } from './app/home/home.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

bootstrapApplication(HomeComponent, {
  providers: [provideAnimationsAsync()]
}).catch((err) => console.error(err));
