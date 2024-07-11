import { Component } from '@angular/core';
import type { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'layout-topbar',
  standalone: true,
  imports: [MenuModule, MenubarModule],
  templateUrl: './topbar.component.html',
  styles: '',
})
export class TopbarComponent {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'Preferences',
        icon: 'pi pi-cog',
        command: () => {
          this.navigateToPreferences();
        },
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        },
      },
    ];
  }

  navigateToPreferences() {
    // Navigation logic
  }

  logout() {
    // Logout logic
  }
}
