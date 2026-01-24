import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cookie-consent.component.html',
  styleUrl: './cookie-consent.component.css'
})
export class CookieConsentComponent implements OnInit {
  showBanner = false;
  showSettings = false;

  preferences = {
    necessary: true,  // Always true, cannot be disabled
    functional: false,
    analytics: false
  };

  ngOnInit() {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => {
        this.showBanner = true;
      }, 1000);
    }
  }

  acceptAll() {
    this.preferences = {
      necessary: true,
      functional: true,
      analytics: true
    };
    this.savePreferences();
  }

  rejectAll() {
    this.preferences = {
      necessary: true,  // Necessary cookies always enabled
      functional: false,
      analytics: false
    };
    this.savePreferences();
  }

  savePreferences() {
    const consent = {
      timestamp: new Date().toISOString(),
      preferences: this.preferences
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consent));
    this.showBanner = false;
    this.showSettings = false;
  }

  openSettings() {
    this.showSettings = true;
  }

  closeSettings() {
    this.showSettings = false;
  }
}
