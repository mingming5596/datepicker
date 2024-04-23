import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DatePickerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent {
  title = 'datepicker';
  dateStart = '2024-01-01';
}
