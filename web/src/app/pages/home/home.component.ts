import { AsyncPipe, NgIf } from "@angular/common";
import {
	Component,
	Signal,
	WritableSignal,
	computed,
	signal,
} from "@angular/core";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { AuthService, User } from "@auth0/auth0-angular";
import { EventType } from "@common/event";
import { AuthButtonComponent } from "@components/auth/auth-button/auth-button.component";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from "@services/api.service";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { EventBusService } from "@services/eventbus.service";

@Component({
	selector: "app-home",
	standalone: true,
	imports: [NgIf, AsyncPipe, AuthButtonComponent],
	templateUrl: "./home.component.html",
	styles: "",
})
export class HomeComponent {
	msg = "";

	constructor(
		public auth: AuthService,
		public api: ApiService,
		private eventbus: EventBusService,
	) {
		console.log(window.origin);
		const obs = this.eventbus.observe<{ foo: string; bar: number }>(
			EventType.EXAMPLE,
		);
		obs.subscribe((res) => console.log(res));
	}

	async testAuth() {
		try {
			const [authenticated, authorized] = await Promise.all([
				this.api.exampleAuth(),
				this.api.exampleAuthScope(),
			]);

			this.msg = `User is ${authenticated.success ? "" : "not"} authenticated and ${authorized.success ? "" : "not"} authorized`;
		} catch (e) {
			console.error(e);
		}
	}
}
