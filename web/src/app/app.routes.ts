import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LinksComponent } from '@pages/links/links.component';
import { authGuard } from './utils/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'accounts', component: LinksComponent, canActivate: [authGuard] },
  { path: '**', component: HomeComponent },
];
