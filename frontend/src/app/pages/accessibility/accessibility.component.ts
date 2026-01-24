import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accessibility',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accessibility.component.html',
  styleUrl: './accessibility.component.css'
})
export class AccessibilityComponent {
  lastUpdated = '24 Gennaio 2026';
}
