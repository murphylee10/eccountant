import { Component, OnInit } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'layout-sidebar',
  standalone: true,
  imports: [CommonModule, MenuModule, AvatarModule, RippleModule],
  templateUrl: './sidebar.component.html',
  styles: ``,
})
export class SidebarComponent implements OnInit {
  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Main',
        items: [
          { label: 'Dashboard', icon: 'pi pi-home' },
          { label: 'Balance', icon: 'pi pi-dollar' },
          { label: 'Cards', icon: 'pi pi-credit-card' },
          { label: 'Transactions', icon: 'pi pi-list' },
          { label: 'Recipients', icon: 'pi pi-users' },
        ],
      },
      {
        label: 'Other',
        items: [
          { label: 'Integrations', icon: 'pi pi-sitemap' },
          { label: 'Settings', icon: 'pi pi-cog' },
          { label: 'Get Help', icon: 'pi pi-question-circle' },
        ],
      },
    ];
  }
}
