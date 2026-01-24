import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-policy.component.html',
  styleUrl: './cookie-policy.component.css'
})
export class CookiePolicyComponent {
  lastUpdated = '24 Gennaio 2026';
}
