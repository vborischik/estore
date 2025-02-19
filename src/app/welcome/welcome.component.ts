import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `<h1>Welcome to eStore!</h1>`,
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent { }