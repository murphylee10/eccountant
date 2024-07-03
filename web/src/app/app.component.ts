import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EventBusService } from '@services/eventbus.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'web';

  constructor(private eventbus: EventBusService) {}
}
